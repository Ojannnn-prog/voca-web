"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  Calendar,
  Clock,
  Target,
  MessageCircle,
  ShieldCheck,
  Award,
  ArrowRight,
} from "lucide-react";
import { VocaLogo } from "@/components/common/VocaLogo";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProgram?: string;
  defaultPlanType?: "free_trial" | "reguler" | "premium_private" | "consultation";
  defaultCategory?: string;
}

export function RegistrationModal({
  isOpen,
  onClose,
  defaultProgram = "swimming",
  defaultPlanType = "free_trial",
  defaultCategory = "kids",
}: RegistrationModalProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "free_trial" | "reguler" | "premium_private" | "consultation"
  >(defaultPlanType);

  // Common Fields
  const [fullName, setFullName] = useState("");
  const [parentName, setParentName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [participantAge, setParticipantAge] = useState("");
  const [programCategory, setProgramCategory] = useState(defaultProgram);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Flow 1: Free Trial Specific
  const [trialSchedule, setTrialSchedule] = useState("Sabtu Pagi (08.00 - 09.30)");
  const [swimmingExperience, setSwimmingExperience] = useState("Belum bisa mengapung / Takut air");

  // Flow 2: Reguler Member Specific
  const [regulerAgeGroup, setRegulerAgeGroup] = useState(
    defaultCategory === "toddler"
      ? "balita"
      : defaultCategory === "junior"
      ? "remaja"
      : "anak"
  );
  const [regulerSchedule, setRegulerSchedule] = useState("Sesi Sore (Senin & Kamis 16.00)");

  // Flow 3: Premium Private Specific (Start from 400k)
  const [privateSessions, setPrivateSessions] = useState<number>(4); // default 4 sesi = 800k
  const [customSessions, setCustomSessions] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>(["Sabtu", "Minggu"]);
  const [preferredHours, setPreferredHours] = useState("Pagi (08.00 - 10.00)");
  const [privateGoal, setPrivateGoal] = useState("Belajar dari nol & keselamatan di air");

  // Flow 4: Consultation Specific (Free WhatsApp)
  const [consultationTopic, setConsultationTopic] = useState("Rekomendasi program untuk anak usia dini");

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Price calculations for Reguler
  const regulerPricingMap: Record<string, { label: string; price: number; formatted: string }> = {
    balita: { label: "Balita (1 - 4 Tahun)", price: 449000, formatted: "Rp 449.000 / bln" },
    anak: { label: "Anak-anak (5 - 12 Tahun)", price: 347000, formatted: "Rp 347.000 / bln" },
    remaja: { label: "Remaja (13 - 17 Tahun)", price: 399000, formatted: "Rp 399.000 / bln" },
    dewasa: { label: "Dewasa (18+ Tahun)", price: 425000, formatted: "Rp 425.000 / bln" },
    casis_tni_polri: { label: "Calon TNI / POLRI", price: 475000, formatted: "Rp 475.000 / bln" },
  };

  // Price calculation for Private (Start from 400k)
  const calculatePrivateTotal = () => {
    const sessions = customSessions ? parseInt(customSessions, 10) || 2 : privateSessions;
    if (sessions === 2) return 400000;
    if (sessions === 4) return 800000;
    if (sessions === 6) return 1200000;
    if (sessions === 8) return 1500000; // Paket hemat diskon 100k
    return sessions * 200000; // Kustom: @200k/sesi
  };

  const toggleDaySelection = (day: string) => {
    if (preferredDays.includes(day)) {
      if (preferredDays.length > 1) {
        setPreferredDays(preferredDays.filter((d) => d !== day));
      }
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };

  // Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Build tailored notes string based on active flow
      let compiledNotes = "";
      let finalFee = 0;

      if (activeTab === "free_trial") {
        compiledNotes = `[FREE TRIAL CLASS (GRATIS)] Orang Tua: ${parentName || "-"} | Jadwal Trial: ${trialSchedule} | Kemampuan Awal: ${swimmingExperience}${
          additionalNotes ? ` | Catatan: ${additionalNotes}` : ""
        }`;
        finalFee = 0;
      } else if (activeTab === "reguler") {
        const regInfo = regulerPricingMap[regulerAgeGroup] || regulerPricingMap.anak;
        compiledNotes = `[REGULER MEMBER] Orang Tua: ${parentName || "-"} | Kategori: ${regInfo.label} (${regInfo.formatted}) | Jadwal Reguler: ${regulerSchedule}${
          additionalNotes ? ` | Catatan: ${additionalNotes}` : ""
        }`;
        finalFee = regInfo.price;
      } else if (activeTab === "premium_private") {
        const total = calculatePrivateTotal();
        const sessionCount = customSessions ? customSessions : privateSessions;
        compiledNotes = `[PREMIUM PRIVATE 1-ON-1] Paket: ${sessionCount} Sesi (Estimasi Rp ${total.toLocaleString(
          "id-ID"
        )}) | Hari Pilihan: ${preferredDays.join(", ")} | Jam: ${preferredHours} | Target: ${privateGoal}${
          additionalNotes ? ` | Catatan: ${additionalNotes}` : ""
        }`;
        finalFee = total;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          participantAge: participantAge ? parseInt(participantAge, 10) : null,
          programCategory,
          planType: activeTab,
          ageCategory:
            activeTab === "reguler"
              ? regulerAgeGroup
              : participantAge && parseInt(participantAge, 10) <= 4
              ? "toddler"
              : participantAge && parseInt(participantAge, 10) <= 12
              ? "kids"
              : participantAge && parseInt(participantAge, 10) <= 17
              ? "junior"
              : "adult",
          notes: compiledNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses pendaftaran.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kendala saat mengirim data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsAppConsultation = () => {
    const adminPhone = process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || "6287887964978";
    const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
    const msg = `Halo Admin & Head Coach VOCA, saya ingin berkonsultasi gratis seputar program olahraga:
- Nama: ${fullName || "Calon Peserta"}
- Usia: ${participantAge ? participantAge + " Tahun" : "Belum ditentukan"}
- Topik Konsultasi: ${consultationTopic}
Mohon arahannya untuk rekomendasi kelas & jadwal yang sesuai. Terima kasih!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-neutral-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <VocaLogo variant="full" size="sm" />
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-neutral-50/70 border-b border-neutral-100 shrink-0">
          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-200/60 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("free_trial")}
              className={`py-2 px-1 rounded-lg transition text-center ${
                activeTab === "free_trial"
                  ? "bg-white text-[#5E17EB] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Free Trial
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reguler")}
              className={`py-2 px-1 rounded-lg transition text-center ${
                activeTab === "reguler"
                  ? "bg-white text-[#5E17EB] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Reguler
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("premium_private")}
              className={`py-2 px-1 rounded-lg transition text-center ${
                activeTab === "premium_private"
                  ? "bg-white text-[#5E17EB] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              ✦ Privat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("consultation")}
              className={`py-2 px-1 rounded-lg transition text-center ${
                activeTab === "consultation"
                  ? "bg-white text-[#25D366] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Konsultasi
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Pendaftaran Berhasil Dikirim!
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
                Terima kasih <strong>{fullName}</strong>. Data registrasi <strong>{activeTab.toUpperCase()}</strong> Anda telah tersimpan di sistem VOCA. Tim pelatih kami akan segera menghubungi nomor WhatsApp Anda.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition"
                >
                  Selesai
                </button>
                <a
                  href={`https://wa.me/${
                    process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || "6287887964978"
                  }?text=Halo%20Admin%20VOCA,%20saya%20sudah%20mengirim%20pendaftaran%20${encodeURIComponent(
                    activeTab
                  )}%20atas%20nama%20${encodeURIComponent(fullName)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-[#25D366] text-white text-xs sm:text-sm font-semibold hover:bg-[#20bd5a] transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konfirmasi via WhatsApp</span>
                </a>
              </div>
            </div>
          ) : activeTab === "consultation" ? (
            /* ================= FLOW 4: KONSULTASI PROGRAM (GRATIS VIA WHATSAPP) ================= */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#25D366] text-white text-[10px] font-bold tracking-wide uppercase">
                    100% Gratis • Bebas Biaya
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Konsultasi Program & Minat Latihan
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Tidak dipungut biaya apa pun. Tim Head Coach & konsultan VOCA siap berdiskusi langsung mengenai kesiapan motorik, pemilihan kelompok umur, jadwal kolam, hingga penanganan anak yang takut air.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nama Anda / Orang Tua
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Ayah Fikri"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Usia Anak / Calon Peserta (Tahun)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={participantAge}
                    onChange={(e) => setParticipantAge(e.target.value)}
                    placeholder="Contoh: 6"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Hal yang Ingin Dikonsultasikan
                  </label>
                  <select
                    value={consultationTopic}
                    onChange={(e) => setConsultationTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
                  >
                    <option value="Rekomendasi kelas renang untuk usia dini">Rekomendasi kelas renang untuk usia dini</option>
                    <option value="Anak masih takut air / trauma">Anak masih takut air / butuh adaptasi khusus</option>
                    <option value="Program stimulasi motorik & sensorik anak">Program stimulasi motorik & sensorik anak</option>
                    <option value="Persiapan tes fisik TNI, POLRI & Kedinasan">Persiapan tes fisik TNI, POLRI & Kedinasan</option>
                    <option value="Program Privat 1-on-1 khusus">Program Privat 1-on-1 khusus</option>
                    <option value="Pertanyaan lain seputar jadwal & biaya">Pertanyaan lain seputar jadwal & biaya</option>
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppConsultation}
                  className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat Konsultasi Gratis di WhatsApp</span>
                </button>
                <p className="text-[11px] text-center text-neutral-400 mt-2">
                  Langsung terhubung dengan WhatsApp resmi Admin & Tim Pelatih VOCA.
                </p>
              </div>
            </div>
          ) : (
            /* ================= FLOW 1, 2, 3: SUBMITTABLE FORMS ================= */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form Title & Context Badge */}
              <div className="border-b border-neutral-100 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E17EB]">
                    {activeTab === "free_trial" && "Trial Class • Rp 0 Gratis"}
                    {activeTab === "reguler" && "Kelas Reguler Kelompok Kecil"}
                    {activeTab === "premium_private" && "Eksklusif 1 Atlet 1 Pelatih"}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5E17EB] border border-purple-200">
                    {activeTab === "free_trial" && "1x Sesi Percobaan"}
                    {activeTab === "reguler" && "Iuran Bulanan Terjangkau"}
                    {activeTab === "premium_private" && "Start From Rp 400.000"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {activeTab === "free_trial" && "Booking Free Trial Class (Gratis)"}
                  {activeTab === "reguler" && "Pendaftaran Member Reguler"}
                  {activeTab === "premium_private" && "Pemesanan Sesi Privat Premium"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {activeTab === "free_trial" &&
                    "Rasakan metode kepelatihan profesional VOCA sebelum bergabung resmi."}
                  {activeTab === "reguler" &&
                    "Latihan terstruktur dalam kelompok kecil (rasio maks 1:3-4 murid per pelatih)."}
                  {activeTab === "premium_private" &&
                    "Jadwal dan jam bebas disesuaikan dengan kebutuhan & target latihan spesifik."}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* SECTION: IDENTITAS PESERTA */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nama Calon Peserta / Atlet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Muhammad Rayhan"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Contoh: Bapak Hendra"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Usia Peserta (Tahun)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="70"
                      value={participantAge}
                      onChange={(e) => setParticipantAge(e.target.value)}
                      placeholder="Contoh: 7"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    />
                  </div>
                </div>
              </div>

              {/* ================= KHUSUS FLOW 1: FREE TRIAL ================= */}
              {activeTab === "free_trial" && (
                <div className="space-y-3 p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Pilihan Cabang Olahraga Trial <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={programCategory}
                      onChange={(e) => setProgramCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    >
                      <option value="swimming">VOCA Swimming Academy (Akademi Renang)</option>
                      <option value="motoric">VOCA Motoric House (Stimulasi Gerak & Fisik)</option>
                      <option value="tni_polri">Calon Kedinasan / TNI & POLRI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Preferensi Jadwal Free Trial
                    </label>
                    <select
                      value={trialSchedule}
                      onChange={(e) => setTrialSchedule(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    >
                      <option value="Sabtu Pagi (08.00 - 09.30)">Sabtu Pagi (08.00 - 09.30)</option>
                      <option value="Sabtu Sore (16.00 - 17.30)">Sabtu Sore (16.00 - 17.30)</option>
                      <option value="Minggu Pagi (08.00 - 09.30)">Minggu Pagi (08.00 - 09.30)</option>
                      <option value="Minggu Sore (16.00 - 17.30)">Minggu Sore (16.00 - 17.30)</option>
                      <option value="Hari Kerja (Selasa / Kamis 16.00)">Hari Kerja (Selasa / Kamis 16.00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Kondisi / Kemampuan Awal Anak
                    </label>
                    <select
                      value={swimmingExperience}
                      onChange={(e) => setSwimmingExperience(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    >
                      <option value="Belum bisa mengapung / Takut air">Belum bisa mengapung / Takut air</option>
                      <option value="Sudah berani di air tapi belum bisa teknik">Sudah berani di air tapi belum bisa teknik</option>
                      <option value="Sudah bisa mengapung & meluncur">Sudah bisa mengapung & meluncur</option>
                      <option value="Pernah les renang sebelumnya">Pernah les renang sebelumnya</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ================= KHUSUS FLOW 2: REGULER MEMBER ================= */}
              {activeTab === "reguler" && (
                <div className="space-y-3 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Kategori Kelompok Usia & Biaya Iuran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={regulerAgeGroup}
                      onChange={(e) => setRegulerAgeGroup(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    >
                      <option value="balita">Balita (1 - 4 Tahun) • Rp 449.000 / bln</option>
                      <option value="anak">Anak-anak (5 - 12 Tahun) • Rp 347.000 / bln</option>
                      <option value="remaja">Remaja (13 - 17 Tahun) • Rp 399.000 / bln</option>
                      <option value="dewasa">Dewasa (18+ Tahun) • Rp 425.000 / bln</option>
                      <option value="casis_tni_polri">Calon Siswa TNI / POLRI • Rp 475.000 / bln</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Pilihan Kelompok Jadwal Latihan
                    </label>
                    <select
                      value={regulerSchedule}
                      onChange={(e) => setRegulerSchedule(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    >
                      <option value="Sesi Sore (Senin & Kamis 16.00)">Sesi Sore (Senin & Kamis 16.00)</option>
                      <option value="Sesi Sore (Selasa & Jumat 16.00)">Sesi Sore (Selasa & Jumat 16.00)</option>
                      <option value="Sesi Pagi Weekend (Sabtu & Minggu 08.00)">Sesi Pagi Weekend (Sabtu & Minggu 08.00)</option>
                      <option value="Sesi Sore Weekend (Sabtu & Minggu 16.00)">Sesi Sore Weekend (Sabtu & Minggu 16.00)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ================= KHUSUS FLOW 3: PREMIUM PRIVATE (START FROM 400K) ================= */}
              {activeTab === "premium_private" && (
                <div className="space-y-3.5 p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80">
                  {/* Paket Sesi */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Jumlah Sesi Privat yang Diinginkan <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { count: 2, label: "2 Sesi (Start)", price: "Rp 400.000" },
                        { count: 4, label: "4 Sesi (1x/mgg)", price: "Rp 800.000", popular: true },
                        { count: 6, label: "6 Sesi", price: "Rp 1.200.000" },
                        { count: 8, label: "8 Sesi (Hemat)", price: "Rp 1.500.000" },
                      ].map((pkg) => (
                        <button
                          key={pkg.count}
                          type="button"
                          onClick={() => {
                            setPrivateSessions(pkg.count);
                            setCustomSessions("");
                          }}
                          className={`p-2.5 rounded-xl text-left border transition ${
                            privateSessions === pkg.count && !customSessions
                              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                              : "bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{pkg.label}</span>
                            {pkg.popular && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-black rounded font-black">
                                POPULER
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-0.5 ${privateSessions === pkg.count && !customSessions ? "text-purple-100" : "text-[#5E17EB] font-bold"}`}>
                            {pkg.price}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Input Kustom Sesi */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-neutral-500 shrink-0">Atau kustom:</span>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={customSessions}
                        onChange={(e) => setCustomSessions(e.target.value)}
                        placeholder="Ketik jumlah sesi..."
                        className="px-2.5 py-1 text-xs bg-white border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-[#5E17EB]"
                      />
                      <span className="text-[11px] text-neutral-500 shrink-0">(@ Rp 200k/sesi)</span>
                    </div>
                  </div>

                  {/* Jam yang Diinginkan */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Jam Latihan yang Anda Mau <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={preferredHours}
                      onChange={(e) => setPreferredHours(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    >
                      <option value="Pagi (06.00 - 08.00)">Pagi (06.00 - 08.00) • Sejuk & Tenang</option>
                      <option value="Pagi (08.00 - 10.00)">Pagi (08.00 - 10.00) • Ideal untuk Anak</option>
                      <option value="Siang (10.00 - 12.00)">Siang (10.00 - 12.00)</option>
                      <option value="Sore (15.00 - 17.00)">Sore (15.00 - 17.00)</option>
                      <option value="Sore (16.00 - 18.00)">Sore (16.00 - 18.00) • Favorit Sepulang Sekolah</option>
                      <option value="Malam (18.30 - 20.00)">Malam (18.30 - 20.00) • Kebugaran Dewasa</option>
                      <option value="Fleksibel / Kesepakatan Pelatih">Fleksibel (Sesuai Kesepakatan Bersama)</option>
                    </select>
                  </div>

                  {/* Hari yang Diinginkan */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Hari Latihan yang Diinginkan (Bisa pilih beberapa)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(day)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                            preferredDays.includes(day)
                              ? "bg-purple-100 text-[#5E17EB] border-purple-300"
                              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Khusus */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Fokus / Target Latihan Khusus
                    </label>
                    <select
                      value={privateGoal}
                      onChange={(e) => setPrivateGoal(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                    >
                      <option value="Belajar dari nol & keselamatan di air">Belajar dari nol & keselamatan di air</option>
                      <option value="Pemurnian & perbaikan 4 gaya renang kompetitif">Pemurnian & perbaikan 4 gaya renang kompetitif</option>
                      <option value="Persiapan tes fisik renang TNI / POLRI / Kedinasan">Persiapan tes fisik renang TNI / POLRI / Kedinasan</option>
                      <option value="Terapi skoliosis / ortopedi / sensorimotorik">Terapi skoliosis / ortopedi / sensorimotorik</option>
                      <option value="Persiapan kejuaraan / turnamen atletik">Persiapan kejuaraan / turnamen atletik</option>
                    </select>
                  </div>

                  {/* Dynamic Pricing Summary Card */}
                  <div className="p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">
                        Estimasi Biaya Privat
                      </span>
                      <span className="text-base font-black text-[#5E17EB]">
                        Rp {calculatePrivateTotal().toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-neutral-600">
                      <span>
                        {customSessions ? customSessions : privateSessions} Sesi Latihan
                      </span>
                      <span className="block text-emerald-600 font-semibold text-[10px]">
                        ✓ Termasuk Pelatih Pribadi 1-on-1
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan Tambahan (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Kebutuhan khusus, kondisi fisik, atau permintaan jadwal lain..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB] resize-none"
                />
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#5E17EB] hover:bg-[#4b11bd] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pendaftaran...</span>
                    </>
                  ) : activeTab === "free_trial" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Klaim Tiket Free Trial Class (Gratis)</span>
                    </>
                  ) : activeTab === "reguler" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Daftar Reguler ({regulerPricingMap[regulerAgeGroup]?.formatted || "Rp 347.000/bln"})
                      </span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>
                        Booking Privat (Rp {calculatePrivateTotal().toLocaleString("id-ID")})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
