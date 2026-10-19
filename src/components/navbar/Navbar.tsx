"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VocaLogo } from "@/components/common/VocaLogo";
import { NAV_LINKS } from "@/lib/constants";
import {
  Home,
  Search,
  Clock,
  User,
  Sparkles,
  LogIn,
} from "lucide-react";

interface NavbarProps {
  onOpenRegister: () => void;
  isDarkMode?: boolean;
}

export function Navbar({ onOpenRegister, isDarkMode = false }: NavbarProps) {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<"home" | "programs" | "daftar" | "membership" | "account">("home");
  const [activeSectionTitle, setActiveSectionTitle] = useState<string>("");

  // Track scroll position & active section across all sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setScrollY(scrollPos);

      const analyticsEl = document.getElementById("analytics-section");
      const programsEl = document.getElementById("programs");
      const membershipEl = document.getElementById("membership");
      const pathwayEl = document.getElementById("pathway");
      const aboutEl = document.getElementById("about");

      if (aboutEl && scrollPos >= aboutEl.offsetTop - 260) {
        setActiveSectionTitle("Tentang VOCA");
      } else if (pathwayEl && scrollPos >= pathwayEl.offsetTop - 260) {
        setActiveSectionTitle("Jalur Pembinaan");
      } else if (membershipEl && scrollPos >= membershipEl.offsetTop - 260) {
        setActiveTab("membership");
        setActiveSectionTitle("Biaya & Paket");
      } else if (programsEl && scrollPos >= programsEl.offsetTop - 260) {
        setActiveTab("programs");
        setActiveSectionTitle("Katalog Program");
      } else if (analyticsEl && scrollPos >= analyticsEl.offsetTop - 260) {
        setActiveTab("home");
        setActiveSectionTitle("Evaluasi & Riset");
      } else {
        setActiveTab("home");
        setActiveSectionTitle("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Safeguard: hero dark mode is ONLY valid during the pinned hero stage (< 650px)
  const effectiveDarkMode = isDarkMode && scrollY < 650;

  const handleNavClick = (tab: "home" | "programs" | "daftar" | "membership" | "account", targetId?: string) => {
    setActiveTab(tab);

    if (tab === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "daftar") {
      onOpenRegister();
    } else if (tab === "account") {
      router.push("/login");
    } else if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (DESKTOP: FLOATING PILL | MOBILE: ENCLOSED FROSTED CAPSULE) */}
      {/* ========================================================================= */}
      <header
        id="navbar"
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-all duration-300 w-full"
      >
        {/* DESKTOP VIEW (lg:flex, hidden on mobile) */}
        <div className="hidden lg:flex w-full items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* BRAND LOGO (KIRI) */}
          <Link
            href="/"
            id="nav-logo"
            className="transition-transform duration-300 hover:scale-105 focus:outline-none shrink-0"
            aria-label="Beranda VOCA"
          >
            <VocaLogo
              variant="full"
              theme={effectiveDarkMode ? "pink" : "color"}
              size="md"
            />
          </Link>

          {/* DESKTOP ONLY: FLOATING WHITE CAPSULE PILL DI TENGAH */}
          <nav
            id="nav-pill"
            className="flex items-center space-x-3.5 xl:space-x-6 px-5 py-2.5 xl:px-7 xl:py-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-black/8 border border-neutral-200/90 text-xs xl:text-sm font-semibold transition-all duration-300 hover:shadow-xl shrink-0"
          >
            {NAV_LINKS.map((item) => {
              const isRegistration = item.href === "#pendaftaran" || item.isSpecial;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (isRegistration) {
                      e.preventDefault();
                      onOpenRegister();
                    }
                  }}
                  className={`transition-all duration-200 whitespace-nowrap ${
                    isRegistration
                      ? "text-[#5E17EB] font-bold hover:text-[#4b11bd] hover:scale-105"
                      : "text-neutral-700 hover:text-black hover:scale-102"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS: TOMBOL MASUK */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/login"
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all border shrink-0 ${
                effectiveDarkMode
                  ? "bg-white text-[#5E17EB] border-white/80 hover:bg-neutral-100 shadow-md"
                  : "bg-[#5E17EB] text-white border-transparent hover:bg-[#4d10c7] shadow-sm shadow-purple-500/20"
              }`}
              title="Masuk ke Portal Member atau Panel Admin"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </Link>
          </div>
        </div>

        {/* MOBILE VIEW (flex on mobile, lg:hidden) - FLOATING FROSTED BAR DENGAN SECTION CHIP */}
        <div
          className={`flex lg:hidden items-center justify-between gap-2 px-3.5 py-2 rounded-2xl sm:rounded-full transition-all duration-300 shadow-md ${
            effectiveDarkMode
              ? "bg-[#160033]/90 backdrop-blur-xl border border-white/20 shadow-purple-950/40 text-white"
              : scrollY > 40
              ? "bg-white/95 backdrop-blur-xl border border-neutral-200/90 shadow-lg shadow-black/6 text-neutral-900"
              : "bg-white/90 backdrop-blur-md border border-neutral-200/70 shadow-sm text-neutral-900"
          }`}
        >
          {/* LOGO RESMI VOCA */}
          <Link
            href="/"
            className="transition-transform duration-200 active:scale-95 focus:outline-none shrink-0"
            aria-label="Beranda VOCA"
          >
            <VocaLogo
              variant="full"
              theme={effectiveDarkMode ? "pink" : "color"}
              size="sm"
            />
          </Link>

          {/* ACTIVE SECTION BADGE CHIP (PENANDA SECTION YANG SEDANG DILIHAT DI MOBILE) */}
          {activeSectionTitle && scrollY > 200 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5E17EB]/10 border border-[#5E17EB]/25 text-[10px] font-bold text-[#5E17EB] animate-fadeIn whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5E17EB] animate-pulse" />
              <span>{activeSectionTitle}</span>
            </div>
          )}

          {/* TOMBOL MASUK DENGAN KONTRAS TINGGI SOLID */}
          <Link
            href="/login"
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
              effectiveDarkMode
                ? "bg-white text-[#5E17EB] hover:bg-neutral-100 shadow-sm"
                : "bg-[#5E17EB] text-white hover:bg-[#4d10c7] shadow-sm shadow-purple-500/20 active:scale-95"
            }`}
            title="Masuk ke Portal Member atau Panel Admin"
          >
            <LogIn className="w-3 h-3" />
            <span>Masuk</span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM APP BAR (ICON MENU DI BAWAH SEPERTI PADA GAMBAR CONTOH) */}
      {/* ========================================================================= */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Navigasi Menu Mobile Bawah"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] transition-all select-none"
        style={{
          paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="grid grid-cols-5 items-center justify-items-center h-16 max-w-md mx-auto px-1">
          {/* TAB 1: HOME */}
          <button
            onClick={() => handleNavClick("home")}
            className={`flex flex-col items-center justify-center w-full py-1.5 transition-transform active:scale-90 ${
              activeTab === "home" ? "text-[#5E17EB]" : "text-neutral-500 hover:text-neutral-800"
            }`}
            aria-label="Beranda"
          >
            {/* Outline House Icon seperti gambar contoh */}
            <svg
              className="w-6 h-6 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === "home" ? "2.3" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10.5L12 3l9 7.5v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors ${
                activeTab === "home" ? "font-bold text-[#5E17EB]" : "font-medium text-neutral-500"
              }`}
            >
              Home
            </span>
          </button>

          {/* TAB 2: SEARCH / PROGRAM */}
          <button
            onClick={() => handleNavClick("programs", "programs")}
            className={`flex flex-col items-center justify-center w-full py-1.5 transition-transform active:scale-90 ${
              activeTab === "programs" ? "text-[#5E17EB]" : "text-neutral-500 hover:text-neutral-800"
            }`}
            aria-label="Program VOCA"
          >
            {/* Outline Search Icon seperti gambar contoh */}
            <svg
              className="w-6 h-6 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === "programs" ? "2.3" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors ${
                activeTab === "programs" ? "font-bold text-[#5E17EB]" : "font-medium text-neutral-500"
              }`}
            >
              Program
            </span>
          </button>

          {/* TAB 3: DAFTAR / TRIAL (CENTER HIGHLIGHTED PURPLE TAB SEPERTI GAMBAR CONTOH) */}
          <button
            onClick={() => handleNavClick("daftar")}
            className="flex flex-col items-center justify-center w-full py-1 transition-transform active:scale-90 select-none group"
            aria-label="Daftar Trial Class"
          >
            {/* Solid Purple Segmented Shape persis seperti Analytics pada gambar referensi */}
            <div className="relative flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#5E17EB] transition-transform group-hover:scale-105"
                viewBox="0 0 28 28"
                fill="none"
              >
                {/* Bagian Bawah-Kiri Segmen Melengkung Ungu Solid */}
                <path
                  d="M13.5 6.5C8.8 6.5 5 10.3 5 15C5 19.7 8.8 23.5 13.5 23.5C18.2 23.5 22 19.7 22 15C22 14.2 21.3 13.5 20.5 13.5H15C14.2 13.5 13.5 12.8 13.5 12V6.5Z"
                  fill="#5E17EB"
                />
                {/* Potongan Atas-Kanan Melengkung Ungu Solid */}
                <path
                  d="M16 4.5C16 3.7 16.7 3 17.5 3C20.5 3 23 5.5 23 8.5C23 9.3 22.3 10 21.5 10H17.5C16.7 10 16 9.3 16 8.5V4.5Z"
                  fill="#5E17EB"
                />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#5E17EB] mt-0.5 tracking-tight">
              Daftar
            </span>
          </button>

          {/* TAB 4: BIAYA / MEMBERSHIP / HISTORY */}
          <button
            onClick={() => handleNavClick("membership", "membership")}
            className={`flex flex-col items-center justify-center w-full py-1.5 transition-transform active:scale-90 ${
              activeTab === "membership" ? "text-[#5E17EB]" : "text-neutral-500 hover:text-neutral-800"
            }`}
            aria-label="Biaya & Membership"
          >
            {/* Outline Clock Icon persis seperti History pada gambar contoh */}
            <svg
              className="w-6 h-6 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === "membership" ? "2.3" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15.5 14" />
            </svg>
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors ${
                activeTab === "membership" ? "font-bold text-[#5E17EB]" : "font-medium text-neutral-500"
              }`}
            >
              Biaya
            </span>
          </button>

          {/* TAB 5: AKUN / PROFILE */}
          <button
            onClick={() => handleNavClick("account")}
            className={`flex flex-col items-center justify-center w-full py-1.5 transition-transform active:scale-90 ${
              activeTab === "account" ? "text-[#5E17EB]" : "text-neutral-500 hover:text-neutral-800"
            }`}
            aria-label="Akun & Login"
          >
            {/* Outline User Profile Icon persis seperti Profile pada gambar contoh */}
            <svg
              className="w-6 h-6 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === "account" ? "2.3" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors ${
                activeTab === "account" ? "font-bold text-[#5E17EB]" : "font-medium text-neutral-500"
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
