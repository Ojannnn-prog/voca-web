import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trainingClasses, classRoster } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { verifySystemUserSessionToken } from "@/lib/auth-session";

async function verifyAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  const user = await verifySystemUserSessionToken(session?.value);
  // Admin and Staff can manage classes; Coach can view
  return user;
}

// 1. GET: Ambil seluruh daftar kelas latihan
export async function GET() {
  const user = await verifyAuthorized();
  if (!user) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const classes = await db.select().from(trainingClasses).orderBy(desc(trainingClasses.id));
    const allRosters = await db.select().from(classRoster);

    // Hitung jumlah murid per kelas
    const classesWithCount = classes.map((cls) => {
      const rosterList = allRosters.filter((r) => r.classId === cls.id);
      return {
        ...cls,
        studentCount: rosterList.length,
        roster: rosterList,
      };
    });

    return NextResponse.json({ success: true, classes: classesWithCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Tambah kelas baru
export async function POST(request: Request) {
  const user = await verifyAuthorized();
  if (!user || user.role === "coach") {
    return NextResponse.json({ error: "Akses ditolak: Hanya Admin dan Staf yang dapat membuat kelas." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      className,
      classType = "reguler",
      ageGroup = "Anak-anak",
      sportBranch = "Renang & Akuatik",
      coachId,
      coachName,
      days,
      sessionTime,
      venue = "Kolam Renang VOCA",
      maxCapacity = 12,
      notes,
    } = body;

    if (!className || !coachName || !days || !sessionTime) {
      return NextResponse.json(
        { error: "Nama kelas, nama pelatih, hari latihan, dan jam sesi wajib diisi." },
        { status: 400 }
      );
    }

    const [newClass] = await db
      .insert(trainingClasses)
      .values({
        className: className.trim(),
        classType,
        ageGroup,
        sportBranch,
        coachId: coachId ? parseInt(String(coachId), 10) : null,
        coachName: coachName.trim(),
        days: typeof days === "string" ? days.trim() : JSON.stringify(days),
        sessionTime: sessionTime.trim(),
        venue: venue.trim(),
        maxCapacity: parseInt(String(maxCapacity), 10) || 12,
        notes: notes ? notes.trim() : null,
        status: "active",
      })
      .returning();

    return NextResponse.json({
      success: true,
      class: newClass,
      message: `Kelas '${newClass.className}' berhasil ditambahkan.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. PUT: Update data kelas
export async function PUT(request: Request) {
  const user = await verifyAuthorized();
  if (!user || user.role === "coach") {
    return NextResponse.json({ error: "Akses ditolak: Hanya Admin dan Staf yang dapat mengedit kelas." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      id,
      className,
      classType,
      ageGroup,
      sportBranch,
      coachId,
      coachName,
      days,
      sessionTime,
      venue,
      maxCapacity,
      notes,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID kelas wajib disertakan." }, { status: 400 });
    }

    const updateData: any = {};
    if (className !== undefined) updateData.className = className.trim();
    if (classType !== undefined) updateData.classType = classType;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup;
    if (sportBranch !== undefined) updateData.sportBranch = sportBranch;
    if (coachId !== undefined) updateData.coachId = coachId ? parseInt(String(coachId), 10) : null;
    if (coachName !== undefined) updateData.coachName = coachName.trim();
    if (days !== undefined) updateData.days = typeof days === "string" ? days.trim() : JSON.stringify(days);
    if (sessionTime !== undefined) updateData.sessionTime = sessionTime.trim();
    if (venue !== undefined) updateData.venue = venue.trim();
    if (maxCapacity !== undefined) updateData.maxCapacity = parseInt(String(maxCapacity), 10);
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db
      .update(trainingClasses)
      .set(updateData)
      .where(eq(trainingClasses.id, parseInt(String(id), 10)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      class: updated,
      message: `Kelas '${updated.className}' berhasil diperbarui.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE: Hapus kelas
export async function DELETE(request: Request) {
  const user = await verifyAuthorized();
  if (!user || user.role === "coach") {
    return NextResponse.json({ error: "Akses ditolak: Hanya Admin dan Staf yang dapat menghapus kelas." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID kelas wajib disertakan." }, { status: 400 });
    }

    const classIdNum = parseInt(id, 10);

    // Hapus juga roster kelas tersebut
    await db.delete(classRoster).where(eq(classRoster.classId, classIdNum));
    await db.delete(trainingClasses).where(eq(trainingClasses.id, classIdNum));

    return NextResponse.json({ success: true, message: "Kelas dan daftar siswa berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
