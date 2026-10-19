import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trialLeads, members, financeTransactions, memberInvoices } from "@/db/schema";
import { generateMemberCredentials, generateInvoiceCode } from "@/lib/account-generator";
import { eq } from "drizzle-orm";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return session?.value === "authenticated_admin";
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

    // 2. Tentukan data keanggotaan & generate otomatis username & password
    const currentYear = new Date().getFullYear();
    const countResult = await db.select().from(members);
    const sequenceNumber = countResult.length + 1;
    const { username, password, memberId } = generateMemberCredentials(sequenceNumber, currentYear);

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

    // 4. Catat otomatis ke buku kas keuangan
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const allTrx = await db.select().from(financeTransactions);
    const nextCode = `TRX-${yearMonth}-${String(allTrx.length + 1).padStart(3, "0")}`;

    await db.insert(financeTransactions).values({
      transactionCode: nextCode,
      type: "income",
      category: "Iuran Bulanan Member",
      amount: finalMonthlyFee,
      memberId: memberId,
      paymentMethod: "Transfer Bank",
      description: `Iuran pendaftaran perdana anggota baru ${lead.fullName} (${memberId})`,
      transactionDate: now,
      createdByUser: "adminvoca",
    });

    // 5. Terbitkan tagihan perdana di tabel member_invoices dengan status 'paid'
    const allInvoices = await db.select().from(memberInvoices);
    const invoiceNumber = generateInvoiceCode(allInvoices.length + 1, now);

    await db.insert(memberInvoices).values({
      invoiceNumber,
      memberId,
      memberName: lead.fullName,
      monthPeriod: `Oktober ${currentYear}`,
      amount: finalMonthlyFee,
      issueDate: now,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "paid",
      paymentDate: now,
      paymentMethod: "Transfer Bank",
      notes: "Iuran perdana registrasi anggota baru",
      verifiedByUser: "adminvoca",
      transactionCode: nextCode,
    });

    // 6. Update status di trial_leads menjadi 'converted'
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
      message: `Pendaftar ${lead.fullName} resmi menjadi anggota! Akun: ${username} (Password: ${password}), ID: ${memberId}, dan dana Rp ${finalMonthlyFee.toLocaleString("id-ID")} otomatis MASUK ke saldo kas!`,
    });
  } catch (error: any) {
    console.error("Gagal mengonversi lead ke member:", error);
    return NextResponse.json(
      { error: "Gagal memproses konversi keanggotaan.", details: error.message },
      { status: 500 }
    );
  }
}
