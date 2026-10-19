"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Loader2, Sparkles } from "lucide-react";
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
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [participantAge, setParticipantAge] = useState("");
  const [programCategory, setProgramCategory] = useState(defaultProgram);
  const [planType, setPlanType] = useState<"free_trial" | "reguler" | "premium_private" | "consultation">(defaultPlanType);
  const [ageCategory, setAgeCategory] = useState(defaultCategory);
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          email,
          participantAge: participantAge ? parseInt(participantAge, 10) : null,
          programCategory,
          planType,
          ageCategory,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim pendaftaran.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-neutral-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VocaLogo variant="full" size="sm" />
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Pendaftaran Berhasil Dikirim!
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
                Terima kasih <strong>{fullName}</strong>. Data Anda telah tersimpan di sistem
                VOCA. Tim admin pelatih kami akan menghubungi Anda melalui WhatsApp untuk
                mengonfirmasi jadwal trial & konsultasi.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition"
                >
                  Selesai
                </button>
                <a
                  href={`https://wa.me/${
                    process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || "6281234567890"
                  }?text=Halo%20Admin%20VOCA,%20saya%20sudah%20mengisi%20formulir%20pendaftaran%20atas%20nama%20${encodeURIComponent(
                    fullName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bd5a] transition flex items-center justify-center gap-2"
                >
                  Konfirmasi ke WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                  Formulir Pendaftaran & Konsultasi
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Mulai perjalanan olahraga Anda bersama Vortex Community of Athletics.
                </p>
              </div>

              {/* Plan Type Selector (4 Pilihan: Free Trial, Reguler, Premium Private, Konsultasi) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Pilihan Paket / Layanan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPlanType("free_trial")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center ${
                      planType === "free_trial"
                        ? "bg-white text-[#5E17EB] shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Free Trial Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType("reguler")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center ${
                      planType === "reguler"
                        ? "bg-white text-[#5E17EB] shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Reguler Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType("premium_private")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center ${
                      planType === "premium_private"
                        ? "bg-white text-[#5E17EB] shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    ✦ Premium Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType("consultation")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center ${
                      planType === "consultation"
                        ? "bg-white text-[#5E17EB] shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Konsultasi Program
                  </button>
                </div>
              </div>

              {/* Kategori Peserta Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Kategori Kelompok Usia / Spesialisasi
                </label>
                <select
                  value={ageCategory}
                  onChange={(e) => setAgeCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                >
                  <option value="balita">Balita (1 - 4 Tahun) - Rp 299.000/bln</option>
                  <option value="anak">Anak-anak (5 - 12 Tahun) - Rp 347.000/bln</option>
                  <option value="remaja">Remaja (13 - 17 Tahun) - Rp 399.000/bln</option>
                  <option value="dewasa">Dewasa (18+ Tahun) - Rp 499.000/bln</option>
                  <option value="terapi_lansia">Terapi Lansia (Senior) - Rp 498.000/bln</option>
                  <option value="terapi_disabilitas">Terapi Disabilitas - Rp 597.000/bln</option>
                  <option value="casis_tni_polri">Casis TNI / POLRI - Rp 547.000/bln</option>
                </select>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama Lengkap Peserta / Orang Tua <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                />
              </div>

              {/* Nomor WhatsApp & Email */}
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
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Usia Peserta (Tahun)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={participantAge}
                    onChange={(e) => setParticipantAge(e.target.value)}
                    placeholder="Contoh: 7"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                />
              </div>

              {/* Kategori Program */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Pilihan Bidang Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={programCategory}
                  onChange={(e) => setProgramCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB]"
                >
                  <option value="swimming">VOCA Swimming Academy (Renang)</option>
                  <option value="motoric">VOCA Motoric House (Rumah Motorik)</option>
                  <option value="tni_polri">Persiapan Jasmani TNI / POLRI</option>
                  <option value="adaptive">Program Akuatik / Motorik Adaptif</option>
                  <option value="both">Kombinasi (Renang & Motorik)</option>
                </select>
              </div>

              {/* Catatan / Kebutuhan Khusus */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Catatan Tambahan / Pengalaman Sebelumnya
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ceritakan minat atau kemampuan awal (misal: belum bisa mengapung, persiapan tes, dll)..."
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#5E17EB] hover:bg-[#4b11bd] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Kirim Pendaftaran
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
