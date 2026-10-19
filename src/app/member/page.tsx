"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VocaLogo } from "@/components/common/VocaLogo";
import {
  User,
  Calendar,
  CreditCard,
  Bell,
  ArrowLeft,
  Printer,
  CheckCircle2,
  Clock,
  QrCode,
  Shield,
  FileText,
  Upload,
} from "lucide-react";

export default function MemberPortalPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "kta" | "events" | "finance">("overview");
  const [ktaFlipped, setKtaFlipped] = useState(false);

  // Mock member profile sesuai PRD & Design Doc
  const member = {
    fullName: "Ahmad Rizky Pratama",
    memberNumber: "VOCA-2026-089",
    status: "active" as const, // applicant | active | alumni
    division: "VOCA Swimming Academy",
    cohortYear: "2026",
    joinedDate: "10 Oktober 2026",
    attendanceRate: 94,
    duesStatus: "paid" as const,
  };

  const handlePrintKTA = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-6 md:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100 transition"
            title="Kembali ke Beranda Utama"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <VocaLogo variant="full" size="sm" />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#21649D] text-xs font-bold border border-blue-200">
            Portal Anggota
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-neutral-900">{member.fullName}</p>
            <p className="text-[10px] text-neutral-500">{member.memberNumber}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#21649D] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {member.fullName.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Banner Sambutan & Pinned Announcement (Sesuai PRD) */}
        <div className="bg-gradient-to-r from-[#21649D] via-[#1E40AF] to-[#0F1D2B] text-white rounded-[28px] p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-white/90">
              <Bell className="w-3.5 h-3.5 text-yellow-300" />
              <span>Pengumuman Disematkan</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Selamat Datang, {member.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
              Latihan gabungan persiapan perayaan VOCA Sports Festival akan dilaksanakan pada
              akhir pekan ini di kolam utama. Pastikan melakukan konfirmasi presensi kehadiran.
            </p>
          </div>
        </div>

        {/* Tab Navigasi Member */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-x-auto">
          {[
            { id: "overview", label: "Ringkasan Profil", icon: User },
            { id: "kta", label: "KTA Digital (ID-1)", icon: CreditCard },
            { id: "events", label: "Agenda & Presensi", icon: Calendar },
            { id: "finance", label: "Kas & Iuran", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#21649D] text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Status Akun Card */}
            <div className="bg-white rounded-[24px] p-6 border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Status Keanggotaan
              </h3>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-lg font-bold text-neutral-900">Anggota Aktif</span>
              </div>
              <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                <p>
                  <strong>Nomor Induk Anggota (NIA):</strong> {member.memberNumber}
                </p>
                <p>
                  <strong>Divisi / Program:</strong> {member.division}
                </p>
                <p>
                  <strong>Angkatan:</strong> {member.cohortYear}
                </p>
                <p>
                  <strong>Bergabung Sejak:</strong> {member.joinedDate}
                </p>
              </div>
            </div>

            {/* Statistik Presensi */}
            <div className="bg-white rounded-[24px] p-6 border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Tingkat Kehadiran Latihan
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#21649D]">
                  {member.attendanceRate}%
                </span>
                <span className="text-xs font-semibold text-emerald-600">Sangat Disiplin</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Tercatat 16 dari 17 sesi latihan terakhir berhasil dihadiri secara konsisten.
              </p>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div
                  className="bg-[#21649D] h-2 rounded-full"
                  style={{ width: `${member.attendanceRate}%` }}
                />
              </div>
            </div>

            {/* Status Iuran Kas */}
            <div className="bg-white rounded-[24px] p-6 border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Status Kas Bulanan
              </h3>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-bold text-neutral-900">Lunas (Oktober 2026)</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Iuran operasional bulanan telah diverifikasi oleh bendahara klub.
              </p>
              <button
                onClick={() => setActiveTab("finance")}
                className="w-full py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 transition"
              >
                Lihat Rincian Tagihan
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KTA DIGITAL INTERAKTIF & PRINT-READY (ISO/IEC 7810 ID-1) */}
        {activeTab === "kta" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Kartu Tanda Anggota Digital (KTA)
                </h2>
                <p className="text-xs text-neutral-500">
                  Standar internasional ISO/IEC 7810 ID-1 (85.60 mm × 53.98 mm) — Cetak presisi ukuran KTP / Kartu Debit.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setKtaFlipped(!ktaFlipped)}
                  className="px-4 py-2 rounded-full border border-neutral-300 bg-white text-xs font-semibold hover:bg-neutral-50 transition"
                >
                  {ktaFlipped ? "Lihat Sisi Depan" : "Lihat Sisi Belakang"}
                </button>
                <button
                  type="button"
                  onClick={handlePrintKTA}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#21649D] hover:bg-[#1b5383] text-white text-xs font-bold shadow-md transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF / KTA</span>
                </button>
              </div>
            </div>

            {/* KTA CARD CONTAINER */}
            <div className="flex justify-center py-6">
              <div
                className="kta-card-print relative w-[340px] sm:w-[420px] aspect-[1.585/1] rounded-[18px] bg-gradient-to-br from-[#0F1D2B] via-[#16232E] to-[#21649D] text-white p-5 sm:p-6 shadow-2xl border border-white/20 select-none overflow-hidden transition-all duration-500"
              >
                {!ktaFlipped ? (
                  // SISI DEPAN
                  <div className="h-full flex flex-col justify-between relative z-10">
                    {/* Header Card */}
                    <div className="flex items-center justify-between border-b border-white/20 pb-3">
                      <VocaLogo variant="full" theme="light" size="sm" />
                      <span className="text-[9px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full">
                        MEMBER CARD
                      </span>
                    </div>

                    {/* Body Card */}
                    <div className="flex items-center gap-4 my-auto">
                      <div className="w-20 sm:w-24 aspect-[3/4] rounded-xl bg-white/10 border border-white/30 flex items-center justify-center font-bold text-2xl text-white/60 shrink-0">
                        {member.fullName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-bold text-white tracking-tight">
                          {member.fullName}
                        </p>
                        <p className="text-xs font-mono text-yellow-300 font-semibold tracking-wider">
                          {member.memberNumber}
                        </p>
                        <p className="text-[11px] text-white/80">{member.division}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                          Active Member
                        </span>
                      </div>
                    </div>

                    {/* Footer Card */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] text-white/60">
                      <span>Valid Thru: Lifetime Member</span>
                      <div className="flex items-center gap-1 font-mono text-white/80">
                        <QrCode className="w-4 h-4 text-white" />
                        <span>VERIFIED</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // SISI BELAKANG
                  <div className="h-full flex flex-col justify-between relative z-10 text-[10px] text-white/80 leading-relaxed">
                    <div className="border-b border-white/20 pb-2 flex justify-between items-center">
                      <span className="font-bold tracking-wider text-white">VORTEX COMMUNITY OF ATHLETICS</span>
                      <span className="text-[8px] font-mono">10.10.26</span>
                    </div>
                    <div className="space-y-2 my-auto">
                      <p>
                        1. Kartu ini merupakan bukti keanggotaan resmi VOCA dan tidak dapat dipindahtangankan.
                      </p>
                      <p>
                        2. Gunakan QR Code pada kartu untuk verifikasi presensi kegiatan latihan dan kejuaraan.
                      </p>
                      <p>
                        3. <em>&ldquo;Every Movement Matters — From First Steps to Great Achievements.&rdquo;</em>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-end text-[9px]">
                      <span>Website: voca-athletics.com</span>
                      <div className="text-right">
                        <p className="font-serif italic text-white/90">Ketua Umum VOCA</p>
                        <p className="font-bold text-white text-[10px]">Dewan Pengurus</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AGENDA & PRESENSI */}
        {activeTab === "events" && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-neutral-900">Agenda Kegiatan & Latihan</h2>
            <div className="space-y-3">
              {[
                {
                  title: "Latihan Teknik Akuatik & Renang Gaya Dada",
                  date: "Sabtu, 24 Oktober 2026",
                  time: "07:30 - 09:30 WIB",
                  location: "Kolam Renang Pusat VOCA",
                  type: "Latihan Rutin",
                  rsvp: true,
                },
                {
                  title: "Simulasi Tes Kesamaptaan Jasmani & Renang Ketahanan",
                  date: "Minggu, 1 November 2026",
                  time: "06:30 - 10:00 WIB",
                  location: "Stadion & Kolam Prestasi",
                  type: "Persiapan TNI/POLRI",
                  rsvp: false,
                },
              ].map((ev, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#21649D]">
                      {ev.type}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900">{ev.title}</h3>
                    <p className="text-xs text-neutral-500">
                      📅 {ev.date} • ⏰ {ev.time} • 📍 {ev.location}
                    </p>
                  </div>
                  <button
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition shrink-0 ${
                      ev.rsvp
                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                        : "bg-[#21649D] text-white hover:bg-[#1b5383]"
                    }`}
                  >
                    {ev.rsvp ? "✓ Terdaftar (Hadir)" : "Ikuti Kegiatan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: KAS & IURAN */}
        {activeTab === "finance" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Kas & Iuran Keanggotaan</h2>
                <p className="text-xs text-neutral-500">
                  Pembayaran iuran operasional klub dikelola secara transparan.
                </p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#38AD4F] hover:bg-[#2e9341] text-white text-xs font-bold shadow-md transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Bukti Bayar</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">Deskripsi</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  <tr>
                    <td className="py-3 px-4 font-mono">Oktober 2026</td>
                    <td className="py-3 px-4">Iuran Kas Anggota Aktif</td>
                    <td className="py-3 px-4 font-mono">Rp 100.000</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        LUNAS
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono">November 2026</td>
                    <td className="py-3 px-4">Iuran Kas Anggota Aktif</td>
                    <td className="py-3 px-4 font-mono">Rp 100.000</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                        BELUM DIBAYAR
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
