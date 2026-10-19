import React from "react";
import { CORE_VALUES } from "@/lib/constants";
import { Calendar, Award, HeartHandshake, Sparkles } from "lucide-react";

export function StorySection() {
  return (
    <section id="about" className="relative z-20 bg-white py-24 px-6 md:px-14 border-t border-neutral-100">
      <div className="max-w-5xl mx-auto space-y-20">
        {/* Cerita Sejarah VOCA 10.10.26 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#5E17EB] tracking-wider uppercase">
              <Calendar className="w-4 h-4" />
              <span>Didirikan 10 Oktober 2026 (10.10.26)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
              Setiap Gerakan Memiliki Makna
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium italic">
              &ldquo;Every Great Journey Begins with a Single Movement.&rdquo;
            </p>
          </div>

          <div className="lg:col-span-7 bg-[#F8F9FA] rounded-[32px] p-8 sm:p-10 border border-neutral-200/80 shadow-sm space-y-4">
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
              VOCA (Vortex Community of Athletics) lahir dari keyakinan bahwa olahraga
              bukan sekadar aktivitas fisik atau mengejar piala kemenangan, melainkan proses
              pembelajaran sepanjang hayat yang membentuk karakter, kedisiplinan, dan rasa percaya diri.
            </p>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
              Bagi VOCA, keberhasilan terlihat ketika seorang balita mulai berani mengeksplorasi
              keseimbangannya, seorang anak mengatasi rasa takut terhadap air, seorang remaja
              meningkatkan teknik renang, dan seorang dewasa konsisten menjaga kebugarannya.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-800">
              <span className="px-3.5 py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm">
                Multisport Community
              </span>
              <span className="px-3.5 py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm">
                Long-Term Athlete Development
              </span>
              <span className="px-3.5 py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm">
                Inclusive & Adaptive
              </span>
            </div>
          </div>
        </div>

        {/* 6 Core Values Grid (V-O-C-A-G-E) */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
              Nilai Utama VOCA
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-normal">
              Enam pilar yang menjiwai setiap sesi latihan dan interaksi dalam komunitas kami.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CORE_VALUES.map((val) => (
              <div
                key={val.letter}
                className="bg-[#F8F9FA] hover:bg-white rounded-2xl p-5 border border-neutral-200/80 hover:border-purple-200 transition-all text-center flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-3xl font-black font-fredoka text-[#5E17EB] mb-1">
                    {val.letter}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">{val.word}</h4>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Banner VOCA Sports Festival (10.10) */}
        <div id="festival" className="relative rounded-[32px] bg-gradient-to-r from-[#21649D] via-[#1F0066] to-[#0F1D2B] text-white p-8 sm:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Agenda Tahunan 10 Oktober</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold tracking-tight">
              VOCA Sports Festival
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
              Perayaan tahunan perkembangan gerak, kebersamaan keluarga, dan apresiasi
              atas pencapaian seluruh peserta. Bergerak bersama, merayakan setiap langkah kemajuan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
