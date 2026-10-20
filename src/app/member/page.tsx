"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
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
  AlertCircle,
  Eye,
  Check,
  X,
  Building2,
  QrCode,
  Receipt,
  LogOut,
  Copy,
  CheckCheck,
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

interface MemberInvoice {
  id: number;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  monthPeriod: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "unpaid" | "pending" | "paid" | "cancelled";
  paymentProofUrl: string | null;
  paymentDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
  verifiedByUser: string | null;
  transactionCode: string | null;
  createdAt: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [activeTab, setActiveTab] = useState<"overview" | "kta" | "events" | "finance">("overview");
  const [searchInput, setSearchInput] = useState(initialId);
  const [currentMember, setCurrentMember] = useState<MemberData | null>(null);
  const [invoices, setInvoices] = useState<MemberInvoice[]>([]);
  const [transactions, setTransactions] = useState<MemberTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Payment Upload & Proof Viewer States
  const [selectedInvoiceForUpload, setSelectedInvoiceForUpload] = useState<MemberInvoice | null>(null);
  const [uploadMethod, setUploadMethod] = useState("Transfer Bank BCA");
  const [uploadFilePreview, setUploadFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");
  const [previewProofInvoice, setPreviewProofInvoice] = useState<MemberInvoice | null>(null);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const loadProfile = useCallback(async (idQuery: string) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const url = idQuery
        ? `/api/member/profile?identifier=${encodeURIComponent(idQuery)}`
        : "/api/member/profile";
      const res = await fetch(url);
      if (res.status === 401) {
        router.push("/login?role=member&redirect=/member");
        return;
      }
      const data = await res.json();
      if (data.success && data.member) {
        setCurrentMember(data.member);
        setInvoices(data.invoices || []);
        setTransactions(data.transactions || []);
      } else {
        setErrorMessage(data.error || "Data anggota tidak ditemukan.");
      }
    } catch {
      setErrorMessage("Gagal memuat profil anggota.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const url = initialId
          ? `/api/member/profile?identifier=${encodeURIComponent(initialId)}`
          : "/api/member/profile";
        const res = await fetch(url);
        if (res.status === 401) {
          router.push("/login?role=member&redirect=/member");
          return;
        }
        const data = await res.json();
        if (!ignore) {
          if (data.success && data.member) {
            setCurrentMember(data.member);
            setInvoices(data.invoices || []);
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
  }, [initialId, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      loadProfile(searchInput.trim());
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(label);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadErrorMsg("Ukuran file terlalu besar (maksimal 10MB).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          // Kompresi Canvas: Maks 1080px, quality 0.75 (Hemat storage hingga 95%)
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1080;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.75);
            setUploadFilePreview(compressed);
            setUploadErrorMsg("");
          } else {
            setUploadFilePreview(event.target?.result as string);
            setUploadErrorMsg("");
          }
        };
        img.onerror = () => {
          setUploadFilePreview(event.target?.result as string);
          setUploadErrorMsg("");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForUpload) return;
    if (!uploadFilePreview) {
      setUploadErrorMsg("Silakan pilih file foto atau tangkapan layar bukti transfer terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    setUploadErrorMsg("");
    try {
      const res = await fetch("/api/member/upload-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForUpload.id,
          paymentProofUrl: uploadFilePreview,
          paymentMethod: uploadMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccessMsg(data.message || "Bukti transfer berhasil dikirim! Menunggu verifikasi admin.");
        if (currentMember) {
          loadProfile(currentMember.memberId);
        }
        setTimeout(() => {
          setSelectedInvoiceForUpload(null);
          setUploadFilePreview(null);
          setUploadSuccessMsg("");
        }, 1800);
      } else {
        setUploadErrorMsg(data.error || "Gagal mengunggah bukti pembayaran.");
      }
    } catch {
      setUploadErrorMsg("Terjadi gangguan koneksi ke server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
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

  const unpaidInvoices = invoices.filter((i) => i.status === "unpaid");
  const pendingInvoices = invoices.filter((i) => i.status === "pending");

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
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-neutral-100 transition"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
                {
                  id: "finance",
                  label: "Kas & Iuran Bulanan",
                  icon: FileText,
                  badge: unpaidInvoices.length > 0 ? unpaidInvoices.length : undefined,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
                      isActive
                        ? "bg-[#5E17EB] text-white shadow-sm"
                        : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {tab.badge}
                      </span>
                    )}
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
                      <span>Status: {unpaidInvoices.length > 0 ? "Ada Tagihan Baru" : "Lunas Aktif"}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab("finance")}
                      className="w-full py-2.5 rounded-xl bg-[#5E17EB] text-white hover:bg-[#4d10c7] text-xs font-bold transition mt-2 shadow-sm"
                    >
                      Buka Tagihan & Iuran
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
                      className="w-full py-2 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200 transition"
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

            {/* TAB 4: KAS & IURAN BULANAN (BILLING & PAYMENT PROOF UPLOAD) */}
            {activeTab === "finance" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Tagihan Iuran & Kas Anggota</h2>
                    <p className="text-xs text-neutral-500">
                      Sistem pembayaran manual via transfer bank / QRIS resmi. Upload bukti pembayaran agar diverifikasi admin klub.
                    </p>
                  </div>
                </div>

                {/* Status Alert Banner */}
                {unpaidInvoices.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-900">
                          Anda memiliki {unpaidInvoices.length} tagihan iuran yang belum dibayar
                        </h4>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Segera lakukan transfer dan upload bukti struk pembayaran agar status member tetap aktif.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInvoiceForUpload(unpaidInvoices[0]);
                        setUploadFilePreview(null);
                        setUploadErrorMsg("");
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                )}

                {pendingInvoices.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#21649D] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">
                        {pendingInvoices.length} Bukti Transfer Sedang Diverifikasi Admin
                      </h4>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Bukti pembayaran yang Anda kirim telah masuk ke antrean verifikasi admin VOCA. Saldo kas resmi akan otomatis tercatat setelah disetujui.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rekening Pembayaran Resmi VOCA */}
                <div className="bg-white rounded-[24px] p-6 border border-neutral-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                    <Building2 className="w-5 h-5 text-[#5E17EB]" />
                    <h3 className="text-sm font-bold text-neutral-900">
                      Rekening Resmi Klub VOCA (Manual Transfer)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bank BCA */}
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Bank BCA
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          BCA Transfer
                        </span>
                      </div>
                      <p className="font-mono text-base font-extrabold text-neutral-900 tracking-wider">
                        8415-892-001
                      </p>
                      <p className="text-[11px] text-neutral-500">a.n. VOCA Club Swimming & Fitness</p>
                      <button
                        onClick={() => handleCopy("8415892001", "bca")}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5E17EB] hover:text-[#4d10c7] mt-1"
                      >
                        {copiedBank === "bca" ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. Rekening</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bank Mandiri */}
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Bank Mandiri
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Mandiri Livin
                        </span>
                      </div>
                      <p className="font-mono text-base font-extrabold text-neutral-900 tracking-wider">
                        137-00-2918291-3
                      </p>
                      <p className="text-[11px] text-neutral-500">a.n. VOCA Club Official</p>
                      <button
                        onClick={() => handleCopy("1370029182913", "mandiri")}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5E17EB] hover:text-[#4d10c7] mt-1"
                      >
                        {copiedBank === "mandiri" ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. Rekening</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* QRIS Nasional */}
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          QRIS Semua Pembayaran
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          QRIS Siap Scan
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-neutral-700" />
                        <span className="text-xs font-bold text-neutral-800">
                          VOCA Club Official QRIS
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-tight">
                        Support GoPay, OVO, Dana, ShopeePay, LinkAja & Semua M-Banking Indonesia.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian 1: Daftar Tagihan Anggota */}
                <div className="bg-white rounded-[24px] border border-neutral-200/80 overflow-hidden shadow-sm space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Daftar Tagihan Iuran Anda</h3>
                      <p className="text-xs text-neutral-500">
                        Pilih tagihan yang ingin dibayar, lalu upload bukti transfer struk atau tangkapan layar.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-600 font-mono">
                      {invoices.length} Tagihan
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
                        <tr>
                          <th className="py-3 px-4">No. Tagihan</th>
                          <th className="py-3 px-4">Periode</th>
                          <th className="py-3 px-4">Batas Bayar</th>
                          <th className="py-3 px-4 text-right">Nominal</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {invoices.map((inv) => {
                          const formattedDue = inv.dueDate
                            ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-";

                          return (
                            <tr key={inv.id} className="hover:bg-neutral-50/80">
                              <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-neutral-800">{inv.monthPeriod}</span>
                                {inv.notes && (
                                  <p className="text-[10px] text-neutral-400 truncate max-w-[180px]">
                                    {inv.notes}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-neutral-500">
                                {formattedDue}
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-neutral-900">
                                Rp {inv.amount.toLocaleString("id-ID")}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {inv.status === "paid" && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                    <CheckCircle2 className="w-3 h-3" />
                                    LUNAS
                                  </span>
                                )}
                                {inv.status === "pending" && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    <Clock className="w-3 h-3" />
                                    MENUNGGU VERIFIKASI
                                  </span>
                                )}
                                {inv.status === "unpaid" && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                                    <AlertCircle className="w-3 h-3" />
                                    BELUM BAYAR
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {inv.status === "unpaid" && (
                                  <button
                                    onClick={() => {
                                      setSelectedInvoiceForUpload(inv);
                                      setUploadFilePreview(null);
                                      setUploadErrorMsg("");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-[11px] font-bold transition shadow-sm"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Bukti</span>
                                  </button>
                                )}
                                {inv.status === "pending" && (
                                  <button
                                    onClick={() => setPreviewProofInvoice(inv)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition border border-amber-200"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Lihat Bukti</span>
                                  </button>
                                )}
                                {inv.status === "paid" && (
                                  <button
                                    onClick={() => {
                                      if (inv.paymentProofUrl) {
                                        setPreviewProofInvoice(inv);
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                                  >
                                    {inv.paymentProofUrl ? (
                                      <>
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Bukti Struk</span>
                                      </>
                                    ) : (
                                      <span className="text-[11px] text-neutral-400">Terverifikasi</span>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {invoices.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-neutral-400">
                              Tidak ada tagihan yang diterbitkan untuk akun Anda saat ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bagian 2: Riwayat Transaksi Kas Resmi */}
                <div className="bg-white rounded-[24px] border border-neutral-200/80 overflow-hidden shadow-sm p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      Riwayat Transaksi Kas Resmi (Pembukuan Klub)
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Daftar pembayaran yang telah disetujui admin dan secara resmi masuk ke saldo kas VOCA.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
                        <tr>
                          <th className="py-3 px-4">Kode Transaksi</th>
                          <th className="py-3 px-4">Tanggal Masuk</th>
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
                                MASUK KAS
                              </span>
                            </td>
                          </tr>
                        ))}
                        {transactions.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-neutral-400">
                              Belum ada mutasi transaksi kas resmi untuk akun ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>

      {/* MODAL 1: UPLOAD BUKTI TRANSFER PEMBAYARAN */}
      {selectedInvoiceForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-neutral-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#5E17EB]/10 flex items-center justify-center text-[#5E17EB]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Upload Bukti Pembayaran</h3>
                  <p className="text-[11px] font-mono text-neutral-500">
                    {selectedInvoiceForUpload.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceForUpload(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Bukti Berhasil Terkirim!</p>
                <p className="text-[11px] text-emerald-700">{uploadSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                {uploadErrorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 text-xs">
                    {uploadErrorMsg}
                  </div>
                )}

                {/* Detail Tagihan */}
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Periode Tagihan:</span>
                    <span className="font-bold text-neutral-900">
                      {selectedInvoiceForUpload.monthPeriod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Nominal yang Harus Ditransfer:</span>
                    <span className="font-extrabold text-[#5E17EB] text-sm">
                      Rp {selectedInvoiceForUpload.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Pilihan Metode Bayar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Metode Pembayaran</label>
                  <select
                    value={uploadMethod}
                    onChange={(e) => setUploadMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
                  >
                    <option value="Transfer Bank BCA">Transfer Bank BCA (8415-892-001)</option>
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri (137-00-2918291-3)</option>
                    <option value="QRIS VOCA Club">QRIS Resmi VOCA (GoPay/OVO/Dana/M-Banking)</option>
                    <option value="Tunai / Kasir Kolam">Tunai / Bayar di Kasir Kolam</option>
                  </select>
                </div>

                {/* Upload Foto Struk */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">
                    Foto Struk / Tangkapan Layar Transfer
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-4 text-center hover:bg-neutral-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploadFilePreview ? (
                      <div className="space-y-2">
                        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-neutral-100 mx-auto">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={uploadFilePreview}
                            alt="Bukti Bayar Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold">
                          ✓ File foto dipilih. Klik untuk mengganti.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 py-3">
                        <Upload className="w-7 h-7 text-neutral-400 mx-auto" />
                        <p className="text-xs font-semibold text-neutral-700">
                          Klik untuk pilih foto struk
                        </p>
                        <p className="text-[10px] text-neutral-400">JPG, PNG, atau WEBP (Maks 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceForUpload(null)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFilePreview}
                    className="flex-1 py-2.5 rounded-xl bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Kirim Bukti</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: PREVIEW BUKTI TRANSFER */}
      {previewProofInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[28px] p-6 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Bukti Pembayaran Terkirim</h3>
                <p className="text-[11px] font-mono text-neutral-500">
                  {previewProofInvoice.invoiceNumber} • {previewProofInvoice.monthPeriod}
                </p>
              </div>
              <button
                onClick={() => setPreviewProofInvoice(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center max-h-[60vh] p-2">
              {previewProofInvoice.paymentProofUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewProofInvoice.paymentProofUrl}
                  alt="Struk Pembayaran"
                  className="max-h-[55vh] object-contain rounded-xl"
                />
              ) : (
                <p className="text-white text-xs py-10">Bukti transfer tidak tersedia.</p>
              )}
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Metode Bayar:</span>
                <span className="font-bold text-neutral-900">
                  {previewProofInvoice.paymentMethod || "Transfer Bank"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status:</span>
                <span className="font-bold uppercase text-amber-600">
                  {previewProofInvoice.status === "paid" ? "Lunas Terverifikasi" : "Menunggu Verifikasi"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setPreviewProofInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
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
