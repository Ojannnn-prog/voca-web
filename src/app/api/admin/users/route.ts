import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { systemUsers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return session?.value === "authenticated_admin";
}

// 1. GET: Ambil seluruh daftar pengguna staf / pelatih
export async function GET() {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const users = await db.select().from(systemUsers).orderBy(desc(systemUsers.id));
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Tambah staf / pelatih baru
export async function POST(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, fullName, role, email, phoneNumber, specialty } = body;

    if (!username || !fullName || !role) {
      return NextResponse.json(
        { error: "Username, nama lengkap, dan role akun wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUser = username.trim().toLowerCase();
    const existing = await db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.username, cleanUser));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Username '${cleanUser}' sudah digunakan. Pilih username lain.` },
        { status: 400 }
      );
    }

    const [newUser] = await db
      .insert(systemUsers)
      .values({
        username: cleanUser,
        fullName: fullName.trim(),
        role,
        email: email ? email.trim() : null,
        phoneNumber: phoneNumber ? phoneNumber.trim() : null,
        specialty: specialty ? specialty.trim() : null,
        status: "active",
      })
      .returning();

    return NextResponse.json({
      success: true,
      user: newUser,
      message: `Akun ${fullName} (${role}) berhasil ditambahkan.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. PATCH: Update data staf / pelatih
export async function PATCH(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, fullName, role, email, phoneNumber, specialty } = body;

    if (!id) {
      return NextResponse.json({ error: "ID pengguna wajib disertakan." }, { status: 400 });
    }

    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (role !== undefined) updateFields.role = role;
    if (email !== undefined) updateFields.email = email ? email.trim() : null;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber ? phoneNumber.trim() : null;
    if (specialty !== undefined) updateFields.specialty = specialty ? specialty.trim() : null;

    const [updated] = await db
      .update(systemUsers)
      .set(updateFields)
      .where(eq(systemUsers.id, parseInt(id, 10)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updated,
      message: `Data akun ${updated.fullName} berhasil diperbarui.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE: Hapus pengguna
export async function DELETE(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID pengguna wajib disertakan." }, { status: 400 });
    }

    await db.delete(systemUsers).where(eq(systemUsers.id, parseInt(id, 10)));

    return NextResponse.json({
      success: true,
      message: "Akun staf/pelatih berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
