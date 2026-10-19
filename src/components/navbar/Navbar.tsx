"use client";

import React, { useState } from "react";
import { VocaLogo } from "@/components/common/VocaLogo";
import { NAV_LINKS } from "@/lib/constants";
import { Menu, X, Shield } from "lucide-react";

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
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-14 py-4 md:py-5 transition-all duration-350 ${
          isDarkMode ? "nav-dark-mode" : ""
        }`}
      >
        {/* Left: Brand Logo */}
        <a
          href="#"
          id="nav-logo"
          className="transition-colors duration-300 focus:outline-none"
          aria-label="VOCA Home"
        >
          <VocaLogo
            variant="full"
            theme={isDarkMode ? "pink" : "dark"}
            size="md"
          />
        </a>

        {/* Center: Navigation Links */}
        <nav
          id="nav-pill"
          className={`hidden lg:flex items-center space-x-7 text-sm font-semibold transition-all duration-300 ${
            isDarkMode
              ? "bg-white text-neutral-800 px-7 py-2.5 rounded-full shadow-xl shadow-black/15"
              : "text-neutral-700"
          }`}
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (item.href === "#pendaftaran") {
                  e.preventDefault();
                  onOpenRegister();
                }
              }}
              className={`transition hover:text-black ${
                item.isSpecial
                  ? "text-[#5E17EB] font-bold hover:text-[#4b11bd]"
                  : ""
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Admin Portal placeholder link (Next feature preview) */}
          <button
            type="button"
            onClick={() => {
              alert(
                "Fitur Portal Admin VOCA akan segera hadir pada tahap pengembangan berikutnya."
              );
            }}
            id="nav-login"
            className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
              isDarkMode
                ? "text-white/90 hover:text-white"
                : "text-neutral-600 hover:text-black"
            }`}
            title="Portal Administrator (Next Feature)"
          >
            <Shield className="w-3.5 h-3.5 opacity-70" />
            <span>Admin</span>
          </button>

          {/* Primary CTA: Daftar Trial Class */}
          <button
            id="nav-cta"
            onClick={onOpenRegister}
            className={`text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:opacity-90 active:scale-95 ${
              isDarkMode
                ? "bg-white text-[#111111] border-[1.5px] border-[#111111]"
                : "bg-[#111111] text-white border border-transparent"
            }`}
          >
            Daftar Trial Class
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition ${
              isDarkMode
                ? "text-white bg-white/10"
                : "text-neutral-800 bg-neutral-100"
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-6 flex flex-col justify-between pb-8 lg:hidden animate-fadeIn">
          <div className="flex flex-col space-y-4">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.href === "#pendaftaran") {
                    e.preventDefault();
                    onOpenRegister();
                  }
                }}
                className={`text-lg font-bold py-2 border-b border-neutral-100 ${
                  item.isSpecial ? "text-[#5E17EB]" : "text-neutral-900"
                }`}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                alert(
                  "Fitur Portal Admin VOCA akan segera hadir pada tahap pengembangan berikutnya."
                );
              }}
              className="flex items-center gap-2 text-sm font-semibold text-neutral-500 py-2"
            >
              <Shield className="w-4 h-4" />
              <span>Portal Admin (Tahap Selanjutnya)</span>
            </button>
          </div>

          <div className="space-y-3 pt-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full py-3.5 rounded-full bg-[#5E17EB] text-white font-semibold text-sm shadow-md"
            >
              Daftar Trial Class Sekarang
            </button>
          </div>
        </div>
      )}
    </>
  );
}
