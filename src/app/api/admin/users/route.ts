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

    const [newUser] = await db
      .insert(systemUsers)
      .values({
        username,
        fullName,
        role,
        email: email || null,
        phoneNumber: phoneNumber || null,
        specialty: specialty || null,
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

export async function PATCH(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib diisi." }, { status: 400 });
    }

    const [updated] = await db
      .update(systemUsers)
      .set({ status })
      .where(eq(systemUsers.id, parseInt(id, 10)))
      .returning();

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
