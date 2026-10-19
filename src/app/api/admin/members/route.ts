import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { members, memberInvoices, financeTransactions } from "@/db/schema";
import { generateMemberCredentials, getSafeNextMemberSequence } from "@/lib/account-generator";
import { desc, eq, or } from "drizzle-orm";

import { verifyAdminSessionToken } from "@/lib/auth-session";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return verifyAdminSessionToken(session?.value);
}

// 1. GET: Mengambil seluruh data anggota resmi VOCA
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

// 2. POST: Tambah anggota baru secara manual oleh Admin (Anti-Colliding Sequence)
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
        { error: "Nama lengkap, no HP, kategori, tipe program, dan cabang olahraga wajib diisi." },
        { status: 400 }
      );
    }

    // Ambil semua member yang ada untuk menghitung urutan aman
    const allExistingMembers = await db.select().from(members);
    const currentYear = new Date().getFullYear();
    let sequenceNumber = getSafeNextMemberSequence(allExistingMembers);

    // Double-check uniqueness loop
    let creds = generateMemberCredentials(sequenceNumber, currentYear);
    let collision = allExistingMembers.some(
      (m) => m.memberId === creds.memberId || m.username === creds.username
    );
    while (collision) {
      sequenceNumber++;
      creds = generateMemberCredentials(sequenceNumber, currentYear);
      collision = allExistingMembers.some(
        (m) => m.memberId === creds.memberId || m.username === creds.username
      );
    }

    const { username, password, memberId } = creds;
    const joinDate = new Date();
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Masa berlaku 30 hari

    const [newMember] = await db
      .insert(members)
      .values({
        memberId,
        username,
        password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email ? email.trim() : null,
        participantAge: participantAge ? parseInt(participantAge, 10) : null,
        ageCategory,
        programType,
        sportBranch,
        monthlyFee: monthlyFee ? parseInt(monthlyFee, 10) : 347000,
        joinDate,
        validUntil,
        status: "active",
        bloodType: bloodType || "O",
        emergencyContact: emergencyContact ? emergencyContact.trim() : null,
        notes: notes ? notes.trim() : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `Anggota ${fullName} berhasil didaftarkan dengan ID ${memberId} dan akun ${username}.`,
    });
  } catch (error: any) {
    console.error("Gagal menambahkan anggota:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data anggota.", details: error.message },
      { status: 500 }
    );
  }
}

// 3. PATCH: Update status, masa aktif, atau edit data anggota secara lengkap
export async function PATCH(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      status,
      extendMonths,
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
      validUntil,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID anggota wajib disertakan." }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (participantAge !== undefined) {
      updateData.participantAge = participantAge ? parseInt(participantAge, 10) : null;
    }
    if (ageCategory !== undefined) updateData.ageCategory = ageCategory;
    if (programType !== undefined) updateData.programType = programType;
    if (sportBranch !== undefined) updateData.sportBranch = sportBranch;
    if (monthlyFee !== undefined) updateData.monthlyFee = parseInt(monthlyFee, 10);
    if (bloodType !== undefined) updateData.bloodType = bloodType;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact ? emergencyContact.trim() : null;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    if (extendMonths) {
      const monthsToAdd = parseInt(extendMonths, 10);
      updateData.validUntil = new Date(Date.now() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
      updateData.status = "active";
    } else if (validUntil) {
      updateData.validUntil = new Date(validUntil);
    }

    const [updated] = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, parseInt(id, 10)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Anggota tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      member: updated,
      message: `Data anggota ${updated.fullName} berhasil diperbarui.`,
    });
  } catch (error: any) {
    console.error("Gagal update data anggota:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data anggota.", details: error.message },
      { status: 500 }
    );
  }
}

// 4. DELETE: Hapus anggota beserta relasi tagihan agar integritas terjaga
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

    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, parseInt(id, 10)));

    if (member) {
      // Hapus tagihan terkait anggota agar database bersih
      await db
        .delete(memberInvoices)
        .where(eq(memberInvoices.memberId, member.memberId));

      // Hapus anggota
      await db.delete(members).where(eq(members.id, parseInt(id, 10)));
    }

    return NextResponse.json({
      success: true,
      message: "Anggota dan data terkait berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Gagal menghapus anggota:", error);
    return NextResponse.json(
      { error: "Gagal menghapus anggota.", details: error.message },
      { status: 500 }
    );
  }
}
