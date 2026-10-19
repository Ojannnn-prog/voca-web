import { NextResponse } from "next/server";
import { db } from "@/db";
import { memberInvoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import fs from "fs";
import path from "path";

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

    let finalProofPath = paymentProofUrl;

    // HASH128 OPTIMIZATION & STORAGE COMPRESSION
    // Jika data berupa base64 DataURL (misal data:image/jpeg;base64,...):
    if (paymentProofUrl.startsWith("data:image/")) {
      try {
        const matches = paymentProofUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const extension = matches[1] === "png" ? "png" : "jpg";
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          // Hitung Hash128 (MD5 menghasilkan 128-bit / 32 karakter hex)
          const hash128 = crypto.createHash("md5").update(buffer).digest("hex");
          const fileName = `proof_${hash128}.${extension}`;

          // Pastikan direktori public/uploads/proofs tersedia di server
          const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const filePath = path.join(uploadDir, fileName);
          // Hanya tulis jika file belum ada (Deduplikasi Hash128 Otomatis)
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, buffer);
          }

          // Simpan URL relatif yang super hemat storage database (~35 bytes vs 5MB)
          finalProofPath = `/uploads/proofs/${fileName}`;
        }
      } catch (fileErr) {
        console.warn("Gagal menyimpan file ke disk, menggunakan base64 fallback:", fileErr);
      }
    }

    const [updated] = await db
      .update(memberInvoices)
      .set({
        paymentProofUrl: finalProofPath,
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
      proofUrl: finalProofPath,
      message: `Bukti transfer tagihan ${updated.invoiceNumber} berhasil disimpan & dioptimasi dengan Hash128. Admin akan segera memverifikasi.`,
    });
  } catch (error: any) {
    console.error("Gagal upload bukti bayar:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan bukti pembayaran.", details: error.message },
      { status: 500 }
    );
  }
}
