import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trialLeads, members, financeTransactions, memberInvoices } from "@/db/schema";
import {
  generateMemberCredentials,
  generateInvoiceCode,
  generateTransactionCode,
  getSafeNextMemberSequence,
  getSafeNextInvoiceSequence,
  getSafeNextTransactionSequence,
} from "@/lib/account-generator";
import { eq } from "drizzle-orm";

import { verifyAdminSessionToken } from "@/lib/auth-session";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return verifyAdminSessionToken(session?.value);
}

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
    const { leadId, programType, sportBranch, monthlyFee } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "ID pendaftar (leadId) wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Ambil data pendaftar
    const [lead] = await db
      .select()
      .from(trialLeads)
      .where(eq(trialLeads.id, parseInt(leadId, 10)));

    if (!lead) {
      return NextResponse.json(
        { error: "Data pendaftar tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Tentukan data keanggotaan & generate otomatis username & password aman (anti-collision)
    const currentYear = new Date().getFullYear();
    const allExistingMembers = await db.select().from(members);
    let sequenceNumber = getSafeNextMemberSequence(allExistingMembers);

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
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari ke depan

    const finalProgramType =
      programType ||
      (lead.planType === "premium_private"
        ? "Premium Private Class"
        : "Reguler Member");
    const finalSportBranch =
      sportBranch ||
      (lead.programCategory === "motoric"
        ? "Fundamental Motorik"
        : "Renang & Akuatik");
    const finalMonthlyFee = monthlyFee
      ? parseInt(monthlyFee, 10)
      : finalProgramType === "Premium Private Class"
      ? 400000
      : 347000;

    // Map age category
    let finalAgeCategory = "Anak-anak";
    if (lead.ageCategory === "toddler" || (lead.participantAge && lead.participantAge <= 4))
      finalAgeCategory = "Balita";
    else if (
      lead.ageCategory === "junior" ||
      (lead.participantAge && lead.participantAge >= 13 && lead.participantAge <= 17)
    )
      finalAgeCategory = "Remaja";
    else if (lead.ageCategory === "adult" || (lead.participantAge && lead.participantAge >= 18))
      finalAgeCategory = "Dewasa";
    else if (lead.ageCategory === "tni_polri") finalAgeCategory = "Casis TNI/Polri";
    else if (lead.ageCategory === "adaptive") finalAgeCategory = "Terapi Disabilitas";

    // 3. Masukkan ke tabel members dengan username & password ter-generate otomatis
    const [newMember] = await db
      .insert(members)
      .values({
        memberId,
        username,
        password,
        fullName: lead.fullName,
        phoneNumber: lead.phoneNumber,
        email: lead.email || null,
        participantAge: lead.participantAge || null,
        ageCategory: finalAgeCategory,
        programType: finalProgramType,
        sportBranch: finalSportBranch,
        monthlyFee: finalMonthlyFee,
        joinDate,
        validUntil,
        status: "active",
        bloodType: "O",
        notes: `Dikonversi dari pendaftaran online (Ref #${lead.id}): ${lead.notes || "-"}`,
      })
      .returning();

    // 4. Terbitkan tagihan perdana di tabel member_invoices dengan status 'unpaid' (BELUM BAYAR)
    // Sesuai ketentuan: Pendaftaran baru TIDAK langsung menambah saldo kas klub.
    // Uang kas baru bertambah otomatis setelah bukti pembayaran diverifikasi Admin menjadi 'paid'.
    const now = new Date();
    const allInvoices = await db.select().from(memberInvoices);
    const invSeq = getSafeNextInvoiceSequence(allInvoices);
    const invoiceNumber = generateInvoiceCode(invSeq, now);

    const currentMonthPeriod = `${now.toLocaleDateString("id-ID", { month: "long" })} ${currentYear}`;
    // Batas jatuh tempo pembayaran: 7 hari sejak tanggal pendaftaran
    const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(memberInvoices).values({
      invoiceNumber,
      memberId,
      memberName: lead.fullName,
      monthPeriod: currentMonthPeriod,
      amount: finalMonthlyFee,
      issueDate: now,
      dueDate,
      status: "unpaid",
      paymentDate: null,
      paymentMethod: "Transfer Bank",
      notes: `Tagihan perdana registrasi anggota baru (Jatuh tempo 7 hari: ${dueDate.toLocaleDateString("id-ID")})`,
      verifiedByUser: null,
      transactionCode: null,
    });

    // 5. Update status di trial_leads menjadi 'converted'
    await db
      .update(trialLeads)
      .set({ status: "converted" })
      .where(eq(trialLeads.id, parseInt(leadId, 10)));

    return NextResponse.json({
      success: true,
      member: newMember,
      credentials: {
        username,
        password,
        memberId,
      },
      message: `Pendaftar ${lead.fullName} resmi menjadi anggota! Akun: ${username} (Password: ${password}), ID: ${memberId}. Tagihan perdana Rp ${finalMonthlyFee.toLocaleString("id-ID")} berhasil diterbitkan dengan status BELUM BAYAR (Jatuh tempo 7 hari). Saldo kas belum bertambah sampai tagihan lunas diverifikasi.`,
    });
  } catch (error: any) {
    console.error("Gagal mengonversi lead ke member:", error);
    return NextResponse.json(
      { error: "Gagal memproses konversi keanggotaan.", details: error.message },
      { status: 500 }
    );
  }
}
