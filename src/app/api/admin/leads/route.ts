import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trialLeads } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  return session?.value === "authenticated_admin";
}

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
      { error: "Gagal mengambil data pendaftar dari database." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib disertakan." }, { status: 400 });
    }

    await db
      .update(trialLeads)
      .set({ status })
      .where(eq(trialLeads.id, Number(id)));

    return NextResponse.json({ success: true, message: "Status pendaftar berhasil diperbarui." });
  } catch (error: any) {
    console.error("Admin leads update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status data pendaftar." },
      { status: 500 }
    );
  }
}
