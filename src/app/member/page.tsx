"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VocaLogo } from "@/components/common/VocaLogo";
import { KtaCard } from "@/components/common/KtaCard";
import {
  User,
  Calendar,
  CreditCard,
  Bell,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Upload,
  Search,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface MemberData {
  id: number;
  memberId: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  participantAge: number | null;
  ageCategory: string;
  programType: string;
  sportBranch: string;
  monthlyFee: number;
  joinDate: string;
  validUntil: string;
  status: string;
  bloodType: string | null;
  emergencyContact: string | null;
  notes: string | null;
}

interface MemberTransaction {
  id: number;
  transactionCode: string;
  type: string;
  category: string;
  amount: number;
  paymentMethod: string;
  description: string;
  transactionDate: string;
}

function MemberPortalContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [activeTab, setActiveTab] = useState<"overview" | "kta" | "events" | "finance">("overview");
  const [searchInput, setSearchInput] = useState(initialId);
  const [currentMember, setCurrentMember] = useState<MemberData | null>(null);
  const [transactions, setTransactions] = useState<MemberTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = useCallback(async (idQuery: string) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const url = idQuery
        ? `/api/member/profile?identifier=${encodeURIComponent(idQuery)}`
        : "/api/member/profile";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.member) {
        setCurrentMember(data.member);
        setTransactions(data.transactions || []);
      } else {
        setErrorMessage(data.error || "Data anggota tidak ditemukan.");
      }
    } catch {
      setErrorMessage("Gagal memuat profil anggota.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const url = initialId
          ? `/api/member/profile?identifier=${encodeURIComponent(initialId)}`
          : "/api/member/profile";
        const res = await fetch(url);
        const data = await res.json();
        if (!ignore) {
          if (data.success && data.member) {
            setCurrentMember(data.member);
            setTransactions(data.transactions || []);
          } else {
            setErrorMessage(data.error || "Data anggota tidak ditemukan.");
          }
        }
      } catch {
        if (!ignore) setErrorMessage("Gagal memuat profil anggota.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      loadProfile(searchInput.trim());
    }
  };

  const formattedValidUntil = currentMember?.validUntil
    ? new Date(currentMember.validUntil).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const formattedJoinDate = currentMember?.joinDate
    ? new Date(currentMember.joinDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "10 Oktober 2026";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100 transition"
            title="Kembali ke Beranda Utama"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <VocaLogo variant="full" size="sm" />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#21649D] text-xs font-bold border border-blue-200">
            Portal Anggota Resmi
          </span>
        </div>

        {currentMember && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-900">{currentMember.fullName}</p>
              <p className="text-[10px] text-neutral-500 font-mono">{currentMember.memberId}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#5E17EB] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {currentMember.fullName.charAt(0)}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Member Selector / Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-[22px] border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Masukkan ID Anggota / No. HP..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/30 focus:border-[#5E17EB]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
            >
              Cari
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-neutral-400 text-[11px] font-semibold">Demo ID:</span>
            {["VOCA-2026-001", "VOCA-2026-002", "VOCA-2026-003", "VOCA-2026-004"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchInput(id);
                  loadProfile(id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition ${
                  currentMember?.memberId === id
                    ? "bg-[#5E17EB] text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5E17EB]" />
            <p className="text-xs font-medium text-neutral-500">Memuat data keanggotaan...</p>
          </div>
        ) : currentMember ? (
          <>
            {/* Banner Sambutan */}
            <div className="bg-gradient-to-r from-[#21649D] via-[#1E40AF] to-[#0F1D2B] text-white rounded-[28px] p-6 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-white/90">
                  <Bell className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Member Resmi VOCA</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Halo, {currentMember.fullName}!
                </h1>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  ID: <strong className="font-mono text-yellow-300">{currentMember.memberId}</strong> •{" "}
                  Cabang: <strong>{currentMember.sportBranch}</strong> • Paket:{" "}
                  <strong>{currentMember.programType}</strong>. Masa aktif keanggotaan Anda berlaku
                  hingga <strong>{formattedValidUntil}</strong>.
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-x-auto">
              {[
                { id: "overview", label: "Ringkasan Profil", icon: User },
                { id: "kta", label: "KTA Digital (ID-1)", icon: CreditCard },
                { id: "events", label: "Agenda & Presensi", icon: Calendar },
                { id: "finance", label: "Kas & Iuran Bulanan", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? "bg-[#5E17EB] text-white shadow-sm"
                        : "text-neutral-600 hover:text-black hover:bg-neutral-50"
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
                {/* Biodata */}
                <div className="md:col-span-2 bg-white rounded-[24px] p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-bold text-neutral-900">Informasi Keanggotaan</h2>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      {currentMember.status === "active" ? "Aktif" : currentMember.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Nama Lengkap</p>
                      <p className="font-bold text-sm text-neutral-900">{currentMember.fullName}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Nomor KTA</p>
                      <p className="font-mono font-bold text-sm text-[#5E17EB]">{currentMember.memberId}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Kategori Usia</p>
                      <p className="font-bold text-neutral-800">
                        {currentMember.ageCategory} ({currentMember.participantAge ? `${currentMember.participantAge} Thn` : "-"})
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Paket & Cabang Olahraga</p>
                      <p className="font-bold text-neutral-800">
                        {currentMember.programType} • {currentMember.sportBranch}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Tanggal Bergabung</p>
                      <p className="font-bold text-neutral-800">{formattedJoinDate}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Masa Aktif Berakhir</p>
                      <p className="font-bold text-neutral-800">{formattedValidUntil}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Golongan Darah</p>
                      <p className="font-bold text-neutral-800">{currentMember.bloodType || "O"}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-semibold mb-0.5">Kontak Darurat</p>
                      <p className="font-bold text-neutral-800">{currentMember.emergencyContact || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Status Kas & Presensi */}
                <div className="space-y-6">
                  <div className="bg-white rounded-[24px] p-6 border border-neutral-200/80 shadow-sm space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                      Iuran Bulanan Member
                    </span>
                    <p className="text-2xl font-extrabold text-neutral-900">
                      Rp {currentMember.monthlyFee.toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Status: Lunas Aktif</span>
                    </div>
                    <button
                      onClick={() => setActiveTab("finance")}
                      className="w-full py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 transition mt-2"
                    >
                      Riwayat Pembayaran
                    </button>
                  </div>

                  <div className="bg-white rounded-[24px] p-6 border border-neutral-200/80 shadow-sm space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                      KTA Digital Siap Cetak
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Standar ISO/IEC 7810 ID-1 ukuran kartu resmi untuk presensi latihan dan kejuaraan.
                    </p>
                    <button
                      onClick={() => setActiveTab("kta")}
                      className="w-full py-2 rounded-xl bg-[#5E17EB] text-white text-xs font-bold hover:bg-[#4d10c7] transition"
                    >
                      Buka KTA Digital
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KTA DIGITAL */}
            {activeTab === "kta" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center max-w-lg mx-auto mb-4">
                  <h2 className="text-xl font-bold text-neutral-900">
                    Kartu Tanda Anggota Digital (KTA)
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Standar ISO/IEC 7810 ID-1 (85.60 mm × 53.98 mm). Tunjukkan QR Code saat presensi latihan.
                  </p>
                </div>

                <KtaCard member={currentMember} showControls={true} />
              </div>
            )}

            {/* TAB 3: AGENDA & PRESENSI */}
            {activeTab === "events" && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold text-neutral-900">Agenda Kegiatan & Latihan Rutin</h2>
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
                      title: "Simulasi Tes Kesamaptaan Jasmani & Ketahanan Fisik",
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
                        {ev.rsvp ? "✓ Terdaftar Hadir" : "Konfirmasi Hadir"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: KAS & IURAN BULANAN DARI DATABASE */}
            {activeTab === "finance" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Riwayat Iuran & Transaksi Kas</h2>
                    <p className="text-xs text-neutral-500">
                      Catatan transaksi pembayaran iuran yang tercatat di pembukuan resmi VOCA.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
                      <tr>
                        <th className="py-3 px-4">Kode Transaksi</th>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Deskripsi</th>
                        <th className="py-3 px-4">Metode Bayar</th>
                        <th className="py-3 px-4 text-right">Nominal</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {transactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-neutral-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-[#5E17EB]">
                            {trx.transactionCode}
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-500">
                            {new Date(trx.transactionDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-neutral-900">{trx.description}</p>
                            <p className="text-[11px] text-neutral-500">{trx.category}</p>
                          </td>
                          <td className="py-3 px-4 text-neutral-600">{trx.paymentMethod}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                            Rp {trx.amount.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              LUNAS
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-400">
                            Belum ada riwayat transaksi kas tercatat untuk akun ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

export default function MemberPortalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5E17EB]" />
          <p className="text-xs font-medium text-neutral-500">Memuat Portal Anggota VOCA...</p>
        </div>
      }
    >
      <MemberPortalContent />
    </React.Suspense>
  );
}
