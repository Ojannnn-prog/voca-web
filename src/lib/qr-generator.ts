import QRCode from "qrcode";

/**
 * VOCA Athletic Community - Digital QR Code Engine
 * Menghasilkan data QR Code beresolusi tinggi untuk KTA Anggota Digital dan Kartu Pelatih Resmi
 */

export interface QrPayload {
  type: "member" | "coach";
  id: string; // VOCA-2026-xxx atau COACH-xxx
  name: string;
  category?: string | null;
  issuedAt: string;
}

export async function generateQrDataUrl(payload: QrPayload | string): Promise<string> {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: "#1A1A24",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
    return dataUrl;
  } catch (error) {
    console.error("Gagal men-generate QR Code:", error);
    return "";
  }
}

export function createMemberQrPayload(member: {
  memberId: string;
  fullName: string;
  ageCategory?: string | null;
}): QrPayload {
  return {
    type: "member",
    id: member.memberId,
    name: member.fullName,
    category: member.ageCategory || "Member",
    issuedAt: new Date().toISOString().slice(0, 10),
  };
}

export function createCoachQrPayload(coach: {
  coachCode?: string | null;
  fullName: string;
  specialty?: string | null;
}): QrPayload {
  return {
    type: "coach",
    id: coach.coachCode || `COACH-${coach.fullName.replace(/\s+/g, "").toUpperCase().slice(0, 5)}`,
    name: coach.fullName,
    category: coach.specialty || "Pelatih Atletik",
    issuedAt: new Date().toISOString().slice(0, 10),
  };
}
