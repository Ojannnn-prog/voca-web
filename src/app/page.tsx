"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { HeroShowcase } from "@/components/hero/HeroShowcase";
import { AnalyticsSection } from "@/components/analytics/AnalyticsSection";
import { ProgramsSection } from "@/components/programs/ProgramsSection";
import { PathwaySection } from "@/components/pathway/PathwaySection";
import { StorySection } from "@/components/story/StorySection";
import { Footer } from "@/components/footer/Footer";
import { RegistrationModal } from "@/components/modal/RegistrationModal";

export default function Home() {
  const [isNavDarkMode, setIsNavDarkMode] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("swimming");

  const handleOpenRegister = (program: string = "swimming") => {
    setSelectedProgram(program);
    setIsRegisterModalOpen(true);
  };

  return (
    <main className="relative min-h-screen bg-white text-[#111111]">
      {/* 1. Adaptive Sticky Navbar */}
      <Navbar
        onOpenRegister={() => handleOpenRegister("swimming")}
        isDarkMode={isNavDarkMode}
      />

      {/* 2. Hero & Scrollytelling Pinned Stage */}
      <HeroShowcase
        onOpenRegister={() => handleOpenRegister("swimming")}
        onUpdateNavState={setIsNavDarkMode}
      />

      {/* 3. Curtain Reveal Bento Grid (Falling Pills & Dynamic Chart) */}
      <AnalyticsSection />

      {/* 4. Katalog Program Unggulan (Swimming Academy & Motoric House) */}
      <ProgramsSection onSelectProgram={(prog) => handleOpenRegister(prog)} />

      {/* 5. VOCA Development Pathway (Level 1 - Level 5) */}
      <PathwaySection />

      {/* 6. Sejarah 10.10.26 & Filosofi 'Every Movement Matters' */}
      <StorySection />

      {/* 7. Footer Resmi VOCA */}
      <Footer onOpenRegister={() => handleOpenRegister("swimming")} />

      {/* 8. Modal Pendaftaran & Konsultasi (Neon PostgreSQL) */}
      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        defaultProgram={selectedProgram}
      />
    </main>
  );
}
