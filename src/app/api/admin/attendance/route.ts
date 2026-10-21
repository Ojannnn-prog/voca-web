import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { attendanceRecords } from "@/db/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";
import { verifySystemUserSessionToken } from "@/lib/auth-session";

async function verifyAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  const user = await verifySystemUserSessionToken(session?.value);
  // Admin, Staff, and Coach are all authorized for attendance
  if (user && (user.role === "admin" || user.role === "staff" || user.role === "coach")) {
    return user;
  }
  return null;
}

// 1. GET: Ambil riwayat presensi dengan berbagai filter
export async function GET(request: Request) {
  const currentUser = await verifyAuthorized();
  if (!currentUser) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType"); // "member" | "coach" | "all"
    const status = searchParams.get("status"); // "hadir" | "izin" | "sakit" | "alpha"
    const ageCategory = searchParams.get("ageCategory");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const month = searchParams.get("month"); // "01" - "12"
    const year = searchParams.get("year"); // "2026"

    const conditions: any[] = [];

    if (targetType && targetType !== "all") {
      conditions.push(eq(attendanceRecords.targetType, targetType));
    }

    if (status && status !== "all") {
      conditions.push(eq(attendanceRecords.status, status));
    }

    if (ageCategory && ageCategory !== "all") {
      conditions.push(eq(attendanceRecords.ageCategory, ageCategory));
    }

    if (startDateParam) {
      const start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(attendanceRecords.attendanceDate, start));
    }

    if (endDateParam) {
      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(attendanceRecords.attendanceDate, end));
    }

    if (year && !startDateParam && !endDateParam) {
      const y = parseInt(year, 10);
      if (month && month !== "all") {
        const m = parseInt(month, 10) - 1;
        const start = new Date(y, m, 1, 0, 0, 0);
        const end = new Date(y, m + 1, 0, 23, 59, 59);
        conditions.push(gte(attendanceRecords.attendanceDate, start));
        conditions.push(lte(attendanceRecords.attendanceDate, end));
      } else {
        const start = new Date(y, 0, 1, 0, 0, 0);
        const end = new Date(y, 11, 31, 23, 59, 59);
        conditions.push(gte(attendanceRecords.attendanceDate, start));
        conditions.push(lte(attendanceRecords.attendanceDate, end));
      }
    }

    const query = db.select().from(attendanceRecords);
    const records = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(attendanceRecords.attendanceDate))
      : await query.orderBy(desc(attendanceRecords.attendanceDate));

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    console.error("Gagal mengambil presensi:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Catat presensi baru (Scan QR atau Manual)
export async function POST(request: Request) {
  const currentUser = await verifyAuthorized();
  if (!currentUser) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      targetType = "member",
      targetId,
      targetName,
      classId,
      className,
      ageCategory,
      status = "hadir",
      scanMethod = "qr_code",
      notes,
    } = body;

    if (!targetId || !targetName) {
      return NextResponse.json(
        { error: "ID target dan Nama lengkap wajib disertakan." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Cek apakah sudah pernah presensi pada hari yang sama untuk target & kelas yang sama
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const existingToday = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.targetId, targetId),
          gte(attendanceRecords.attendanceDate, todayStart),
          lte(attendanceRecords.attendanceDate, todayEnd)
        )
      );

    if (existingToday.length > 0 && scanMethod === "qr_code") {
      // Jika scan QR berulang di hari yang sama, beritahu bahwa sudah terabsen
      return NextResponse.json({
        success: true,
        alreadyRecorded: true,
        record: existingToday[0],
        message: `${targetName} (${targetId}) sudah tercatat hadir hari ini pada pukul ${new Date(existingToday[0].checkInTime).toLocaleTimeString("id-ID")}.`,
      });
    }

    const [newRecord] = await db
      .insert(attendanceRecords)
      .values({
        targetType,
        targetId,
        targetName,
        classId: classId ? parseInt(String(classId), 10) : null,
        className: className || null,
        ageCategory: ageCategory || null,
        attendanceDate: now,
        status,
        checkInTime: now,
        scanMethod,
        recordedBy: currentUser.fullName || currentUser.username,
        notes: notes ? notes.trim() : null,
      })
      .returning();

    const statusLabel =
      status === "hadir"
        ? "HADIR"
        : status === "izin"
        ? "IZIN"
        : status === "sakit"
        ? "SAKIT"
        : "ALPHA";

    return NextResponse.json({
      success: true,
      record: newRecord,
      message: `Presensi ${statusLabel} berhasil dicatat untuk ${targetName} (${targetId}).`,
    });
  } catch (error: any) {
    console.error("Gagal mencatat presensi:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Hapus log presensi
export async function DELETE(request: Request) {
  const currentUser = await verifyAuthorized();
  if (!currentUser || currentUser.role === "coach") {
    // Coach is read-only / cannot delete logs
    return NextResponse.json({ error: "Akses ditolak: Hanya Staf / Admin yang dapat menghapus data presensi." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID presensi wajib disertakan." }, { status: 400 });
    }

    await db.delete(attendanceRecords).where(eq(attendanceRecords.id, parseInt(id, 10)));

    return NextResponse.json({ success: true, message: "Catatan presensi berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
