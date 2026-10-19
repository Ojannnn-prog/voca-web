import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trialLeads } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

import { verifyAdminSessionToken } from "@/lib/auth-session";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return verifyAdminSessionToken(session?.value);
}

// 1. GET: Ambil seluruh data pendaftar / leads
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Silakan login admin." }, { status: 401 });
    }

    const leads = await db
      .select()
      .from(trialLeads)
      .orderBy(desc(trialLeads.createdAt));

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("Admin leads fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftar dari database.", details: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Tambah pendaftar baru secara manual oleh Admin
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phoneNumber,
      email,
      participantAge,
      ageCategory,
      programCategory,
      planType,
      notes,
      status,
    } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { error: "Nama lengkap dan nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    const parsedAge = participantAge ? parseInt(participantAge, 10) : null;
    let finalAgeCat = ageCategory;
    if (!finalAgeCat && parsedAge) {
      if (parsedAge <= 4) finalAgeCat = "toddler";
      else if (parsedAge <= 12) finalAgeCat = "kids";
      else if (parsedAge <= 17) finalAgeCat = "junior";
      else finalAgeCat = "adult";
    }

    const [newLead] = await db
      .insert(trialLeads)
      .values({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email ? email.trim() : null,
        participantAge: parsedAge,
        ageCategory: finalAgeCat || "kids",
        programCategory: programCategory || "swimming",
        planType: planType || "free_trial",
        notes: notes ? notes.trim() : null,
        status: status || "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      lead: newLead,
      message: `Pendaftar ${fullName} berhasil ditambahkan.`,
    });
  } catch (error: any) {
    console.error("Admin leads create error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pendaftar ke database.", details: error.message },
      { status: 500 }
    );
  }
}

// 3. PATCH: Update status & data pendaftar
export async function PATCH(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      status,
      fullName,
      phoneNumber,
      email,
      participantAge,
      ageCategory,
      programCategory,
      planType,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID pendaftar wajib disertakan." }, { status: 400 });
    }

    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber.trim();
    if (email !== undefined) updateFields.email = email ? email.trim() : null;
    if (participantAge !== undefined) {
      updateFields.participantAge = participantAge ? parseInt(participantAge, 10) : null;
    }
    if (ageCategory !== undefined) updateFields.ageCategory = ageCategory;
    if (programCategory !== undefined) updateFields.programCategory = programCategory;
    if (planType !== undefined) updateFields.planType = planType;
    if (notes !== undefined) updateFields.notes = notes ? notes.trim() : null;

    const [updated] = await db
      .update(trialLeads)
      .set(updateFields)
      .where(eq(trialLeads.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Data pendaftar tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      lead: updated,
      message: `Data pendaftar ${updated.fullName} berhasil diperbarui.`,
    });
  } catch (error: any) {
    console.error("Admin leads update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data pendaftar.", details: error.message },
      { status: 500 }
    );
  }
}

// 4. DELETE: Hapus data pendaftar
export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID pendaftar wajib disertakan." }, { status: 400 });
    }

    await db.delete(trialLeads).where(eq(trialLeads.id, parseInt(id, 10)));

    return NextResponse.json({
      success: true,
      message: "Data pendaftar berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Admin leads delete error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pendaftar.", details: error.message },
      { status: 500 }
    );
  }
}
