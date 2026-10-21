import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trainingClasses, classRoster, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySystemUserSessionToken } from "@/lib/auth-session";

async function verifyAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  const user = await verifySystemUserSessionToken(session?.value);
  return user;
}

export async function POST() {
  const user = await verifyAuthorized();
  if (!user || user.role === "coach") {
    return NextResponse.json({ error: "Akses ditolak: Hanya Admin dan Staf yang dapat menjalankan fitur auto-generate kelas." }, { status: 403 });
  }

  try {
    // 1. Ambil seluruh anggota berstatus aktif
    const allMembers = await db
      .select()
      .from(members)
      .where(eq(members.status, "active"));

    if (allMembers.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tidak ada anggota aktif yang ditemukan dalam database.",
        assignedCount: 0,
      });
    }

    // 2. Ambil seluruh roster yang sudah terdaftar untuk mencegah duplikasi (Anti-Duplicate)
    const existingRosters = await db.select().from(classRoster);
    const assignedMemberIdSet = new Set(existingRosters.map((r) => r.memberId));

    // Filter siswa yang BELUM terdaftar di kelas manapun
    const unassignedMembers = allMembers.filter((m) => !assignedMemberIdSet.has(m.memberId));

    if (unassignedMembers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Semua anggota aktif sudah terdaftar di kelas masing-masing. Tidak ada siswa yang tertinggal.",
        assignedCount: 0,
      });
    }

    // 3. Ambil seluruh kelas reguler yang aktif
    const activeClasses = await db
      .select()
      .from(trainingClasses)
      .where(eq(trainingClasses.status, "active"));

    if (activeClasses.length === 0) {
      return NextResponse.json({
        error: "Belum ada kelas reguler aktif yang dibuat. Silakan tambahkan kelas terlebih dahulu.",
      }, { status: 400 });
    }

    // Hitung sisa kuota per kelas
    const classCapacityMap = new Map<number, { current: number; max: number; ageGroup: string; classType: string }>();
    for (const cls of activeClasses) {
      const enrolledCount = existingRosters.filter((r) => r.classId === cls.id).length;
      classCapacityMap.set(cls.id, {
        current: enrolledCount,
        max: cls.maxCapacity,
        ageGroup: (cls.ageGroup || "").toLowerCase(),
        classType: cls.classType || "reguler",
      });
    }

    const newRosterInserts: any[] = [];

    // Helper pencocokan umur dan klasifikasi
    for (const member of unassignedMembers) {
      const age = member.participantAge || 10;
      const ageCategory = (member.ageCategory || "").toLowerCase();

      // Cari kelas yang cocok dan masih ada kuota
      let matchedClass = activeClasses.find((cls) => {
        const info = classCapacityMap.get(cls.id);
        if (!info || info.current >= info.max) return false;

        // Pencocokan kelompok usia
        if (age <= 4 || ageCategory.includes("balita")) {
          return info.ageGroup.includes("balita");
        } else if ((age >= 5 && age <= 12) || ageCategory.includes("anak")) {
          return info.ageGroup.includes("anak");
        } else if ((age >= 13 && age <= 17) || ageCategory.includes("remaja") || ageCategory.includes("junior")) {
          return info.ageGroup.includes("remaja") || info.ageGroup.includes("junior");
        } else if (ageCategory.includes("casis") || ageCategory.includes("tni") || ageCategory.includes("polri")) {
          return info.ageGroup.includes("casis") || info.ageGroup.includes("dewasa");
        } else {
          return info.ageGroup.includes("dewasa") || info.ageGroup.includes("semua");
        }
      });

      // Fallback: Jika tidak ada kelas kategori khusus yang tersisa kuota, masukkan ke kelas reguler mana saja yang masih muat
      if (!matchedClass) {
        matchedClass = activeClasses.find((cls) => {
          const info = classCapacityMap.get(cls.id);
          return info && info.current < info.max;
        });
      }

      if (matchedClass) {
        const info = classCapacityMap.get(matchedClass.id)!;
        info.current++;

        newRosterInserts.push({
          classId: matchedClass.id,
          memberId: member.memberId,
          memberName: member.fullName,
          ageCategory: member.ageCategory,
          participantAge: member.participantAge || null,
          assignedBy: `Auto-Generate (${user.username})`,
        });

        // Tandai member sudah di-assign agar tidak duplikat di loop ini
        assignedMemberIdSet.add(member.memberId);
      }
    }

    if (newRosterInserts.length > 0) {
      await db.insert(classRoster).values(newRosterInserts);
    }

    return NextResponse.json({
      success: true,
      assignedCount: newRosterInserts.length,
      unassignedRemaining: unassignedMembers.length - newRosterInserts.length,
      message: `Berhasil mendistribusikan ${newRosterInserts.length} siswa secara otomatis ke kelas yang sesuai tanpa duplikasi!`,
    });
  } catch (error: any) {
    console.error("Gagal auto-generate kelas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
