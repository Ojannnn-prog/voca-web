import { NextResponse } from "next/server";
import { db } from "@/db";
import { trialLeads } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phoneNumber,
      email,
      participantAge,
      programCategory,
      planType,
      notes,
    } = body;

    if (!fullName || !phoneNumber || !programCategory) {
      return NextResponse.json(
        { error: "Nama lengkap, nomor WhatsApp, dan pilihan program wajib diisi." },
        { status: 400 }
      );
    }

    // Insert record into Neon Database via Drizzle ORM
    const inserted = await db
      .insert(trialLeads)
      .values({
        fullName,
        phoneNumber,
        email: email || null,
        participantAge: participantAge ? Number(participantAge) : null,
        programCategory,
        planType: planType || "free_trial",
        notes: notes || null,
        status: "pending",
      })
      .returning({ id: trialLeads.id });

    return NextResponse.json({
      success: true,
      leadId: inserted[0]?.id,
      message: "Pendaftaran berhasil disimpan.",
    });
  } catch (error: any) {
    console.error("Error saving registration lead:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server database." },
      { status: 500 }
    );
  }
}
