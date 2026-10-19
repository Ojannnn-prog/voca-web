import React from "react";
import { VocaLogo } from "@/components/common/VocaLogo";
import { SITE_CONFIG, NAV_LINKS, SWIMMING_PROGRAMS, MOTORIC_PROGRAMS } from "@/lib/constants";
import { MapPin, Phone, Mail, Instagram, Shield } from "lucide-react";

interface FooterProps {
  onOpenRegister: () => void;
}

export function Footer({ onOpenRegister }: FooterProps) {
  return (
    <footer id="contact" className="relative z-20 bg-[#111111] text-white pt-20 pb-12 px-6 md:px-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-neutral-800">
          {/* Kolom 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <VocaLogo variant="full" theme="light" size="md" />
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed font-normal">
              {SITE_CONFIG.taglineId}. Komunitas dan klub olahraga multisport yang
              berkomitmen mendampingi perkembangan motorik dan kebugaran sepanjang hayat.
            </p>
            <div className="pt-2 text-xs text-neutral-400 space-y-1">
              <p>
                <strong className="text-white">Didirikan:</strong> {SITE_CONFIG.establishedDate} ({SITE_CONFIG.establishedCode})
              </p>
              <p>
                <strong className="text-white">Filosofi:</strong> {SITE_CONFIG.sloganMovement}
              </p>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              {NAV_LINKS.map((nav) => (
                <li key={nav.href}>
                  <a
                    href={nav.href}
                    onClick={(e) => {
                      if (nav.href === "#pendaftaran") {
                        e.preventDefault();
                        onOpenRegister();
                      }
                    }}
                    className="hover:text-white transition"
                  >
                    {nav.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Program Utama */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Program Utama
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#programs" className="hover:text-white transition">
                  Swimming Academy
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-white transition">
                  Motoric House
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-white transition">
                  Persiapan TNI / POLRI
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-white transition">
                  Aktivitas Adaptif
                </a>
              </li>
              <li>
                <a href="#pathway" className="hover:text-white transition">
                  Development Pathway
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Hubungi Kami */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Informasi & Konsultasi
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                <span>+62 812-3456-7890 (WhatsApp Admin)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                <span>info@voca-athletics.com</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-300 shrink-0 mt-0.5" />
                <span>Pusat Pembinaan & Mitra Fasilitas Olahraga VOCA</span>
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenRegister}
                className="w-full py-2.5 px-4 rounded-full bg-[#5E17EB] hover:bg-[#4b11bd] text-white text-xs font-semibold transition shadow-md"
              >
                Daftar Trial Class Gratis
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & admin portal placeholder */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} VOCA (Vortex Community of Athletics). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                alert("Fitur Portal Admin VOCA akan segera hadir pada tahap pengembangan berikutnya.");
              }}
              className="hover:text-neutral-300 transition flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Portal Admin</span>
            </button>
            <span>•</span>
            <a href="#" className="hover:text-neutral-300 transition">
              Kebijakan Privasi
            </a>
            <span>•</span>
            <a href="#" className="hover:text-neutral-300 transition">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
