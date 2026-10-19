"use client";

import React, { useState } from "react";
import { MEMBERSHIP_DATA } from "@/lib/constants";
import {
  Users,
  Award,
  Target,
  HeartHandshake,
  LineChart,
  UserCheck,
  CalendarCheck,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: (plan: "reguler" | "premium_private", categoryId?: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  const regulerData = MEMBERSHIP_DATA.reguler;
  const currentCategory = regulerData.categories[selectedCategoryIndex];
  const premiumData = MEMBERSHIP_DATA.premium;

  const regulerIcons = [
    Users, // Maksimal 3 murid per latihan
    Award, // Pelatih berpengalaman
    HeartHandshake, // Interaksi sosial dan kegiatan bersama
    LineChart, // Evaluasi perkembangan secara berkala
  ];

  const premiumIcons = [
    UserCheck, // Latihan privat 1 peserta 1 pelatih
    Award, // Pelatih berpengalaman
    Target, // Program latihan personal disesuaikan
    CalendarCheck, // Jadwal kesepakatan & ketersediaan
    ShieldCheck, // Pendampingan lebih intensif
    LineChart, // Evaluasi individual lebih terperinci
    MessageSquare, // Konsultasi perkembangan dengan pelatih
  ];

  return (
    <section
      id="membership"
      className="relative py-24 sm:py-32 bg-[#0A0D14] text-white overflow-hidden"
    >
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#5E17EB]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-[#21649D]/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Pilihan Paket Keanggotaan VOCA
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Investasi pembinaan fisik dan motorik berstandar tinggi dengan rasio pelatih ideal.
            Pilih kelas kelompok kecil terpadu atau pendampingan privat 1-on-1 intensif.
          </p>
        </div>

        {/* Pricing Cards Comparison Grid (Inspirasi ChatGPT Offer) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ================= 1. CARD REGULER MEMBER ================= */}
          <div className="relative bg-[#121620] rounded-[28px] border border-white/10 p-7 sm:p-9 flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                  Kelas Kelompok Kecil
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-neutral-300">
                  Maks. 3 Murid
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {regulerData.title}
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                {regulerData.subtitle}
              </p>

              {/* Category Pill Switcher (Balita, Anak-anak, Remaja, Casis, dll) */}
              <div className="mb-6">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2.5">
                  Pilih Kategori Usia / Program:
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {regulerData.categories.map((cat, idx) => {
                    const isSelected = idx === selectedCategoryIndex;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryIndex(idx)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-white text-neutral-900 font-bold shadow-md shadow-white/10 scale-102"
                            : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-sm sm:text-base text-neutral-400 font-medium">Rp</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {currentCategory.priceDisplay}
                  </span>
                  <span className="text-neutral-400 text-xs sm:text-sm font-medium">
                    {currentCategory.period}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
                  <span>Kategori: <strong className="text-white">{currentCategory.name}</strong></span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] text-neutral-300">
                    {currentCategory.age}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => onSelectPlan("reguler", currentCategory.id)}
                className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 mb-8"
              >
                <span>Pilih Reguler Member</span>
                <ChevronRight className="w-4 h-4 text-neutral-700" />
              </button>

              {/* Benefits Checklist */}
              <div className="space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Benefit Reguler Member:
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
                  {regulerData.benefits.map((benefit, idx) => {
                    const Icon = regulerIcons[idx] || CheckCircle2;
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{benefit}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Bottom note */}
            <div className="pt-6 mt-8 border-t border-white/5 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Rasio: 1 Pelatih : 3 Murid</span>
              <span>Terbuka untuk Semua Usia</span>
            </div>
          </div>

          {/* ================= 2. CARD PREMIUM PRIVATE CLASS ================= */}
          <div className="relative bg-gradient-to-b from-[#141B2D] to-[#0E131F] rounded-[28px] border-2 border-[#5E17EB]/60 p-7 sm:p-9 flex flex-col justify-between hover:border-[#5E17EB] transition-all duration-300 shadow-2xl shadow-purple-950/40">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                  Bimbingan Eksklusif
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] font-semibold text-purple-200">
                  1 Murid : 1 Pelatih
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <span>{premiumData.title}</span>
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-6">
                {premiumData.subtitle}
              </p>

              {/* Highlight Tagline Feature */}
              <div className="p-3.5 rounded-xl bg-purple-900/20 border border-purple-500/20 mb-6 flex items-center gap-2.5 text-xs text-purple-200">
                <Target className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Program latihan disesuaikan 100% dengan kebutuhan fisik dan target Anda.</span>
              </div>

              {/* Price Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-purple-500/20 mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm sm:text-base text-neutral-400 font-medium">Mulai dari</span>
                  <span className="text-sm text-neutral-400 line-through">Rp 550.000</span>
                  <span className="text-sm sm:text-base text-purple-300 font-bold">Rp</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300">
                    {premiumData.startingPriceDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
                  <span>Sistem: <strong className="text-white">Privat 1-on-1 Intensif</strong></span>
                  <span className="bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                    Jadwal Fleksibel
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => onSelectPlan("premium_private", "all")}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5E17EB] to-[#2563EB] hover:from-[#4f10cd] hover:to-[#1d4ed8] active:from-[#3b08a3] active:to-[#1e40af] text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/30 hover:shadow-xl hover:scale-101 active:scale-98 flex items-center justify-center gap-2 mb-8"
              >
                <span>Daftar Premium Private Class</span>
              </button>

              {/* Benefits Checklist */}
              <div className="space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Benefit Premium Private:
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-200">
                  {premiumData.benefits.map((benefit, idx) => {
                    const Icon = premiumIcons[idx] || CheckCircle2;
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{benefit}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Bottom note */}
            <div className="pt-6 mt-8 border-t border-white/5 text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="text-purple-300 font-medium">Bimbingan 1 Murid : 1 Pelatih</span>
              <span>Konsultasi Langsung Coach</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
