import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { members, memberInvoices, financeTransactions } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { verifyAdminSessionToken, verifyMemberSessionToken } from "@/lib/auth-session";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("voca_admin_session");
    const memberSession = cookieStore.get("voca_member_session");

    const isAdmin = await verifyAdminSessionToken(adminSession?.value);
    const verifiedMemberId = await verifyMemberSessionToken(memberSession?.value);

    // Keamanan Ketat: Wajib login terlebih dahulu
    if (!isAdmin && !verifiedMemberId) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login terlebih dahulu untuk mengakses portal anggota." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier");

    // Jika member biasa, hanya boleh mengakses profil miliknya sendiri
    // Admin diperbolehkan menginspeksi akun anggota tertentu melalui identifier
    const targetMemberId = isAdmin && identifier ? identifier.trim() : verifiedMemberId || identifier?.trim();

    if (!targetMemberId) {
      return NextResponse.json(
        { error: "Identitas anggota tidak valid." },
        { status: 400 }
      );
    }

    const results = await db
      .select()
      .from(members)
      .where(
        or(
          eq(members.memberId, targetMemberId),
          eq(members.username, targetMemberId),
          eq(members.phoneNumber, targetMemberId)
        )
      )
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Data anggota tidak ditemukan dalam database." },
        { status: 404 }
      );
    }

    const memberRecord = results[0];

    // Ambil daftar tagihan anggota dari member_invoices
    const memberInvoicesList = await db
      .select()
      .from(memberInvoices)
      .where(eq(memberInvoices.memberId, memberRecord.memberId))
      .orderBy(desc(memberInvoices.id));

    // Ambil riwayat pembayaran dari finance_transactions
    const memberTransactions = await db
      .select()
      .from(financeTransactions)
      .where(eq(financeTransactions.memberId, memberRecord.memberId))
      .orderBy(desc(financeTransactions.transactionDate));

    return NextResponse.json({
      success: true,
      member: memberRecord,
      invoices: memberInvoicesList,
      transactions: memberTransactions,
    });
  } catch (error: any) {
    console.error("Gagal mengambil data profil anggota:", error);
    return NextResponse.json(
      { error: "Gagal memuat profil anggota.", details: error.message },
      { status: 500 }
    );
  }
}

// Update Foto Profil / Data Anggota
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("voca_admin_session");
    const memberSession = cookieStore.get("voca_member_session");

    const isAdmin = await verifyAdminSessionToken(adminSession?.value);
    const verifiedMemberId = await verifyMemberSessionToken(memberSession?.value);

    if (!isAdmin && !verifiedMemberId) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { photoUrl, memberId } = body;

    const targetMemberId = isAdmin && memberId ? memberId : verifiedMemberId;

    if (!targetMemberId) {
      return NextResponse.json({ error: "Identitas anggota tidak valid." }, { status: 400 });
    }

    const [updated] = await db
      .update(members)
      .set({ photoUrl: photoUrl || null })
      .where(eq(members.memberId, targetMemberId))
      .returning();

    return NextResponse.json({
      success: true,
      member: updated,
      message: "Foto profil anggota berhasil disimpan.",
    });
  } catch (error: any) {
    console.error("Gagal update foto profil member:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui foto profil anggota.", details: error.message },
      { status: 500 }
    );
  }
}
