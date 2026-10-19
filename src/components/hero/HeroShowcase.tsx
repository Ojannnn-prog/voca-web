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
      const mm = gsap.matchMedia();

      // ================= DESKTOP EXPERIENCE (> 768px) =================
      mm.add("(min-width: 769px)", () => {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "+=1800",
            scrub: 0.5,
            pin: true,
            onUpdate: (self) => {
              const isDark = self.progress > 0.12 && self.progress < 0.94;
              onUpdateNavState(isDark);
            },
          },
        });

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
          )
          .to(
            "#illustration-canvas",
            {
              y: "-150vh",
              duration: 0.75,
              ease: "none",
            },
            0.22
          );
      });

      // ================= MOBILE EXPERIENCE (<= 768px) =================
      // Menghindari perangkap scroll 2400px & visual terpotong di layar HP
      mm.add("(max-width: 768px)", () => {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "+=650",
            scrub: 0.5,
            pin: true,
            onUpdate: (self) => {
              const isDark = self.progress > 0.18 && self.progress < 0.92;
              onUpdateNavState(isDark);
            },
          },
        });

        heroTl
          .to(
            "#hero-content",
            {
              opacity: 0,
              y: -40,
              duration: 0.2,
              ease: "power2.inOut",
            },
            0
          )
          .to(
            ["#back-card-yellow", "#back-card-pink"],
            {
              opacity: 0,
              scale: 1.01,
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
          )
          .to(
            "#illustration-canvas",
            {
              y: "-70vh",
              duration: 0.7,
              ease: "none",
            },
            0.2
          );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      id="scroll-wrapper"
      className="relative w-full h-screen overflow-hidden bg-white"
    >
      {/* HERO TEXT & CTA */}
      <div
        id="hero-content"
        className="absolute top-[80px] sm:top-[95px] md:top-[115px] left-1/2 -translate-x-1/2 text-center z-20 w-full max-w-3xl px-4 select-none pointer-events-auto"
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
            className="group inline-flex items-center gap-2 bg-[#5E17EB] hover:bg-[#4b11bd] active:bg-[#3b08a3] text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-md shadow-purple-500/25 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Daftar Trial Class</span>
          </button>
          <a
            href="#programs"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-neutral-300 transition-all hover:border-neutral-400 active:scale-95 shadow-sm"
          >
            <span>Jelajahi Program</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
          </a>
        </div>
      </div>

      {/* STACKED CARDS & ATHLETIC ILLUSTRATION CANVAS */}
      <div
        id="card-stage"
        className="absolute top-[340px] sm:top-[380px] md:top-[425px] left-1/2 -translate-x-1/2 w-[94vw] sm:w-[90vw] md:w-[88vw] max-w-[1180px] h-[68vh] sm:h-[72vh] md:h-[75vh] z-10 transition-all"
      >
        {/* Back Yellow Card */}
        <div
          id="back-card-yellow"
          className="absolute inset-0 bg-[#FFC700] rounded-[24px] sm:rounded-[32px] md:rounded-[36px] transform -rotate-[4.2deg] -translate-y-4 sm:-translate-y-6 translate-x-2 scale-[0.96] z-0 shadow-lg"
        />

        {/* Middle Pink Card */}
        <div
          id="back-card-pink"
          className="absolute inset-0 bg-[#FF4D8D] rounded-[24px] sm:rounded-[32px] md:rounded-[36px] transform -rotate-[2deg] -translate-y-2 sm:-translate-y-3 translate-x-1 scale-[0.98] z-10 shadow-lg"
        />

        {/* Main Purple Card (Expands to Fullscreen 100vw x 100vh) */}
        <div
          id="main-purple-card"
          className="relative w-full h-full bg-[#4300D2] rounded-[24px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden z-20 transform -rotate-[0.8deg] shadow-2xl"
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
