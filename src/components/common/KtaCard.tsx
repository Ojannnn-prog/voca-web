"use client";

import React, { useState } from "react";
import { VocaLogo } from "@/components/common/VocaLogo";
import { QrCode, Printer, RotateCw, CheckCircle2, Shield } from "lucide-react";

interface KtaMemberData {
  fullName: string;
  memberId: string;
  ageCategory?: string | null;
  programType?: string | null;
  sportBranch?: string | null;
  validUntil?: string | Date | null;
  status?: string | null;
  bloodType?: string | null;
}

interface KtaCardProps {
  member: KtaMemberData;
  showControls?: boolean;
}

export function KtaCard({ member, showControls = true }: KtaCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const formattedValidUntil = member.validUntil
    ? new Date(member.validUntil).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "10 Okt 2027";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Optional Control Toolbar */}
      {showControls && (
        <div className="flex items-center gap-3 mb-4 select-none">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-sm transition active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? "Lihat Sisi Depan" : "Lihat Sisi Belakang"}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak KTA</span>
          </button>
        </div>
      )}

      {/* ISO/IEC 7810 ID-1 Standard Sized Card (85.60 mm × 53.98 mm -> Ratio 1.585 : 1) */}
      <div
        id="kta-printable-card"
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer relative w-[340px] sm:w-[400px] aspect-[1.585/1] rounded-[18px] bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#3A506B] text-white p-5 sm:p-6 shadow-2xl border border-white/20 select-none overflow-hidden transition-all duration-500 hover:shadow-cyan-900/20"
      >
        {/* Grainy Noise Texture & Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#5E17EB]/20 via-transparent to-transparent pointer-events-none" />

        {!isFlipped ? (
          // ================= SISI DEPAN =================
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
              {/* Photo / Avatar Placeholder */}
              <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl bg-gradient-to-tr from-white/10 to-white/20 border border-white/25 flex flex-col items-center justify-center font-bold text-xl sm:text-2xl text-white/80 shrink-0 shadow-inner">
                <span>{member.fullName.charAt(0)}</span>
                <span className="text-[8px] font-mono font-normal text-white/50 mt-1">
                  {member.bloodType ? `Gol: ${member.bloodType}` : "VOCA"}
                </span>
              </div>

              {/* Data Anggota */}
              <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                <p className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {member.fullName}
                </p>
                <p className="text-xs font-mono text-[#FFC700] font-bold tracking-wider">
                  {member.memberId}
                </p>
                <p className="text-[10px] sm:text-[11px] text-white/80 font-medium truncate">
                  {member.sportBranch || "Renang & Akuatik"} • {member.ageCategory || "Reguler"}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{member.status === "active" ? "Aktif" : member.status || "Aktif"}</span>
                  </span>
                  <span className="text-[9px] text-purple-200 bg-purple-500/20 px-1.5 py-0.5 rounded font-semibold truncate">
                    {member.programType || "Reguler Member"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Card */}
            <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[9px] text-white/70">
              <span className="font-mono">Masa Aktif: {formattedValidUntil}</span>
              <div className="flex items-center gap-1 font-mono text-white/90">
                <QrCode className="w-3.5 h-3.5 text-white" />
                <span>OFFICIAL ID</span>
              </div>
            </div>
          </div>
        ) : (
          // ================= SISI BELAKANG =================
          <div className="h-full flex flex-col justify-between text-left relative z-10 text-[10px]">
            {/* Magnetic Stripe Mockup */}
            <div className="w-full h-8 bg-neutral-950/80 -mx-6 -mt-6 sm:-mt-6 mb-3 border-y border-white/10" />

            <div className="space-y-1.5 text-white/80 text-[9px] sm:text-[10px] leading-relaxed">
              <p className="font-bold text-white uppercase tracking-wider text-[10px]">
                Ketentuan Keanggotaan VOCA
              </p>
              <p>1. Kartu ini merupakan bukti keanggotaan resmi Vortex Community of Athletics.</p>
              <p>2. Presensi latihan wajib memindai QR Code resmi kartu kepada instruktur.</p>
              <p className="italic text-[#FFC700]">
                &ldquo;Every Movement Matters — From First Steps to Great Achievements.&rdquo;
              </p>
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
    </div>
  );
}
