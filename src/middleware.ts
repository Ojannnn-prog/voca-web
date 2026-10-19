import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken, verifyMemberSessionToken } from "@/lib/auth-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PROTEKSI AKSES PANEL ADMINISTRATOR (/admin)
  // Tidak ada yang boleh mengakses CMS Admin tanpa verifikasi login resmi
  if (pathname.startsWith("/admin")) {
    const adminCookie = request.cookies.get("voca_admin_session");
    const isValidAdmin = await verifyAdminSessionToken(adminCookie?.value);

    if (!isValidAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "admin");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. PROTEKSI AKSES PORTAL ANGGOTA (/member)
  // Tidak ada anggota atau publik yang boleh melihat halaman portal tanpa otentikasi login
  if (pathname.startsWith("/member")) {
    const memberCookie = request.cookies.get("voca_member_session");
    const verifiedMemberId = await verifyMemberSessionToken(memberCookie?.value);

    if (!verifiedMemberId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "member");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. OPTIMASI HALAMAN LOGIN (/login)
  // Jika sudah terotentikasi, otomatis arahkan ke dashboard masing-masing
  if (pathname === "/login") {
    const adminCookie = request.cookies.get("voca_admin_session");
    if (await verifyAdminSessionToken(adminCookie?.value)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const memberCookie = request.cookies.get("voca_member_session");
    if (await verifyMemberSessionToken(memberCookie?.value)) {
      return NextResponse.redirect(new URL("/member", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Konfigurasi Matcher Rute yang Diawasi Middleware
export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/login"],
};
