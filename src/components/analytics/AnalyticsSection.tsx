"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HASHTAG_PILLS, DEMOGRAPHICS_DATA } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AnalyticsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeLevel, setActiveLevel] = useState("Level 2");
  const [manualView, setManualView] = useState<"hashtags" | "demographics">("hashtags");

  // State angka metrik
  const [metrics, setMetrics] = useState({
    eng: 26,
    fol: 50,
    tip1: 28,
    tip2: 43,
  });

  useGSAP(
    () => {
      let analyticsPlayed = false;

      ScrollTrigger.create({
        trigger: "#analytics-section",
        start: "top 68%",
        onEnter: () => {
          if (!analyticsPlayed) {
            analyticsPlayed = true;
            runAnalyticsSequence();
          }
        },
      });

      function runAnalyticsSequence() {
        // 1. Kapsul Hashtag jatuh dengan efek Bounce Out
        const pills = document.querySelectorAll(".hashtag-pill");
        pills.forEach((pill, i) => {
          const targetX = pill.getAttribute("data-x") || "0%";
          const targetY = pill.getAttribute("data-y") || "0px";
          const targetRot = Number(pill.getAttribute("data-rot") || 0);

          gsap.set(pill, {
            left: targetX,
            top: -80,
            rotation: gsap.utils.random(-45, 45),
            opacity: 1,
          });

          gsap.to(pill, {
            top: targetY,
            rotation: targetRot,
            duration: 0.85,
            delay: i * 0.055,
            ease: "bounce.out",
          });
        });

        // 2. Animasi Angka Metrik & Tooltip
        const metricsObj = { eng: 26, fol: 50, tip1: 28, tip2: 43 };
        gsap.to(metricsObj, {
          eng: 48,
          fol: 59,
          tip1: 38,
          tip2: 54,
          duration: 3.6,
          ease: "power1.inOut",
          onUpdate: () => {
            setMetrics({
              eng: Math.round(metricsObj.eng),
              fol: Math.round(metricsObj.fol),
              tip1: Math.round(metricsObj.tip1),
              tip2: Math.round(metricsObj.tip2),
            });
          },
        });

        // 3. SVG Line Chart Path Morphing
        gsap.to("#pink-line", {
          attr: { d: "M 10 135 L 85 92 L 195 142 L 255 102 L 380 28" },
          duration: 3.6,
          ease: "power1.inOut",
        });
        gsap.to("#yellow-line", {
          attr: { d: "M 10 145 L 85 110 L 185 78 L 285 130 L 380 120" },
          duration: 3.6,
          ease: "power1.inOut",
        });

        // 4. Transisi Otomatis View A -> View B Demografi Audiens setelah 2200ms
        setTimeout(() => {
          const hashtagCard = document.getElementById("left-card-hashtags");
          const demoCard = document.getElementById("left-card-demographics");
          const bars = document.querySelectorAll(".demo-bar") as NodeListOf<HTMLElement>;

          if (hashtagCard && demoCard) {
            hashtagCard.style.opacity = "0";
            demoCard.style.opacity = "1";
            demoCard.style.pointerEvents = "auto";

            setTimeout(() => {
              bars.forEach((bar, idx) => {
                setTimeout(() => {
                  const targetWidth = bar.getAttribute("data-width");
                  if (targetWidth) {
                    bar.style.width = targetWidth;
                  }
                }, idx * 80);
              });
            }, 150);
          }
        }, 2200);
      }
    },
    { scope: sectionRef }
  );

  // Handler saat pengguna mengklik filter level pembinaan
  const handleLevelChange = (lvl: string, engVal: number, folVal: number, tip1Val: number, tip2Val: number) => {
    setActiveLevel(lvl);
    gsap.to(metrics, {
      eng: engVal,
      fol: folVal,
      tip1: tip1Val,
      tip2: tip2Val,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        setMetrics({
          eng: Math.round(metrics.eng),
          fol: Math.round(metrics.fol),
          tip1: Math.round(metrics.tip1),
          tip2: Math.round(metrics.tip2),
        });
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      id="analytics-section"
      className="relative z-30 bg-white rounded-t-[48px] -mt-14 pt-24 pb-32 px-6 md:px-14 shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.28)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Heading: Bersih, Alami, Tanpa AI-slop Badge */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-medium text-neutral-900 tracking-tight leading-[1.15]">
            Pemantauan Perkembangan<br />
            dan Evaluasi Kemampuan
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-4 font-normal">
            Sistem evaluasi berkala untuk memastikan setiap tahapan gerak dan teknik renang
            peserta terpantau secara terukur dan transparan.
          </p>
        </div>

        {/* Bento Grid 12 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= KARTU KIRI (5 Kolom): Auto-Switching ================= */}
          <div className="lg:col-span-5 bg-[#F8F9FA] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[440px] border border-neutral-100 shadow-sm">
            {/* VIEW A: Hashtag Kategori Olahraga (Jatuh dengan fisika) */}
            <div
              id="left-card-hashtags"
              className={`w-full h-full flex flex-col justify-between transition-opacity duration-500 ${
                manualView === "demographics" ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium text-neutral-900">
                    Fokus Cabang Olahraga
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Spektrum aktivitas gerak yang dibina di VOCA
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setManualView("demographics");
                    setTimeout(() => {
                      const bars = document.querySelectorAll(".demo-bar") as NodeListOf<HTMLElement>;
                      bars.forEach((bar) => {
                        const targetWidth = bar.getAttribute("data-width");
                        if (targetWidth) bar.style.width = targetWidth;
                      });
                    }, 50);
                  }}
                  className="text-[11px] font-bold text-[#5E17EB] hover:underline px-2.5 py-1 bg-purple-50 rounded-full border border-purple-200"
                >
                  Lihat Demografi →
                </button>
              </div>

              <div
                id="hashtag-stage"
                className="relative w-full h-[300px] mt-4 overflow-hidden"
              >
                {HASHTAG_PILLS.map((pill, idx) => (
                  <div
                    key={idx}
                    className="hashtag-pill"
                    data-x={pill.x}
                    data-y={pill.y}
                    data-rot={pill.rot}
                  >
                    {pill.label}
                  </div>
                ))}
              </div>
            </div>

            {/* VIEW B: Demografi & Fokus Usia Peserta */}
            <div
              id="left-card-demographics"
              className={`absolute inset-6 sm:inset-8 flex flex-col justify-between transition-opacity duration-500 ${
                manualView === "demographics" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium text-neutral-900">
                    Demografi Peserta VOCA
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Distribusi kelompok usia yang mengikuti pembinaan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setManualView("hashtags")}
                  className="text-[11px] font-bold text-[#21649D] hover:underline px-2.5 py-1 bg-blue-50 rounded-full border border-blue-200"
                >
                  ← Lihat Cabang
                </button>
              </div>

              <div className="space-y-3.5 my-auto py-3">
                {DEMOGRAPHICS_DATA.map((demo, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div
                      className="demo-bar h-8 sm:h-9 bg-[#FF66A3] rounded-lg flex items-center justify-end px-3 text-white text-xs font-semibold shrink-0"
                      data-width={demo.percentage}
                    >
                      {demo.percentage}
                    </div>
                    <span className="text-xs font-medium text-neutral-700 truncate">
                      {demo.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 4-Color Progress Indicators */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-neutral-200/60 z-10">
              <div className="h-1.5 rounded-full bg-[#FFC700]" />
              <div className="h-1.5 rounded-full bg-[#FF4D8D]" />
              <div className="h-1.5 rounded-full bg-[#5E17EB]" />
              <div className="h-1.5 rounded-full bg-[#A5B4FC]" />
            </div>
          </div>

          {/* ================= KARTU KANAN (7 Kolom): Optimizing Performance ================= */}
          <div className="lg:col-span-7 bg-[#F8F9FA] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[440px] border border-neutral-100 shadow-sm">
            <div>
              <h3 className="text-2xl font-medium text-neutral-900 mb-1">
                Optimasi Performa Gerak
              </h3>
              <p className="text-xs text-neutral-500 mb-6">
                Evaluasi peningkatan kemampuan akuatik & koordinasi motorik
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
              {/* Sub-kolom Kiri: 2 Kotak Metrik Warna */}
              <div className="md:col-span-4 space-y-4">
                <div className="bg-[#FFCC00] rounded-2xl p-5 text-neutral-900 shadow-sm">
                  <p className="text-xs font-medium opacity-80 mb-2">
                    Water Confidence
                  </p>
                  <div id="metric-engagement" className="text-4xl font-semibold tracking-tight">
                    +{metrics.eng}%
                  </div>
                </div>

                <div className="bg-[#FF5C97] rounded-2xl p-5 text-white shadow-sm">
                  <p className="text-xs font-medium opacity-90 mb-2">
                    Motoric Agility
                  </p>
                  <div id="metric-followers" className="text-4xl font-semibold tracking-tight">
                    +{metrics.fol}%
                  </div>
                </div>
              </div>

              {/* Sub-kolom Kanan: Filter Waktu & Dynamic Line Chart */}
              <div className="md:col-span-8 flex flex-col justify-between h-full space-y-5">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                  {[
                    { label: "Level 1", eng: 32, fol: 35, t1: 30, t2: 36 },
                    { label: "Level 2", eng: 48, fol: 59, t1: 38, t2: 54 },
                    { label: "Level 3", eng: 62, fol: 72, t1: 52, t2: 68 },
                    { label: "Level 4", eng: 78, fol: 84, t1: 65, t2: 81 },
                    { label: "Level 5", eng: 92, fol: 95, t1: 85, t2: 94 },
                  ].map((lvl) => (
                    <button
                      key={lvl.label}
                      type="button"
                      onClick={() =>
                        handleLevelChange(lvl.label, lvl.eng, lvl.fol, lvl.t1, lvl.t2)
                      }
                      className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                        activeLevel === lvl.label
                          ? "bg-[#111111] text-white font-medium shadow-sm"
                          : "border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                {/* Dynamic SVG Chart */}
                <div className="relative w-full h-[210px] pt-4">
                  <svg viewBox="0 0 400 170" className="w-full h-full overflow-visible">
                    <line
                      x1="0"
                      y1="145"
                      x2="390"
                      y2="145"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                    />
                    <line
                      id="chart-vline-1"
                      x1="85"
                      y1="78"
                      x2="85"
                      y2="145"
                      stroke="#111111"
                      strokeWidth="1"
                    />
                    <line
                      id="chart-vline-2"
                      x1="255"
                      y1="92"
                      x2="255"
                      y2="145"
                      stroke="#111111"
                      strokeWidth="1"
                    />

                    {/* Yellow and Pink Dynamic Curves */}
                    <path
                      id="yellow-line"
                      d="M 10 145 L 85 95 L 185 118 L 285 98 L 380 140"
                      fill="none"
                      stroke="#FFCC00"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      id="pink-line"
                      d="M 10 128 L 85 78 L 195 142 L 255 92 L 380 15"
                      fill="none"
                      stroke="#FF4D8D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Dot 1 & Tooltip 1 */}
                    <circle id="dot-1" cx="85" cy="78" r="4" fill="#111111" />
                    <g id="tooltip-1" transform="translate(32, 62)">
                      <rect x="0" y="0" width="44" height="22" rx="11" fill="#111111" />
                      <text
                        id="tooltip-text-1"
                        x="22"
                        y="15"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        +{metrics.tip1}%
                      </text>
                    </g>

                    {/* Dot 2 & Tooltip 2 */}
                    <circle id="dot-2" cx="255" cy="92" r="4" fill="#111111" />
                    <g id="tooltip-2" transform="translate(202, 76)">
                      <rect x="0" y="0" width="44" height="22" rx="11" fill="#111111" />
                      <text
                        id="tooltip-text-2"
                        x="22"
                        y="15"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        +{metrics.tip2}%
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
