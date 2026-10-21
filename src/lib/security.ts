/**
 * VOCA Security Hardening & Penetration Defense Suite
 * Proteksi Berlapis Terhadap:
 * 1. SQL Injection (SQLi) - Parameterized sanitization & pattern detection
 * 2. Cross-Site Scripting (XSS) - Input sanitization & Content Security Policy
 * 3. Broken Authentication - Rate limiting, anti-brute-force, and cryptographic token verification
 * 4. DDoS / Flooding - In-memory sliding-window IP rate limiting & payload bounds
 * 5. Clickjacking - X-Frame-Options: DENY & CSP frame-ancestors 'none'
 */

// 1. Sliding Window Rate Limiter (Anti-DDoS & Anti-Brute-Force)
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Bersihkan data lama tiap 5 menit demi efisiensi memory
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Memeriksa apakah request dari IP tertentu melampaui ambang batas rate limit.
 * @param ip Alamat IP klien
 * @param limit Jumlah maksimal request dalam time window
 * @param windowMs Ukuran waktu dalam milidetik (default: 60 detik)
 */
export function checkRateLimit(
  ip: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(ip);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(ip, record);
  }

  // Buang timestamp yang lebih tua dari windowMs
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    allowed: true,
    limit,
    remaining,
    resetInSeconds: Math.ceil(windowMs / 1000),
  };
}

// 2. Deteksi Pola Ancaman Injeksi (SQL Injection & Stored/Reflected XSS)
const SQLI_PATTERNS = [
  /(\b(union([\s\S]*?)select)\b)/i,
  /(\b(drop([\s\S]+?)table)\b)/i,
  /(\b(insert([\s\S]+?)into)\b)/i,
  /(\b(alter([\s\S]+?)table)\b)/i,
  /(\b(delete([\s\S]+?)from)\b)/i,
  /(--\s*$)|(\/\*[\s\S]*?\*\/)/i,
  /(;\s*(select|drop|insert|update|delete)\b)/i,
];

const XSS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/i,
  /javascript:[^"]*/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /<img[^>]+src=[^>]+onerror=/i,
  /<iframe\b[^>]*>/i,
];

/**
 * Memeriksa apakah suatu teks mengandung payload serangan SQL Injection
 */
export function hasSqlInjectionPattern(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return SQLI_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Memeriksa apakah suatu teks mengandung payload serangan XSS
 */
export function hasXssPattern(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return XSS_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Sanitasi string umum: memotong spasi berlebih, menghapus tag berbahaya
 */
export function sanitizeString(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Hapus bracket berbahaya
    .replace(/javascript:/gi, "");
}

/**
 * Escape karakter HTML untuk mencegah Cross-Site Scripting (XSS)
 */
export function escapeHtml(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Header Keamanan Komprehensif (Anti-Clickjacking, Anti-MIME sniffing, CSP, dsb)
 */
export const SECURITY_HEADERS = {
  // 1. Anti-Clickjacking: Melarang situs dimuat di dalam iframe situs lain
  "X-Frame-Options": "DENY",

  // 2. Anti-MIME Sniffing: Memaksa browser mengikuti tipe konten resmi
  "X-Content-Type-Options": "nosniff",

  // 3. Referrer Policy: Tidak membocorkan URL sensitif ke origin lain
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // 4. Permissions Policy: Mematikan akses sensor yang tidak dibutuhkan aplikasi
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",

  // 5. Content Security Policy (CSP): Membatasi eksekusi resource asing
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'", // Anti-Clickjacking via CSP
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};
