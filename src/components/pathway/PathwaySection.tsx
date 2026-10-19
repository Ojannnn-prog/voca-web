import React from "react";
import { DEVELOPMENT_PATHWAYS } from "@/lib/constants";

export function PathwaySection() {
  return (
    <section id="pathway" className="relative z-20 bg-[#F8F9FA] py-24 px-6 md:px-14 border-t border-neutral-200/60">
      <div className="max-w-6xl mx-auto">
        {/* Editorial Heading: Bersih & Berkelas */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
            Jalur Pembinaan Peserta
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-3 font-normal leading-relaxed">
            <em>From First Movement to Future Achievement</em> — Perjalanan terstruktur
            dari pengenalan gerak dasar hingga pencapaian potensi terbaik.
          </p>
        </div>

        {/* 5-Step Pathway Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {DEVELOPMENT_PATHWAYS.map((path, idx) => (
            <div
              key={path.level}
              className="bg-white rounded-[24px] p-6 border border-neutral-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: path.color }}
                  >
                    {path.level}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    Tahap 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-1">
                  {path.name}
                </h3>
                <p
                  className="text-xs font-semibold mb-3"
                  style={{ color: path.color }}
                >
                  {path.focus}
                </p>

                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  {path.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: path.color }}
                />
                <span className="text-[11px] font-medium text-neutral-500">
                  Evaluasi Kompetensi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
