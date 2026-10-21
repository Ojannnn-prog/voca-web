import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken, verifyMemberSessionToken } from "@/lib/auth-session";
import {
  checkRateLimit,
  hasSqlInjectionPattern,
  hasXssPattern,
  SECURITY_HEADERS,
} from "@/lib/security";

// Helper menambahkan header keamanan lengkap ke semua response
function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, val] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, val);
  }
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Dapatkan IP klien untuk rate limiter & DDoS guard
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // =========================================================================
  // 1. WAF INSPECTION: Anti-SQLi & Anti-XSS pada URL Search Params
  // =========================================================================
  for (const [key, value] of searchParams.entries()) {
    if (hasSqlInjectionPattern(value) || hasXssPattern(value)) {
      console.warn(`[WAF BLOCKED] Malicious pattern detected in query param '${key}' from IP: ${clientIp}`);
      const blockedRes = NextResponse.json(
        { error: "Akses ditolak: Pola karakter mencurigakan terdeteksi oleh sistem keamanan WAF VOCA." },
        { status: 400 }
      );
      return applySecurityHeaders(blockedRes);
    }
  }

  // =========================================================================
  // 2. ANTI-DDOS & ANTI-BRUTE FORCE RATE LIMITING PADA ENDPOINT API
  // =========================================================================
  if (pathname.startsWith("/api/")) {
    const isLoginEndpoint = pathname === "/api/auth/login";
    // Ambang batas ketat untuk login (5 req/menit), API umum (60 req/menit)
    const limitMax = isLoginEndpoint ? 5 : 60;
    const rateLimit = checkRateLimit(clientIp + (isLoginEndpoint ? ":login" : ":api"), limitMax, 60000);

    if (!rateLimit.allowed) {
      console.warn(`[RATE LIMIT EXCEEDED] IP ${clientIp} exceeded limit on ${pathname}`);
      const rateLimitRes = NextResponse.json(
        {
          error: "Terlalu banyak permintaan (Rate limit exceeded). Silakan tunggu sebentar.",
          retryAfterSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
      rateLimitRes.headers.set("Retry-After", String(rateLimit.resetInSeconds));
      rateLimitRes.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
      rateLimitRes.headers.set("X-RateLimit-Remaining", "0");
      return applySecurityHeaders(rateLimitRes);
    }
  }

  // =========================================================================
  // 3. PROTEKSI AKSES PANEL ADMINISTRATOR (/admin)
  // =========================================================================
  if (pathname.startsWith("/admin")) {
    const adminCookie = request.cookies.get("voca_admin_session");
    const isValidAdmin = await verifyAdminSessionToken(adminCookie?.value);

    if (!isValidAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "admin");
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      return applySecurityHeaders(res);
    }
    const res = NextResponse.next();
    return applySecurityHeaders(res);
  }

  // =========================================================================
  // 4. PROTEKSI AKSES PORTAL ANGGOTA (/member)
  // =========================================================================
  if (pathname.startsWith("/member")) {
    const memberCookie = request.cookies.get("voca_member_session");
    const verifiedMemberId = await verifyMemberSessionToken(memberCookie?.value);

    if (!verifiedMemberId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "member");
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      return applySecurityHeaders(res);
    }
    const res = NextResponse.next();
    return applySecurityHeaders(res);
  }

  // =========================================================================
  // 5. OPTIMASI HALAMAN LOGIN (/login)
  // =========================================================================
  if (pathname === "/login") {
    const adminCookie = request.cookies.get("voca_admin_session");
    if (await verifyAdminSessionToken(adminCookie?.value)) {
      const res = NextResponse.redirect(new URL("/admin", request.url));
      return applySecurityHeaders(res);
    }

    const memberCookie = request.cookies.get("voca_member_session");
    if (await verifyMemberSessionToken(memberCookie?.value)) {
      const res = NextResponse.redirect(new URL("/member", request.url));
      return applySecurityHeaders(res);
    }
    const res = NextResponse.next();
    return applySecurityHeaders(res);
  }

  const res = NextResponse.next();
  return applySecurityHeaders(res);
}

// Konfigurasi Matcher: Terapkan ke seluruh halaman & API, abaikan static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
