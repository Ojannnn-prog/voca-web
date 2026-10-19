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
      ageCategory,
      notes,
    } = body;

    if (!fullName || !phoneNumber || !programCategory) {
      return NextResponse.json(
        { error: "Nama lengkap, nomor WhatsApp, dan pilihan program wajib diisi." },
        { status: 400 }
      );
    }

    const calculatedAge = participantAge ? Number(participantAge) : null;
    let finalAgeCategory = ageCategory;
    if (!finalAgeCategory && calculatedAge) {
      if (calculatedAge <= 4) finalAgeCategory = "toddler";
      else if (calculatedAge <= 12) finalAgeCategory = "kids";
      else if (calculatedAge <= 17) finalAgeCategory = "junior";
      else finalAgeCategory = "adult";
    }

    // Insert record into Neon Database via Drizzle ORM
    const inserted = await db
      .insert(trialLeads)
      .values({
        fullName,
        phoneNumber,
        email: email || null,
        participantAge: calculatedAge,
        ageCategory: finalAgeCategory || "kids",
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
