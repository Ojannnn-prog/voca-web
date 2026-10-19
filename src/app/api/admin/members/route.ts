import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { members } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return session?.value === "authenticated_admin";
}

// GET: Mengambil seluruh data anggota resmi VOCA
export async function GET() {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses ditolak. Silakan login sebagai administrator." },
      { status: 401 }
    );
  }

  try {
    const allMembers = await db
      .select()
      .from(members)
      .orderBy(desc(members.id));

    return NextResponse.json({ success: true, members: allMembers });
  } catch (error: any) {
    console.error("Gagal mengambil data members:", error);
    return NextResponse.json(
      { error: "Gagal memuat data anggota.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Tambah anggota baru secara manual oleh Admin
export async function POST(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses ditolak. Silakan login sebagai administrator." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      fullName,
      phoneNumber,
      email,
      participantAge,
      ageCategory,
      programType,
      sportBranch,
      monthlyFee,
      bloodType,
      emergencyContact,
      notes,
    } = body;

    if (!fullName || !phoneNumber || !ageCategory || !programType || !sportBranch) {
      return NextResponse.json(
        { error: "Nama lengkap, no HP, kategori, tipe program, dan cabang wajib diisi." },
        { status: 400 }
      );
    }

    // Generate unique memberId & credentials (membervoca<YEAR><x> & vocamember<YEAR>)
    const { generateMemberCredentials } = await import("@/lib/account-generator");
    const currentYear = new Date().getFullYear();
    const countResult = await db.select().from(members);
    const sequenceNumber = countResult.length + 1;
    const { username, password, memberId } = generateMemberCredentials(sequenceNumber, currentYear);

    const joinDate = new Date();
    // Masa berlaku default 30 hari ke depan
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [newMember] = await db
      .insert(members)
      .values({
        memberId,
        username,
        password,
        fullName,
        phoneNumber,
        email: email || null,
        participantAge: participantAge ? parseInt(participantAge, 10) : null,
        ageCategory,
        programType,
        sportBranch,
        monthlyFee: monthlyFee ? parseInt(monthlyFee, 10) : 347000,
        joinDate,
        validUntil,
        status: "active",
        bloodType: bloodType || "O",
        emergencyContact: emergencyContact || null,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `Anggota ${fullName} berhasil didaftarkan dengan ID ${memberId}.`,
    });
  } catch (error: any) {
    console.error("Gagal menambahkan anggota:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data anggota.", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update status anggota atau perpanjang masa aktif
export async function PATCH(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses ditolak." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, status, extendMonths } = body;

    if (!id) {
      return NextResponse.json({ error: "ID anggota wajib disertakan." }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }
    if (extendMonths) {
      const monthsToAdd = parseInt(extendMonths, 10);
      updateData.validUntil = new Date(Date.now() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
      updateData.status = "active";
    }

    const [updated] = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      member: updated,
      message: "Data anggota berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("Gagal update data anggota:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Hapus anggota
export async function DELETE(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });
    }

    await db.delete(members).where(eq(members.id, parseInt(id, 10)));

    return NextResponse.json({
      success: true,
      message: "Anggota berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menghapus anggota.", details: error.message },
      { status: 500 }
    );
  }
}
