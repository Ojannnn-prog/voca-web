import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { members, financeTransactions } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier");

    let memberRecord = null;

    if (identifier) {
      const cleanId = identifier.trim();
      const results = await db
        .select()
        .from(members)
        .where(or(eq(members.memberId, cleanId), eq(members.phoneNumber, cleanId)));

      if (results.length > 0) {
        memberRecord = results[0];
      }
    } else {
      // Cek cookie member jika ada
      const cookieStore = await cookies();
      const memberCookie = cookieStore.get("voca_member_session") || cookieStore.get("voca_member_identifier");
      if (memberCookie?.value) {
        const results = await db
          .select()
          .from(members)
          .where(
            or(
              eq(members.memberId, memberCookie.value),
              eq(members.phoneNumber, memberCookie.value)
            )
          );
        if (results.length > 0) {
          memberRecord = results[0];
        }
      }

      // Default fallback ke member pertama jika tidak ada sesi
      if (!memberRecord) {
        const defaultMembers = await db
          .select()
          .from(members)
          .orderBy(members.id)
          .limit(1);
        if (defaultMembers.length > 0) {
          memberRecord = defaultMembers[0];
        }
      }
    }

    if (!memberRecord) {
      return NextResponse.json(
        { error: "Data anggota tidak ditemukan." },
        { status: 404 }
      );
    }

    // Ambil riwayat pembayaran dari finance_transactions
    const memberTransactions = await db
      .select()
      .from(financeTransactions)
      .where(eq(financeTransactions.memberId, memberRecord.memberId))
      .orderBy(desc(financeTransactions.transactionDate));

    return NextResponse.json({
      success: true,
      member: memberRecord,
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
