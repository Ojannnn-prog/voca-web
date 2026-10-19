import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { financeTransactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return session?.value === "authenticated_admin";
}

// GET: Mengambil pembukuan kas & ringkasan saldo keuangan
export async function GET() {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses ditolak. Silakan login sebagai administrator." },
      { status: 401 }
    );
  }

  try {
    const transactions = await db
      .select()
      .from(financeTransactions)
      .orderBy(desc(financeTransactions.transactionDate));

    // Hitung ringkasan kas
    let totalIncome = 0;
    let totalExpense = 0;

    for (const trx of transactions) {
      if (trx.type === "income") {
        totalIncome += trx.amount;
      } else if (trx.type === "expense") {
        totalExpense += trx.amount;
      }
    }

    const currentBalance = totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        currentBalance,
        transactionCount: transactions.length,
      },
    });
  } catch (error: any) {
    console.error("Gagal mengambil data keuangan:", error);
    return NextResponse.json(
      { error: "Gagal memuat data kas & keuangan.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Catat transaksi pemasukan atau pengeluaran baru
export async function POST(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses ditolak." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      type, // income | expense
      category,
      amount,
      memberId,
      paymentMethod,
      description,
      transactionDate,
    } = body;

    if (!type || !category || !amount || !description) {
      return NextResponse.json(
        { error: "Tipe transaksi, kategori, jumlah nominal, dan keterangan wajib diisi." },
        { status: 400 }
      );
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Nominal transaksi harus berupa angka positif valid." },
        { status: 400 }
      );
    }

    // Generate kode transaksi TRX-YYYYMM-xxx
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const allTrx = await db.select().from(financeTransactions);
    const nextCode = `TRX-${yearMonth}-${String(allTrx.length + 1).padStart(3, "0")}`;

    const [newTransaction] = await db
      .insert(financeTransactions)
      .values({
        transactionCode: nextCode,
        type,
        category,
        amount: parsedAmount,
        memberId: memberId || null,
        paymentMethod: paymentMethod || "Transfer Bank",
        description,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        createdByUser: "adminvoca",
      })
      .returning();

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: `Transaksi ${nextCode} sebesar Rp ${parsedAmount.toLocaleString("id-ID")} berhasil dicatat ke buku kas.`,
    });
  } catch (error: any) {
    console.error("Gagal mencatat transaksi kas:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan transaksi.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Hapus transaksi kas jika ada kekeliruan input
export async function DELETE(request: Request) {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID transaksi wajib disertakan." }, { status: 400 });
    }

    await db
      .delete(financeTransactions)
      .where(eq(financeTransactions.id, parseInt(id, 10)));

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dihapus dari pembukuan.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menghapus transaksi.", details: error.message },
      { status: 500 }
    );
  }
}
