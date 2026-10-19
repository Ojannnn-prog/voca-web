import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, role = "admin" } = body;

    const expectedAdminUser = process.env.ADMIN_USERNAME || "adminvoca";
    const expectedAdminPass = process.env.ADMIN_PASSWORD || "admin123";

    if (role === "admin") {
      const cleanUser = (username || "").trim();
      const cleanPass = (password || "").trim();

      if (cleanUser === expectedAdminUser && cleanPass === expectedAdminPass) {
        // Set admin session cookie
        const cookieStore = await cookies();
        cookieStore.set("voca_admin_session", "authenticated_admin", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({
          success: true,
          role: "admin",
          redirect: "/admin",
          message: "Login berhasil sebagai Administrator VOCA.",
        });
      } else {
        return NextResponse.json(
          { error: "Username atau password admin salah." },
          { status: 401 }
        );
      }
    } else {
      // Member login
      const cleanUser = (username || "").trim();
      const cleanPass = (password || "").trim();

      if (!cleanUser || !cleanPass) {
        return NextResponse.json(
          { error: "Nomor anggota / email dan password wajib diisi." },
          { status: 400 }
        );
      }

      // Member demo validation
      const cookieStore = await cookies();
      cookieStore.set("voca_member_session", cleanUser, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        role: "member",
        redirect: "/member",
        message: "Login berhasil sebagai Anggota VOCA.",
      });
    }
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server autentikasi." },
      { status: 500 }
    );
  }
}
