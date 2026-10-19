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
      className="relative py-24 sm:py-32 bg-white text-neutral-900 border-t border-neutral-100 overflow-hidden"
    >
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-100/50 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-blue-50/70 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15] mb-4">
            Pilihan Paket Keanggotaan VOCA
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
            Investasi pembinaan fisik dan motorik berstandar tinggi dengan rasio pelatih ideal.
            Pilih kelas kelompok kecil terpadu atau pendampingan privat 1-on-1 intensif.
          </p>
        </div>

        {/* Pricing Cards Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ================= 1. CARD REGULER MEMBER ================= */}
          <div className="relative bg-[#F8F9FA] rounded-[32px] border border-neutral-200/90 p-7 sm:p-9 flex flex-col justify-between hover:border-neutral-300 hover:shadow-xl transition-all duration-300 shadow-sm">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Kelas Kelompok Kecil
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] font-semibold text-neutral-700 shadow-xs">
                  Maks. 3 Murid
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                {regulerData.title}
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                {regulerData.subtitle}
              </p>

              {/* Category Pill Switcher (Balita, Anak-anak, Remaja, Casis, dll) */}
              <div className="mb-6">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">
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
                            ? "bg-neutral-900 text-white font-bold shadow-sm scale-102"
                            : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/80"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 mb-6 shadow-sm">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-sm sm:text-base text-neutral-500 font-medium">Rp</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
                    {currentCategory.priceDisplay}
                  </span>
                  <span className="text-neutral-500 text-xs sm:text-sm font-medium">
                    {currentCategory.period}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <span>Kategori: <strong className="text-neutral-900">{currentCategory.name}</strong></span>
                  <span className="bg-neutral-100 px-2.5 py-0.5 rounded text-[11px] text-neutral-700 font-medium">
                    {currentCategory.age}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => onSelectPlan("reguler", currentCategory.id)}
                className="w-full py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 mb-8"
              >
                <span>Pilih Reguler Member</span>
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              </button>

              {/* Benefits Checklist */}
              <div className="space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Benefit Reguler Member:
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-700">
                  {regulerData.benefits.map((benefit, idx) => {
                    const Icon = regulerIcons[idx] || CheckCircle2;
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-md bg-neutral-200/80 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
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
            <div className="pt-6 mt-8 border-t border-neutral-200/80 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Rasio: 1 Pelatih : 3 Murid</span>
              <span>Terbuka untuk Semua Usia</span>
            </div>
          </div>

          {/* ================= 2. CARD PREMIUM PRIVATE CLASS ================= */}
          <div className="relative bg-white rounded-[32px] border-2 border-[#5E17EB] p-7 sm:p-9 flex flex-col justify-between hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 shadow-lg shadow-purple-500/5">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#5E17EB] uppercase tracking-wider">
                  Bimbingan Eksklusif
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-[#5E17EB]">
                  1 Murid : 1 Pelatih
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <span>{premiumData.title}</span>
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                {premiumData.subtitle}
              </p>

              {/* Highlight Tagline Feature */}
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-100 mb-6 flex items-center gap-2.5 text-xs text-purple-900 font-medium">
                <Target className="w-4 h-4 text-[#5E17EB] shrink-0" />
                <span>Program latihan disesuaikan 100% dengan kebutuhan fisik dan target Anda.</span>
              </div>

              {/* Price Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 border border-purple-200/80 mb-6 shadow-xs">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm sm:text-base text-neutral-500 font-medium">Mulai dari</span>
                  <span className="text-sm text-neutral-400 line-through">Rp 550.000</span>
                  <span className="text-sm sm:text-base text-[#5E17EB] font-bold">Rp</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#5E17EB] tracking-tight">
                    {premiumData.startingPriceDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-600 pt-2 border-t border-purple-100">
                  <span>Sistem: <strong className="text-neutral-900">Privat 1-on-1 Intensif</strong></span>
                  <span className="bg-[#5E17EB]/10 text-[#5E17EB] px-2.5 py-0.5 rounded text-[11px] font-bold">
                    Jadwal Fleksibel
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => onSelectPlan("premium_private", "all")}
                className="w-full py-3.5 px-6 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] active:bg-[#3d08a3] text-white text-sm font-bold transition-all shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/35 active:scale-98 flex items-center justify-center gap-2 mb-8"
              >
                <span>Daftar Premium Private Class</span>
                <ChevronRight className="w-4 h-4 text-purple-200" />
              </button>

              {/* Benefits Checklist */}
              <div className="space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5E17EB]">
                  Benefit Premium Private:
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-700">
                  {premiumData.benefits.map((benefit, idx) => {
                    const Icon = premiumIcons[idx] || CheckCircle2;
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-md bg-purple-100 text-[#5E17EB] flex items-center justify-center shrink-0 mt-0.5 border border-purple-200/60">
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
            <div className="pt-6 mt-8 border-t border-purple-100 text-[11px] text-neutral-500 flex items-center justify-between">
              <span className="text-[#5E17EB] font-bold">Bimbingan 1 Murid : 1 Pelatih</span>
              <span>Konsultasi Langsung Coach</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
