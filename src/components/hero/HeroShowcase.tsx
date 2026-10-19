"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AthleticCanvas } from "./AthleticCanvas";
import { ArrowRight, Sparkles } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroShowcaseProps {
  onOpenRegister: () => void;
  onUpdateNavState: (isDark: boolean) => void;
}

export function HeroShowcase({
  onOpenRegister,
  onUpdateNavState,
}: HeroShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-wrapper",
          start: "top top",
          end: "+=2400",
          scrub: 0.5,
          pin: true,
          onUpdate: (self) => {
            // Saat kartu utama kanvas menyentuh navbar (progress > 0.12 s/d 0.94)
            const isDark = self.progress > 0.12 && self.progress < 0.94;
            onUpdateNavState(isDark);
          },
        },
      });

      // Step A: Teks Hero memudar naik & Kartu melebar ke 100vw x 100vh tanpa celah
      heroTl
        .to(
          "#hero-content",
          {
            opacity: 0,
            y: -80,
            duration: 0.18,
            ease: "power2.inOut",
          },
          0
        )
        .to(
          ["#back-card-yellow", "#back-card-pink"],
          {
            opacity: 0,
            scale: 1.04,
            duration: 0.15,
          },
          0
        )
        .to(
          "#card-stage",
          {
            top: "0px",
            width: "100vw",
            maxWidth: "100vw",
            height: "100vh",
            duration: 0.25,
            ease: "power2.inOut",
          },
          0
        )
        .to(
          "#main-purple-card",
          {
            rotation: 0,
            borderRadius: "0px",
            duration: 0.25,
            ease: "power2.inOut",
          },
          0
        );

      // Step B: Kamera menelusuri 4 scene ilustrasi atletik dari atas ke bawah
      heroTl.to(
        "#illustration-canvas",
        {
          y: "-185vh",
          duration: 0.75,
          ease: "none",
        },
        0.22
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      id="scroll-wrapper"
      className="relative w-full h-screen overflow-hidden bg-white"
    >
      {/* HERO TEXT & CTA (Posisi Absolut Atas dengan Jarak Aman Bebas Tumpang Tindih) */}
      <div
        id="hero-content"
        className="absolute top-[85px] sm:top-[100px] md:top-[115px] left-1/2 -translate-x-1/2 text-center z-20 w-full max-w-3xl px-4 select-none pointer-events-auto"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-neutral-900 leading-[1.12] mb-3 sm:mb-4">
          Satu Komunitas, Beragam<br />
          Olahraga, Tumbuh Bersama
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-neutral-600 max-w-lg mx-auto mb-5 sm:mb-6 font-normal leading-relaxed">
          Wadah pembinaan motorik anak, akademi renang, dan kebugaran jasmani
          untuk segala usia sejak 10 Oktober 2026.
        </p>

        <div className="flex items-center justify-center space-x-3 sm:space-x-4">
          <button
            onClick={onOpenRegister}
            className="group inline-flex items-center gap-2 bg-[#5E17EB] hover:bg-[#4b11bd] active:bg-[#3b08a3] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-all shadow-md shadow-purple-500/25 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Daftar Trial Class</span>
          </button>
          <a
            href="#programs"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold px-5 sm:px-6 py-3 rounded-full border border-neutral-300 transition-all hover:border-neutral-400 active:scale-95 shadow-sm"
          >
            <span>Jelajahi Program</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
          </a>
        </div>
      </div>

      {/* STACKED CARDS & ATHLETIC ILLUSTRATION CANVAS */}
      {/* Posisi awal top responsif: top-[400px] di mobile / top-[430px] di desktop agar tidak pernah menimpa tombol CTA */}
      <div
        id="card-stage"
        className="absolute top-[385px] sm:top-[400px] md:top-[425px] left-1/2 -translate-x-1/2 w-[90vw] md:w-[88vw] max-w-[1180px] h-[75vh] z-10"
      >
        {/* Back Yellow Card */}
        <div
          id="back-card-yellow"
          className="absolute inset-0 bg-[#FFC700] rounded-[32px] sm:rounded-[36px] transform -rotate-[4.2deg] -translate-y-5 sm:-translate-y-6 translate-x-2 scale-[0.96] z-0 shadow-lg"
        />

        {/* Middle Pink Card */}
        <div
          id="back-card-pink"
          className="absolute inset-0 bg-[#FF4D8D] rounded-[32px] sm:rounded-[36px] transform -rotate-[2deg] -translate-y-2.5 sm:-translate-y-3 translate-x-1 scale-[0.98] z-10 shadow-lg"
        />

        {/* Main Purple Card (Expands to Fullscreen 100vw x 100vh) */}
        <div
          id="main-purple-card"
          className="relative w-full h-full bg-[#4300D2] rounded-[32px] sm:rounded-[36px] overflow-hidden z-20 transform -rotate-[0.8deg] shadow-2xl"
        >
          {/* Grainy Noise Texture Overlay (opacity: 0.14) */}
          <div className="absolute inset-0 noise-bg pointer-events-none z-30" />

          {/* 300vh Athletic Canvas Artwork */}
          <AthleticCanvas />
        </div>
      </div>
    </div>
  );
}
