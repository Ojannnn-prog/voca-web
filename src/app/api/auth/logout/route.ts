import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("voca_admin_session", "", { path: "/", maxAge: 0 });
    cookieStore.set("voca_member_session", "", { path: "/", maxAge: 0 });
    cookieStore.delete("voca_admin_session");
    cookieStore.delete("voca_member_session");

    return NextResponse.json({
      success: true,
      message: "Berhasil keluar dari sesi.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses logout." },
      { status: 500 }
    );
  }
}
