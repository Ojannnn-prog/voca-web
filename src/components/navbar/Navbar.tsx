"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VocaLogo } from "@/components/common/VocaLogo";
import { NAV_LINKS } from "@/lib/constants";
import { Menu, X, Shield, User, Sparkles, LogIn } from "lucide-react";

interface NavbarProps {
  onOpenRegister: () => void;
  isDarkMode?: boolean;
}

export function Navbar({ onOpenRegister, isDarkMode = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        id="navbar"
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 sm:py-4 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* ================= 1. BRAND LOGO (KIRI) ================= */}
          <Link
            href="/"
            id="nav-logo"
            className="transition-transform duration-300 hover:scale-105 focus:outline-none shrink-0"
            aria-label="Beranda VOCA"
          >
            <VocaLogo
              variant="full"
              theme={isDarkMode ? "pink" : "color"}
              size="md"
            />
          </Link>

          {/* ================= 2. PERSISTENT FLOATING WHITE CAPSULE PILL (TENGAH) ================= */}
          {/* Persis sesuai foto acuan: kapsul putih melayang di seluruh seksi */}
          <nav
            id="nav-pill"
            className="hidden lg:flex items-center space-x-6 xl:space-x-8 px-8 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-black/8 border border-neutral-200/90 text-sm font-semibold transition-all duration-300 hover:shadow-xl shrink-0"
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

          {/* ================= 3. RIGHT ACTIONS: LOGIN & SPECIAL CTA ================= */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0">
            {/* Tombol Masuk / Login (Menuju /login dengan pilihan Admin / Member) */}
            <Link
              href="/login"
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all border ${
                isDarkMode
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50 shadow-sm"
              }`}
              title="Masuk ke Portal Member atau Panel Admin"
            >
              <LogIn className="w-3.5 h-3.5 text-[#5E17EB]" />
              <span>Masuk</span>
            </Link>

            {/* CTA DAFTAR KHUSUS (High Contrast, Ultra-Clickable, Sangat Mudah Diklik) */}
            <button
              id="nav-cta"
              onClick={onOpenRegister}
              className="group relative inline-flex items-center gap-2 bg-[#5E17EB] hover:bg-[#4b11bd] active:bg-[#3b08a3] text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-full shadow-md shadow-[#5E17EB]/25 hover:shadow-xl hover:shadow-[#5E17EB]/40 transform hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#5E17EB]/30 min-h-[42px]"
              aria-label="Buka Formulir Pendaftaran Trial Class"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>Daftar Sekarang</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-full border transition-all ${
                isDarkMode
                  ? "text-white bg-white/10 border-white/20"
                  : "text-neutral-800 bg-white border-neutral-200 shadow-sm"
              }`}
              aria-label="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-6 flex flex-col justify-between pb-8 lg:hidden animate-fadeIn">
          {/* Main Links */}
          <div className="flex flex-col space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Navigasi Halaman
            </p>
            {NAV_LINKS.map((item) => {
              const isRegistration = item.href === "#pendaftaran" || item.isSpecial;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (isRegistration) {
                      e.preventDefault();
                      onOpenRegister();
                    }
                  }}
                  className={`text-lg font-bold py-2 border-b border-neutral-100 flex items-center justify-between ${
                    isRegistration ? "text-[#5E17EB]" : "text-neutral-900"
                  }`}
                >
                  <span>{item.label}</span>
                  {isRegistration && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-purple-50 text-[#5E17EB] rounded-full border border-purple-200">
                      Trial Gratis
                    </span>
                  )}
                </a>
              );
            })}

            {/* Quick Access Portal Login */}
            <div className="pt-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Akses Portal & Akun
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login?role=member"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-50 text-[#21649D] font-bold text-xs border border-blue-200"
                >
                  <User className="w-4 h-4" />
                  <span>Portal Member</span>
                </Link>
                <Link
                  href="/login?role=admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-50 text-[#5E17EB] font-bold text-xs border border-purple-200"
                >
                  <Shield className="w-4 h-4" />
                  <span>Panel Admin</span>
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Daftar Khusus Mobile */}
          <div className="pt-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full py-4 rounded-full bg-[#5E17EB] hover:bg-[#4b11bd] text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Daftar Trial Class Sekarang</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
