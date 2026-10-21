import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trainingClasses, classRoster, members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySystemUserSessionToken } from "@/lib/auth-session";

async function verifyAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  const user = await verifySystemUserSessionToken(session?.value);
  return user;
}

// 1. GET: Ambil daftar siswa per kelas atau keseluruhan roster
export async function GET(request: Request) {
  const user = await verifyAuthorized();
  if (!user) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const classIdParam = searchParams.get("classId");

    const query = db.select().from(classRoster);
    const rosters = classIdParam
      ? await query.where(eq(classRoster.classId, parseInt(classIdParam, 10)))
      : await query;

    return NextResponse.json({ success: true, rosters });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Tambahkan / Daftarkan siswa ke dalam kelas (dengan Anti-Duplicate Guard)
export async function POST(request: Request) {
  const user = await verifyAuthorized();
  if (!user || user.role === "coach") {
    return NextResponse.json({ error: "Akses ditolak: Hanya Admin dan Staf yang dapat mengelola roster siswa." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { classId, memberId, forceTransfer = false } = body;

    if (!classId || !memberId) {
      return NextResponse.json({ error: "ID Kelas dan ID Siswa (memberId) wajib disertakan." }, { status: 400 });
    }

    const targetClassId = parseInt(String(classId), 10);

    // Ambil data kelas target
    const [targetClass] = await db
      .select()
      .from(trainingClasses)
      .where(eq(trainingClasses.id, targetClassId));

    if (!targetClass) {
      return NextResponse.json({ error: "Kelas target tidak ditemukan." }, { status: 404 });
    }

    // Ambil data anggota
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.memberId, memberId));

    if (!member) {
      return NextResponse.json({ error: "Data anggota tidak ditemukan." }, { status: 404 });
    }

    // Cek kuota kelas
    const existingInTargetClass = await db
      .select()
      .from(classRoster)
      .where(eq(classRoster.classId, targetClassId));

    if (existingInTargetClass.length >= targetClass.maxCapacity) {
      return NextResponse.json(
        { error: `Kuota kelas '${targetClass.className}' sudah penuh (Maks: ${targetClass.maxCapacity} siswa).` },
        { status: 400 }
      );
    }

    // =========================================================================
    // ANTI-DUPLICATE CLASS GUARD:
    // Pastikan siswa tidak terdaftar di dua kelas secara bersamaan!
    // =========================================================================
    const existingEnrollments = await db
      .select()
      .from(classRoster)
      .where(eq(classRoster.memberId, memberId));

    if (existingEnrollments.length > 0) {
      const alreadyInTarget = existingEnrollments.some((r) => r.classId === targetClassId);
      if (alreadyInTarget) {
        return NextResponse.json(
          { error: `Siswa '${member.fullName}' sudah terdaftar di kelas '${targetClass.className}'.` },
          { status: 400 }
        );
      }

      // Siswa terdaftar di kelas lain
      const oldClassId = existingEnrollments[0].classId;
      const [oldClass] = await db
        .select()
        .from(trainingClasses)
        .where(eq(trainingClasses.id, oldClassId));

      const oldClassName = oldClass ? oldClass.className : `Kelas #${oldClassId}`;

      if (!forceTransfer) {
        // Peringatkan admin/staf tentang duplikasi dan tawarkan opsi pindah jadwal
        return NextResponse.json(
          {
            duplicateDetected: true,
            error: `DUPLIKAT DITOLAK: Siswa '${member.fullName}' saat ini sudah aktif di kelas '${oldClassName}'. Apakah Anda ingin memindahkan siswa ini ke '${targetClass.className}'?`,
            currentClassName: oldClassName,
            currentClassId: oldClassId,
            memberId: member.memberId,
            memberName: member.fullName,
          },
          { status: 409 }
        );
      } else {
        // Lakukan pemindahan atomik (hapus dari kelas lama)
        await db.delete(classRoster).where(eq(classRoster.memberId, memberId));
      }
    }

    // Masukkan ke kelas baru
    const [newEntry] = await db
      .insert(classRoster)
      .values({
        classId: targetClassId,
        memberId: member.memberId,
        memberName: member.fullName,
        ageCategory: member.ageCategory,
        participantAge: member.participantAge || null,
        assignedBy: user.fullName || user.username,
      })
      .returning();

    return NextResponse.json({
      success: true,
      entry: newEntry,
      message: `Siswa '${member.fullName}' berhasil didaftarkan ke kelas '${targetClass.className}'.`,
    });
  } catch (error: any) {
    console.error("Gagal menambahkan ke roster:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Keluarkan siswa dari kelas
export async function DELETE(request: Request) {
  const user = await verifyAuthorized();
  if (!user || user.role === "coach") {
    return NextResponse.json({ error: "Akses ditolak: Hanya Admin dan Staf yang dapat mengelola roster siswa." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const memberId = searchParams.get("memberId");
    const classId = searchParams.get("classId");

    if (id) {
      await db.delete(classRoster).where(eq(classRoster.id, parseInt(id, 10)));
      return NextResponse.json({ success: true, message: "Siswa berhasil dikeluarkan dari kelas." });
    }

    if (memberId && classId) {
      await db
        .delete(classRoster)
        .where(
          and(
            eq(classRoster.memberId, memberId),
            eq(classRoster.classId, parseInt(classId, 10))
          )
        );
      return NextResponse.json({ success: true, message: "Siswa berhasil dikeluarkan dari kelas." });
    }

    return NextResponse.json({ error: "ID roster atau kombinasi memberId dan classId wajib diisi." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
