import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { memberInvoices, members, financeTransactions } from "@/db/schema";
import {
  generateInvoiceCode,
  generateTransactionCode,
  getSafeNextInvoiceSequence,
  getSafeNextTransactionSequence,
} from "@/lib/account-generator";
import { desc, eq, and } from "drizzle-orm";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return session?.value === "authenticated_admin";
}

// GET: Mengambil seluruh tagihan anggota VOCA
export async function GET() {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses ditolak. Silakan login sebagai administrator." },
      { status: 401 }
    );
  }

  try {
    const invoices = await db
      .select()
      .from(memberInvoices)
      .orderBy(desc(memberInvoices.id));

    const totalUnpaid = invoices.filter((i) => i.status === "unpaid").length;
    const totalPending = invoices.filter((i) => i.status === "pending").length;
    const totalPaid = invoices.filter((i) => i.status === "paid").length;

    return NextResponse.json({
      success: true,
      invoices,
      stats: {
        total: invoices.length,
        unpaid: totalUnpaid,
        pending: totalPending,
        paid: totalPaid,
      },
    });
  } catch (error: any) {
    console.error("Gagal mengambil tagihan:", error);
    return NextResponse.json(
      { error: "Gagal memuat data tagihan.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Terbitkan tagihan (Massal untuk semua user, atau per user individu)
export async function POST(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, monthPeriod, dueDate, memberId, amount, notes } = body;

    const allInvoices = await db.select().from(memberInvoices);
    let sequenceCounter = getSafeNextInvoiceSequence(allInvoices);

    // Default due date: 7 hari setelah hari ini jika tidak ditentukan
    const targetDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (action === "bulk") {
      // MODE 1: Tagihan Massal ke Seluruh Anggota Aktif
      const activeMembers = await db
        .select()
        .from(members)
        .where(eq(members.status, "active"));

      if (activeMembers.length === 0) {
        return NextResponse.json(
          { error: "Tidak ada anggota aktif yang ditemukan untuk ditagihkan." },
          { status: 400 }
        );
      }

      const createdList = [];

      for (const m of activeMembers) {
        // Cek apakah tagihan periode ini sudah pernah terbit untuk member bersangkutan
        const existing = await db
          .select()
          .from(memberInvoices)
          .where(
            and(
              eq(memberInvoices.memberId, m.memberId),
              eq(memberInvoices.monthPeriod, monthPeriod || "Oktober 2026")
            )
          );

        if (existing.length === 0) {
          const invoiceNumber = generateInvoiceCode(sequenceCounter++);
          const [inv] = await db
            .insert(memberInvoices)
            .values({
              invoiceNumber,
              memberId: m.memberId,
              memberName: m.fullName,
              monthPeriod: monthPeriod || "Oktober 2026",
              amount: m.monthlyFee,
              issueDate: new Date(),
              dueDate: targetDueDate,
              status: "unpaid",
              notes: notes || `Tagihan iuran reguler bulanan ${monthPeriod || "Oktober 2026"}`,
            })
            .returning();
          createdList.push(inv);
        }
      }

      return NextResponse.json({
        success: true,
        createdCount: createdList.length,
        message: `Berhasil menerbitkan ${createdList.length} tagihan massal untuk periode ${monthPeriod || "Oktober 2026"} (Batas bayar: ${targetDueDate.toLocaleDateString("id-ID")}).`,
      });
    } else {
      // MODE 2: Tagihan Khusus Per User Individu
      if (!memberId || !amount) {
        return NextResponse.json(
          { error: "Member ID dan nominal tagihan wajib diisi." },
          { status: 400 }
        );
      }

      const [member] = await db
        .select()
        .from(members)
        .where(eq(members.memberId, memberId));

      if (!member) {
        return NextResponse.json({ error: "Anggota tidak ditemukan." }, { status: 404 });
      }

      const invoiceNumber = generateInvoiceCode(sequenceCounter);
      const [newInvoice] = await db
        .insert(memberInvoices)
        .values({
          invoiceNumber,
          memberId: member.memberId,
          memberName: member.fullName,
          monthPeriod: monthPeriod || "Oktober 2026",
          amount: parseInt(amount, 10),
          issueDate: new Date(),
          dueDate: targetDueDate,
          status: "unpaid",
          notes: notes || `Tagihan khusus anggota ${member.fullName}`,
        })
        .returning();

      return NextResponse.json({
        success: true,
        invoice: newInvoice,
        message: `Tagihan ${invoiceNumber} sebesar Rp ${parseInt(amount, 10).toLocaleString("id-ID")} berhasil diterbitkan untuk ${member.fullName}.`,
      });
    }
  } catch (error: any) {
    console.error("Gagal membuat tagihan:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembuatan tagihan.", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Verifikasi Pembayaran (Lunas, Pending, Belum Bayar) & Otomatis Mutasi Kas
export async function PATCH(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, paymentMethod, amount, monthPeriod, dueDate, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID tagihan wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Ambil data tagihan saat ini
    const [invoice] = await db
      .select()
      .from(memberInvoices)
      .where(eq(memberInvoices.id, parseInt(id, 10)));

    if (!invoice) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan." }, { status: 404 });
    }

    const nextStatus = status || invoice.status;
    let linkedTrxCode = invoice.transactionCode;

    // 2. KETIKA DIUBAH MENJADI 'PAID' (LUNAS):
    if (nextStatus === "paid" && invoice.status !== "paid") {
      const now = new Date();
      const allTrx = await db.select().from(financeTransactions);
      const trxSeq = getSafeNextTransactionSequence(allTrx);
      linkedTrxCode = generateTransactionCode(trxSeq, now);

      // OTOMATIS CATAT PEMASUKAN KAS (Saldo bertambah)
      await db.insert(financeTransactions).values({
        transactionCode: linkedTrxCode,
        type: "income",
        category: "Iuran Bulanan Member",
        amount: amount ? parseInt(amount, 10) : invoice.amount,
        memberId: invoice.memberId,
        paymentMethod: paymentMethod || invoice.paymentMethod || "Transfer Bank",
        description: `Pembayaran ${invoice.invoiceNumber} (${monthPeriod || invoice.monthPeriod}) a/n ${invoice.memberName}`,
        transactionDate: now,
        createdByUser: "adminvoca",
      });

      // Perpanjang masa aktif anggota (+30 hari)
      await db
        .update(members)
        .set({
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "active",
        })
        .where(eq(members.memberId, invoice.memberId));
    }

    // 3. JIKA DIBATALKAN / DIUBAH DARI 'PAID' KE 'UNPAID' / 'PENDING':
    // Hapus mutasi transaksi kas agar saldo tidak bertambah ganda / tetap akurat
    if (nextStatus !== "paid" && invoice.status === "paid" && invoice.transactionCode) {
      await db
        .delete(financeTransactions)
        .where(eq(financeTransactions.transactionCode, invoice.transactionCode));
      linkedTrxCode = null;
    }

    // 4. Update data tagihan
    const updateFields: any = {
      status: nextStatus,
      paymentDate: nextStatus === "paid" ? (invoice.paymentDate || new Date()) : invoice.paymentDate,
      verifiedByUser: nextStatus === "paid" ? "adminvoca" : null,
      transactionCode: linkedTrxCode,
      paymentMethod: paymentMethod || invoice.paymentMethod,
    };

    if (amount !== undefined) updateFields.amount = parseInt(amount, 10);
    if (monthPeriod !== undefined) updateFields.monthPeriod = monthPeriod;
    if (dueDate !== undefined) updateFields.dueDate = new Date(dueDate);
    if (notes !== undefined) updateFields.notes = notes;

    const [updatedInvoice] = await db
      .update(memberInvoices)
      .set(updateFields)
      .where(eq(memberInvoices.id, parseInt(id, 10)))
      .returning();

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message:
        nextStatus === "paid"
          ? `Tagihan ${invoice.invoiceNumber} diverifikasi LUNAS. Dana sebesar Rp ${updatedInvoice.amount.toLocaleString("id-ID")} otomatis MASUK ke saldo kas klub!`
          : `Data tagihan ${invoice.invoiceNumber} berhasil diperbarui (Status: ${nextStatus.toUpperCase()}).`,
    });
  } catch (error: any) {
    console.error("Gagal update status tagihan:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status tagihan.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Hapus tagihan jika ada kekeliruan
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

    await db
      .delete(memberInvoices)
      .where(eq(memberInvoices.id, parseInt(id, 10)));

    return NextResponse.json({
      success: true,
      message: "Tagihan berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
