import { NextResponse } from "next/server";
import { db } from "@/db";
import { memberInvoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, paymentProofUrl, paymentMethod } = body;

    if (!invoiceId || !paymentProofUrl) {
      return NextResponse.json(
        { error: "ID tagihan dan bukti pembayaran wajib disertakan." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(memberInvoices)
      .set({
        paymentProofUrl,
        paymentMethod: paymentMethod || "Transfer Bank",
        paymentDate: new Date(),
        status: "pending", // Status menjadi pending menunggu verifikasi admin
      })
      .where(eq(memberInvoices.id, parseInt(invoiceId, 10)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: updated,
      message: `Bukti transfer untuk tagihan ${updated.invoiceNumber} berhasil dikirim. Admin akan segera memverifikasi.`,
    });
  } catch (error: any) {
    console.error("Gagal upload bukti bayar:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan bukti pembayaran.", details: error.message },
      { status: 500 }
    );
  }
}
