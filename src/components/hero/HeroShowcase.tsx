"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AthleticCanvas } from "./AthleticCanvas";

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
            // Saat kartu utama ungu/kanvas menutupi navbar (progress > 0.12 s/d 0.94)
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
            y: -90,
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
      {/* HERO TEXT & CTA (Posisi Absolut Atas) */}
      <div
        id="hero-content"
        className="absolute top-[125px] sm:top-[135px] left-1/2 -translate-x-1/2 text-center z-20 w-full max-w-3xl px-4"
      >
        <h1 className="text-4xl sm:text-5xl md:text-[3.65rem] font-medium tracking-tight text-neutral-900 leading-[1.12] mb-6">
          Satu Komunitas, Beragam<br />
          Olahraga, Tumbuh Bersama
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
          Wadah pembinaan motorik anak, akademi renang, dan persiapan kebugaran jasmani
          inklusif untuk segala usia sejak 10 Oktober 2026.
        </p>

        <div className="flex items-center justify-center space-x-3 sm:space-x-4">
          <button
            onClick={onOpenRegister}
            className="bg-[#5E17EB] hover:bg-[#4b11bd] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full transition shadow-md hover:shadow-lg active:scale-95"
          >
            Daftar Trial Class
          </button>
          <a
            href="#programs"
            className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full border border-neutral-300 transition hover:border-neutral-400"
          >
            Jelajahi Program
          </a>
        </div>
      </div>

      {/* STACKED CARDS & ATHLETIC ILLUSTRATION CANVAS */}
      <div
        id="card-stage"
        className="absolute top-[410px] left-1/2 -translate-x-1/2 w-[88vw] max-w-[1180px] h-[75vh] z-10"
      >
        {/* Back Yellow Card */}
        <div
          id="back-card-yellow"
          className="absolute inset-0 bg-[#FFC700] rounded-[36px] transform -rotate-[4.2deg] -translate-y-6 translate-x-2 scale-[0.96] z-0 shadow-lg"
        />

        {/* Middle Pink Card */}
        <div
          id="back-card-pink"
          className="absolute inset-0 bg-[#FF4D8D] rounded-[36px] transform -rotate-[2deg] -translate-y-3 translate-x-1 scale-[0.98] z-10 shadow-lg"
        />

        {/* Main Purple Card (Expands to Fullscreen 100vw x 100vh) */}
        <div
          id="main-purple-card"
          className="relative w-full h-full bg-[#4300D2] rounded-[36px] overflow-hidden z-20 transform -rotate-[0.8deg] shadow-2xl"
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
