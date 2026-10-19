/**
 * VOCA Authentication & Cryptographic Session Security
 * Menggunakan HMAC-SHA256 untuk memverifikasi keaslian cookie sesi secara aman,
 * mencegah pemalsuan identitas (anti-spoofing/anti-tampering), serta melindungi
 * rute /admin dan /member dari akses tanpa otorisasi resmi.
 */

const AUTH_SECRET = process.env.SESSION_SECRET || "voca_sec_auth_vault_token_salt_2026_#101026_vortex_athletics";

// Helper konversi string ke BufferSource (kompatibel Web Crypto di Edge & Node.js)
function stringToUint8(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

// Helper konversi ArrayBuffer ke hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// Buat HMAC SHA-256 signature menggunakan Web Crypto API (didukung di Edge & Node.js)
async function generateHmacSignature(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    stringToUint8(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    stringToUint8(data)
  );
  return bufferToHex(signatureBuffer);
}

// 1. Buat token sesi Admin bertanda tangan digital
export async function createAdminSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const randomSalt = Math.random().toString(36).substring(2, 10);
  const payload = `voca_admin:${timestamp}:${randomSalt}`;
  const signature = await generateHmacSignature(payload);
  return `${payload}.${signature}`;
}

// 2. Verifikasi token sesi Admin
export async function verifyAdminSessionToken(token?: string | null): Promise<boolean> {
  if (!token || !token.includes(".")) return false;

  const lastDotIndex = token.lastIndexOf(".");
  const payload = token.substring(0, lastDotIndex);
  const providedSignature = token.substring(lastDotIndex + 1);

  if (!payload.startsWith("voca_admin:")) return false;

  // Cek masa berlaku token (maks 7 hari)
  const parts = payload.split(":");
  const tokenTime = parseInt(parts[1], 10);
  if (isNaN(tokenTime)) return false;

  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - tokenTime > maxAge) return false;

  // Validasi kecocokan tanda tangan digital HMAC
  const expectedSignature = await generateHmacSignature(payload);
  return expectedSignature === providedSignature;
}

// 3. Buat token sesi Member bertanda tangan digital
export async function createMemberSessionToken(memberId: string): Promise<string> {
  const timestamp = Date.now().toString();
  const randomSalt = Math.random().toString(36).substring(2, 10);
  const payload = `voca_member:${encodeURIComponent(memberId)}:${timestamp}:${randomSalt}`;
  const signature = await generateHmacSignature(payload);
  return `${payload}.${signature}`;
}

// 4. Verifikasi token sesi Member dan kembalikan memberId asli
export async function verifyMemberSessionToken(token?: string | null): Promise<string | null> {
  if (!token || !token.includes(".")) return null;

  const lastDotIndex = token.lastIndexOf(".");
  const payload = token.substring(0, lastDotIndex);
  const providedSignature = token.substring(lastDotIndex + 1);

  if (!payload.startsWith("voca_member:")) return null;

  const parts = payload.split(":");
  if (parts.length < 4) return null;

  const memberId = decodeURIComponent(parts[1]);
  const tokenTime = parseInt(parts[2], 10);
  if (isNaN(tokenTime)) return null;

  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - tokenTime > maxAge) return null;

  const expectedSignature = await generateHmacSignature(payload);
  if (expectedSignature !== providedSignature) return null;

  return memberId;
}
