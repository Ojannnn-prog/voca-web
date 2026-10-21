import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { attendanceRecords } from "@/db/schema";
import { verifySystemUserSessionToken } from "@/lib/auth-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("voca_admin_session");
    const user = await verifySystemUserSessionToken(session?.value);

    if (!user) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const allRecords = await db.select().from(attendanceRecords);

    // 1. Rekapitulasi Berdasarkan Status Kehadiran
    const statusCounts = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
      total: allRecords.length,
    };

    // 2. Rekapitulasi Kehadiran Siswa per Kategori Usia
    const ageCategoryCounts: Record<string, { hadir: number; total: number }> = {
      "Balita": { hadir: 0, total: 0 },
      "Anak-anak": { hadir: 0, total: 0 },
      "Remaja": { hadir: 0, total: 0 },
      "Dewasa": { hadir: 0, total: 0 },
      "Casis TNI/Polri": { hadir: 0, total: 0 },
      "Terapi & Lainnya": { hadir: 0, total: 0 },
    };

    // 3. Rekapitulasi Kehadiran Pelatih (Coach) vs Anggota (Member)
    let coachAttendanceCount = 0;
    let memberAttendanceCount = 0;

    for (const rec of allRecords) {
      // Hitung status
      if (rec.status in statusCounts) {
        (statusCounts as any)[rec.status]++;
      }

      // Hitung tipe
      if (rec.targetType === "coach") {
        if (rec.status === "hadir") coachAttendanceCount++;
      } else {
        if (rec.status === "hadir") memberAttendanceCount++;

        // Hitung per kategori usia
        const cat = rec.ageCategory || "Anak-anak";
        let targetKey = "Anak-anak";
        if (cat.toLowerCase().includes("balita")) targetKey = "Balita";
        else if (cat.toLowerCase().includes("anak")) targetKey = "Anak-anak";
        else if (cat.toLowerCase().includes("remaja") || cat.toLowerCase().includes("junior")) targetKey = "Remaja";
        else if (cat.toLowerCase().includes("casis") || cat.toLowerCase().includes("tni") || cat.toLowerCase().includes("polri")) targetKey = "Casis TNI/Polri";
        else if (cat.toLowerCase().includes("dewasa")) targetKey = "Dewasa";
        else targetKey = "Terapi & Lainnya";

        if (!ageCategoryCounts[targetKey]) {
          ageCategoryCounts[targetKey] = { hadir: 0, total: 0 };
        }
        ageCategoryCounts[targetKey].total++;
        if (rec.status === "hadir") {
          ageCategoryCounts[targetKey].hadir++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        statusCounts,
        ageCategoryCounts,
        coachAttendanceCount,
        memberAttendanceCount,
        totalRecords: allRecords.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
