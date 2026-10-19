"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { HeroShowcase } from "@/components/hero/HeroShowcase";
import { AnalyticsSection } from "@/components/analytics/AnalyticsSection";
import { ProgramsSection } from "@/components/programs/ProgramsSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import { PathwaySection } from "@/components/pathway/PathwaySection";
import { StorySection } from "@/components/story/StorySection";
import { Footer } from "@/components/footer/Footer";
import { RegistrationModal } from "@/components/modal/RegistrationModal";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

export default function Home() {
  const [isNavDarkMode, setIsNavDarkMode] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("swimming");
  const [selectedPlanType, setSelectedPlanType] = useState<
    "free_trial" | "reguler" | "premium_private" | "consultation"
  >("free_trial");
  const [selectedCategory, setSelectedCategory] = useState("anak");

  const handleOpenRegister = (
    program: string = "swimming",
    plan: "free_trial" | "reguler" | "premium_private" | "consultation" = "free_trial",
    category: string = "anak"
  ) => {
    setSelectedProgram(program);
    setSelectedPlanType(plan);
    setSelectedCategory(category);
    setIsRegisterModalOpen(true);
  };

  const handleSelectPlan = (
    plan: "reguler" | "premium_private",
    categoryId?: string
  ) => {
    handleOpenRegister("swimming", plan, categoryId || "anak");
  };

  return (
    <main className="relative min-h-screen bg-white text-[#111111] pb-20 lg:pb-0">
      {/* 1. Adaptive Sticky Navbar */}
      <Navbar
        onOpenRegister={() => handleOpenRegister("swimming", "free_trial")}
        isDarkMode={isNavDarkMode}
      />

      {/* 2. Hero & Scrollytelling Pinned Stage */}
      <HeroShowcase
        onOpenRegister={() => handleOpenRegister("swimming", "free_trial")}
        onUpdateNavState={setIsNavDarkMode}
      />

      {/* 3. Curtain Reveal Bento Grid (Falling Pills & Dynamic Chart) */}
      <AnalyticsSection />

      {/* 4. Katalog Program Unggulan (Swimming Academy & Motoric House) */}
      <ProgramsSection onSelectProgram={(prog) => handleOpenRegister(prog, "free_trial")} />

      {/* 5. Menu List Harga & Pilihan Membership VOCA (ChatGPT Offer Style) */}
      <PricingSection onSelectPlan={handleSelectPlan} />

      {/* 6. VOCA Development Pathway (Level 1 - Level 5) */}
      <PathwaySection />

      {/* 7. Sejarah 10.10.26 & Filosofi 'Every Movement Matters' */}
      <StorySection />

      {/* 8. Footer Resmi VOCA */}
      <Footer onOpenRegister={() => handleOpenRegister("swimming", "free_trial")} />

      {/* 9. Tombol Mengambang WhatsApp Langsung ke Admin VOCA */}
      <FloatingWhatsApp />

      {/* 10. Modal Pendaftaran & Konsultasi (Neon PostgreSQL) */}
      <RegistrationModal
        key={`${selectedProgram}-${selectedPlanType}-${selectedCategory}-${isRegisterModalOpen}`}
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        defaultProgram={selectedProgram}
        defaultPlanType={selectedPlanType}
        defaultCategory={selectedCategory}
      />
    </main>
  );
}
