"use client";

import React, { useState, useRef, useEffect } from "react";
import { VocaLogo } from "@/components/common/VocaLogo";
import { QrCode, Download, RotateCw, CheckCircle2, Loader2, Printer, Eye } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateQrDataUrl, createMemberQrPayload } from "@/lib/qr-generator";

export interface KtaMemberData {
  fullName: string;
  memberId: string;
  ageCategory?: string | null;
  programType?: string | null;
  sportBranch?: string | null;
  validUntil?: string | Date | null;
  status?: string | null;
  bloodType?: string | null;
  photoUrl?: string | null;
}

interface KtaCardProps {
  member: KtaMemberData;
  showControls?: boolean;
}

export function KtaCard({ member, showControls = true }: KtaCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const frontRenderRef = useRef<HTMLDivElement>(null);
  const backRenderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (member?.memberId) {
      const payload = createMemberQrPayload({
        memberId: member.memberId,
        fullName: member.fullName,
        ageCategory: member.ageCategory,
      });
      generateQrDataUrl(payload).then((url) => {
        if (url) setQrCodeDataUrl(url);
      });
    }
  }, [member]);

  const formattedValidUntil = member.validUntil
    ? new Date(member.validUntil).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "10 Okt 2027";

  // Fitur Export Direct PDF (Format Resmi Standar Kartu ISO ID-1)
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const frontEl = frontRenderRef.current;
      const backEl = backRenderRef.current;

      if (!frontEl || !backEl) {
        throw new Error("Elemen KTA tidak ditemukan untuk render PDF.");
      }

      // Render Sisi Depan dengan resolusi tinggi (scale 3x)
      const frontCanvas = await html2canvas(frontEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // Render Sisi Belakang dengan resolusi tinggi (scale 3x)
      const backCanvas = await html2canvas(backEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const frontImgData = frontCanvas.toDataURL("image/png");
      const backImgData = backCanvas.toDataURL("image/png");

      // Standar ISO/IEC 7810 ID-1: 85.60 mm × 53.98 mm
      const cardWidth = 85.6;
      const cardHeight = 53.98;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [cardWidth, cardHeight],
      });

      // Halaman 1: Sisi Depan
      pdf.addImage(frontImgData, "PNG", 0, 0, cardWidth, cardHeight, undefined, "FAST");

      // Halaman 2: Sisi Belakang
      pdf.addPage([cardWidth, cardHeight], "landscape");
      pdf.addImage(backImgData, "PNG", 0, 0, cardWidth, cardHeight, undefined, "FAST");

      const cleanName = member.fullName.replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`KTA_VOCA_${member.memberId}_${cleanName}.pdf`);
    } catch (err) {
      console.error("Gagal men-download PDF KTA:", err);
      alert("Terjadi kendala saat menghasilkan file PDF. Silakan coba kembali.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Control Toolbar */}
      {showControls && (
        <div className="flex items-center gap-2.5 mb-4 select-none flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-sm transition active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5 text-neutral-500" />
            <span>{isFlipped ? "Lihat Sisi Depan" : "Lihat Sisi Belakang"}</span>
          </button>

          {/* Tombol Langsung Download Format PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-75"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Resmi</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            title="Cetak langsung melalui printer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      )}

      {/* Interactive Display Card (Flip on Click) */}
      <div
        id="kta-interactive-preview"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          background: "linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #3A506B 100%)",
          color: "#ffffff",
        }}
        className="cursor-pointer relative w-[340px] sm:w-[410px] aspect-[1.585/1] rounded-[18px] text-white p-5 sm:p-6 shadow-2xl border border-white/20 select-none overflow-hidden transition-all duration-500 hover:shadow-cyan-900/30"
      >
        {/* Grainy Noise Texture & Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#5E17EB]/30 via-transparent to-transparent pointer-events-none" />

        {!isFlipped ? (
          // ================= SISI DEPAN INTERAKTIF =================
          <div className="h-full flex flex-col justify-between relative z-10">
            {/* Header Card */}
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <VocaLogo variant="full" theme="light" size="sm" />
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono tracking-widest uppercase bg-white/15 px-2 py-0.5 rounded-full text-neutral-200">
                  MEMBER CARD
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Body Card */}
            <div className="flex items-center gap-3.5 my-auto">
              {/* Photo / Avatar Box */}
              <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl bg-gradient-to-tr from-white/10 to-white/20 border border-white/25 flex flex-col items-center justify-center font-bold text-xl sm:text-2xl text-white/80 shrink-0 shadow-inner overflow-hidden">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <>
                    <span>{member.fullName.charAt(0)}</span>
                    <span className="text-[8px] font-mono font-normal text-white/60 mt-1">
                      {member.bloodType ? `Gol: ${member.bloodType}` : "VOCA"}
                    </span>
                  </>
                )}
              </div>

              {/* Data Anggota */}
              <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                <p className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {member.fullName}
                </p>
                <p className="text-xs font-mono text-[#FFC700] font-bold tracking-wider">
                  {member.memberId}
                </p>
                <p className="text-[10px] sm:text-[11px] text-white/85 font-medium truncate">
                  {member.sportBranch || "Renang & Akuatik"} • {member.ageCategory || "Reguler"}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{member.status === "active" ? "Aktif" : member.status || "Aktif"}</span>
                  </span>
                  <span className="text-[9px] text-purple-200 bg-purple-500/20 px-1.5 py-0.5 rounded font-semibold truncate border border-purple-400/20">
                    {member.programType || "Reguler Member"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Card */}
            <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[9px] text-white/75">
              <span className="font-mono">Masa Aktif: {formattedValidUntil}</span>
              <div className="flex items-center gap-1 font-mono text-white/95">
                <QrCode className="w-3.5 h-3.5 text-white" />
                <span>OFFICIAL ID</span>
              </div>
            </div>
          </div>
        ) : (
          // ================= SISI BELAKANG INTERAKTIF =================
          <div className="h-full flex flex-col justify-between text-left relative z-10 text-[10px]">
            {/* Magnetic Stripe Mockup */}
            <div className="w-full h-8 bg-neutral-950/80 -mx-6 -mt-6 sm:-mt-6 mb-3 border-y border-white/10" />

            <div className="flex items-center gap-4 text-white/85 text-[9px] sm:text-[10px] leading-relaxed">
              <div className="space-y-1.5 flex-1">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">
                  Ketentuan Keanggotaan VOCA
                </p>
                <p>1. Kartu ini merupakan bukti keanggotaan resmi Vortex Community of Athletics.</p>
                <p>2. Presensi latihan wajib memindai QR Code resmi kartu kepada instruktur.</p>
                <p className="italic text-[#FFC700] font-medium">
                  &ldquo;Every Movement Matters — From First Steps to Great Achievements.&rdquo;
                </p>
              </div>
              {qrCodeDataUrl && (
                <div className="w-20 h-20 bg-white p-1.5 rounded-xl shrink-0 flex flex-col items-center justify-center shadow-lg">
                  <img src={qrCodeDataUrl} alt="QR Presensi" className="w-full h-full object-contain" />
                  <span className="text-[7px] text-neutral-800 font-bold font-mono mt-0.5">SCAN PRESENSI</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/15 flex justify-between items-end text-[9px]">
              <div>
                <p className="text-white/60">Sekretariat:</p>
                <p className="font-bold text-white">voca-athletics.com</p>
              </div>
              <div className="text-right">
                <p className="italic text-white/70 text-[8px]">Ketua Umum VOCA</p>
                <p className="font-bold text-white text-[10px]">Dewan Pembina</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-neutral-400 mt-2 select-none">
        Klik kartu untuk membalik (Depan / Belakang)
      </p>

      {/* =========================================================================
          OFFSCREEN FULL RENDER CONTAINERS FOR ULTRA HIGH DEFINITION PDF EXPORT
          Ensures both sides are captured with exact standard ISO ID-1 proportions,
          pristine dark gradient background, and no CSS clipping / media print issues.
         ========================================================================= */}
      <div style={{ position: "fixed", left: "-9999px", top: "-9999px" }} aria-hidden="true">
        {/* Render Sisi Depan */}
        <div
          ref={frontRenderRef}
          style={{
            width: "500px",
            height: "315.4px", // 85.6 : 53.98 ratio
            background: "linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #3A506B 100%)",
            color: "#ffffff",
            padding: "26px",
            borderRadius: "20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
              paddingBottom: "10px",
            }}
          >
            <VocaLogo variant="full" theme="light" size="sm" />
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  background: "rgba(255, 255, 255, 0.15)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  color: "#e2e8f0",
                }}
              >
                MEMBER CARD
              </span>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: "#34d399",
                }}
              />
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", margin: "auto 0" }}>
            <div
              style={{
                width: "90px",
                height: "120px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.22))",
                border: "1.5px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "32px",
                color: "rgba(255,255,255,0.85)",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  crossOrigin="anonymous"
                />
              ) : (
                <>
                  <span>{member.fullName.charAt(0)}</span>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", marginTop: "4px", color: "rgba(255,255,255,0.6)" }}>
                    {member.bloodType ? `Gol: ${member.bloodType}` : "VOCA"}
                  </span>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.3px" }}>
                {member.fullName}
              </div>
              <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#FFC700", fontWeight: "bold", letterSpacing: "1px" }}>
                {member.memberId}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: "500" }}>
                {member.sportBranch || "Renang & Akuatik"} • {member.ageCategory || "Reguler"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.25)",
                    border: "1px solid rgba(16, 185, 129, 0.5)",
                    color: "#6ee7b7",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  <CheckCircle2 style={{ width: "11px", height: "11px" }} />
                  <span>{member.status === "active" ? "Aktif" : member.status || "Aktif"}</span>
                </span>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "rgba(139, 92, 246, 0.25)",
                    border: "1px solid rgba(139, 92, 246, 0.35)",
                    color: "#ddd6fe",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}
                >
                  {member.programType || "Reguler Member"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              paddingTop: "8px",
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.75)",
            }}
          >
            <span style={{ fontFamily: "monospace" }}>Masa Aktif: {formattedValidUntil}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "monospace", color: "#ffffff" }}>
              <QrCode style={{ width: "14px", height: "14px" }} />
              <span style={{ fontWeight: "bold" }}>OFFICIAL ID</span>
            </div>
          </div>
        </div>

        {/* Render Sisi Belakang */}
        <div
          ref={backRenderRef}
          style={{
            width: "500px",
            height: "315.4px",
            background: "linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #3A506B 100%)",
            color: "#ffffff",
            padding: "26px",
            borderRadius: "20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Magnetic Stripe Bar */}
          <div
            style={{
              width: "calc(100% + 52px)",
              height: "38px",
              background: "rgba(10, 10, 10, 0.85)",
              margin: "-26px -26px 14px -26px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "rgba(255,255,255,0.85)", fontSize: "11px", lineHeight: "1.5" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontWeight: "800", color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px", fontSize: "12px" }}>
                Ketentuan Keanggotaan VOCA
              </div>
              <div>1. Kartu ini merupakan bukti keanggotaan resmi Vortex Community of Athletics.</div>
              <div>2. Presensi latihan wajib memindai QR Code resmi kartu kepada instruktur.</div>
              <div style={{ fontStyle: "italic", color: "#FFC700", fontWeight: "600", marginTop: "2px" }}>
                &ldquo;Every Movement Matters — From First Steps to Great Achievements.&rdquo;
              </div>
            </div>
            {qrCodeDataUrl && (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "#ffffff",
                  padding: "6px",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <img src={qrCodeDataUrl} alt="QR Presensi" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              paddingTop: "10px",
              fontSize: "11px",
            }}
          >
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px" }}>Sekretariat:</div>
              <div style={{ fontWeight: "bold", color: "#ffffff" }}>voca-athletics.com</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "10px" }}>Ketua Umum VOCA</div>
              <div style={{ fontWeight: "bold", color: "#ffffff", fontSize: "12px" }}>Dewan Pembina</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
