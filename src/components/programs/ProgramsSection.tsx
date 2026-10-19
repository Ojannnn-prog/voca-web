"use client";

import React, { useState } from "react";
import { SWIMMING_PROGRAMS, MOTORIC_PROGRAMS } from "@/lib/constants";
import { Waves, Activity, ArrowRight, CheckCircle2 } from "lucide-react";

interface ProgramsSectionProps {
  onSelectProgram: (programId: string) => void;
}

export function ProgramsSection({ onSelectProgram }: ProgramsSectionProps) {
  const [activeTab, setActiveTab] = useState<"swimming" | "motoric">("swimming");

  return (
    <section id="programs" className="relative z-20 bg-white py-24 px-6 md:px-14 border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        {/* Editorial Heading: Bersih & Lugas */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
              Program Unggulan VOCA
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-3 font-normal leading-relaxed">
              Dua pilar pembinaan fondasi gerak dan keterampilan akuatik yang dirancang
              bertahap, aman, dan adaptif untuk setiap fase usia.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="inline-flex p-1.5 bg-[#F8F9FA] rounded-2xl border border-neutral-200/80 shrink-0">
            <button
              onClick={() => setActiveTab("swimming")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "swimming"
                  ? "bg-[#21649D] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Waves className="w-4 h-4" />
              <span>Swimming Academy</span>
            </button>
            <button
              onClick={() => setActiveTab("motoric")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "motoric"
                  ? "bg-[#38AD4F] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Motoric House</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Swimming Academy */}
        {activeTab === "swimming" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {SWIMMING_PROGRAMS.map((item) => (
              <div
                key={item.id}
                className="group bg-[#F8F9FA] hover:bg-white rounded-[28px] p-7 border border-neutral-200/70 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 bg-blue-50 text-[#21649D] rounded-full border border-blue-100">
                      {item.badge}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-blue-100/60 text-[#21649D] flex items-center justify-center group-hover:scale-110 transition">
                      <Waves className="w-4 h-4" />
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 group-hover:text-[#21649D] transition tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium italic mt-0.5 mb-3">
                    {item.englishTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-neutral-200/60">
                    {item.highlights.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectProgram("swimming")}
                  className="w-full py-2.5 px-4 rounded-full bg-white group-hover:bg-[#21649D] text-neutral-800 group-hover:text-white border border-neutral-200 group-hover:border-transparent text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Daftar Program Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Motoric House */}
        {activeTab === "motoric" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {MOTORIC_PROGRAMS.map((item) => (
              <div
                key={item.id}
                className="group bg-[#F8F9FA] hover:bg-white rounded-[28px] p-7 border border-neutral-200/70 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 bg-emerald-50 text-[#38AD4F] rounded-full border border-emerald-100">
                      {item.badge}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-emerald-100/60 text-[#38AD4F] flex items-center justify-center group-hover:scale-110 transition">
                      <Activity className="w-4 h-4" />
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 group-hover:text-[#38AD4F] transition tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium italic mt-0.5 mb-3">
                    {item.englishTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectProgram("motoric")}
                  className="w-full py-2.5 px-4 rounded-full bg-white group-hover:bg-[#38AD4F] text-neutral-800 group-hover:text-white border border-neutral-200 group-hover:border-transparent text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Daftar Program Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
