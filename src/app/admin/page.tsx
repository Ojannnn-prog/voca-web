"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VocaLogo } from "@/components/common/VocaLogo";
import {
  Shield,
  Users,
  FileCheck,
  DollarSign,
  ArrowLeft,
  Check,
  X,
  Phone,
  Layers,
  LogOut,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";

interface Lead {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  participantAge: number | null;
  ageCategory: string | null;
  programCategory: string;
  planType: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "applicants" | "members" | "finance">("dashboard");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.isAdmin) {
          setIsAuthenticated(true);
          fetchLeads();
        } else {
          router.push("/login?role=admin&redirect=/admin");
        }
      } catch (err) {
        router.push("/login?role=admin&redirect=/admin");
      }
    }
    checkAuth();
  }, [router]);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Gagal mengambil data leads:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
    } catch (err) {
      console.error("Gagal update status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?role=admin");
    router.refresh();
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0F1D2B] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#5E17EB]" />
        <p className="text-sm font-medium text-neutral-400">
          Memeriksa hak akses administrator VOCA...
        </p>
      </div>
    );
  }

  const pendingCount = leads.filter((l) => l.status === "pending").length;
  const approvedCount = leads.filter((l) => l.status === "approved" || l.status === "verified").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200/80 p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <VocaLogo variant="full" size="sm" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-3">
              Admin CMS Management
            </p>
            {[
              { id: "dashboard", label: "Dashboard Utama", icon: Layers },
              { id: "applicants", label: `Pendaftar Baru (${pendingCount})`, icon: FileCheck },
              { id: "members", label: "Database Anggota & KTA", icon: Users },
              { id: "finance", label: "Kas & Keuangan Klub", icon: DollarSign },
            ].map((nav) => {
              const Icon = nav.icon;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === nav.id
                      ? "bg-[#5E17EB] text-white shadow-md shadow-purple-500/15"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Website Utama</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-red-600 hover:bg-red-50 p-2 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Panel Pengurus & CMS VOCA
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kelola data pendaftar baru, verifikasi KTA, dan mutasi kas klub secara terpusat.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeads}
              disabled={isLoadingLeads}
              className="p-2 bg-white border border-neutral-200 rounded-full hover:bg-neutral-50 transition text-neutral-600"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingLeads ? "animate-spin" : ""}`} />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 bg-purple-50 text-[#5E17EB] rounded-full border border-purple-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Login: adminvoca</span>
            </div>
          </div>
        </div>

        {/* KPI Cards (Baris 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Total Pendaftar</span>
              <Users className="w-4 h-4 text-[#21649D]" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">{leads.length}</div>
            <p className="text-[11px] text-emerald-600 font-medium">Data real-time Neon DB</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Pending Approval</span>
              <FileCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600">{pendingCount}</div>
            <p className="text-[11px] text-neutral-500">Menunggu tindakan admin</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Disetujui / Aktif</span>
              <Sparkles className="w-4 h-4 text-[#38AD4F]" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">{approvedCount}</div>
            <p className="text-[11px] text-emerald-600 font-medium">KTA diaktifkan</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Saldo Kas Klub</span>
              <DollarSign className="w-4 h-4 text-[#5E17EB]" />
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 font-mono">Rp 28.450.000</div>
            <p className="text-[11px] text-emerald-600 font-medium">Arus kas surplus</p>
          </div>
        </div>

        {/* Tabel Data Pendaftar dari Neon PostgreSQL */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Data Pendaftar Trial Class & Konsultasi
              </h2>
              <p className="text-xs text-neutral-500">
                Terhubung langsung dengan tabel <code>trial_leads</code> di database Neon PostgreSQL.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-[#5E17EB] rounded-full border border-purple-200 self-start sm:self-auto">
              {leads.length} Calon Peserta
            </span>
          </div>

          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                {isLoadingLeads ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat data pendaftar dari database...</span>
                  </div>
                ) : (
                  <span>Belum ada data pendaftar baru yang masuk.</span>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Program Pilihan</th>
                    <th className="py-3.5 px-4">Usia</th>
                    <th className="py-3.5 px-4">Nomor WhatsApp</th>
                    <th className="py-3.5 px-4">Tipe & Catatan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        {lead.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 capitalize">
                        {lead.programCategory}
                      </td>
                      <td className="py-3.5 px-4">
                        {lead.participantAge ? `${lead.participantAge} Thn` : "-"}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <a
                          href={`https://wa.me/${lead.phoneNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#21649D] hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>{lead.phoneNumber}</span>
                        </a>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-neutral-500 text-[11px]">
                        <span className="font-semibold text-neutral-700 block capitalize">
                          {lead.planType || "free_trial"}
                        </span>
                        {lead.notes || "Tidak ada catatan"}
                      </td>
                      <td className="py-3.5 px-4">
                        {lead.status === "pending" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                            Menunggu Persetujuan
                          </span>
                        )}
                        {(lead.status === "approved" || lead.status === "verified") && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            Disetujui
                          </span>
                        )}
                        {lead.status === "rejected" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            Ditolak
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {lead.status !== "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(lead.id, "approved")}
                              disabled={actionLoadingId === lead.id}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#38AD4F] hover:bg-[#2e9341] text-white text-[11px] font-bold shadow-sm transition disabled:opacity-50"
                              title="Terima pendaftar"
                            >
                              <Check className="w-3 h-3" />
                              <span>Terima</span>
                            </button>
                          )}
                          {lead.status !== "rejected" && (
                            <button
                              onClick={() => handleUpdateStatus(lead.id, "rejected")}
                              disabled={actionLoadingId === lead.id}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold transition disabled:opacity-50"
                              title="Tolak pendaftar"
                            >
                              <X className="w-3 h-3" />
                              <span>Tolak</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
