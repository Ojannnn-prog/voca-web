"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VocaLogo } from "@/components/common/VocaLogo";
import {
  Shield,
  Users,
  FileCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Check,
  X,
  Phone,
  Calendar,
  Layers,
  Search,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "applicants" | "members" | "finance">("dashboard");

  // Sample pending applicants (representing leads from trial_leads)
  const [applicants, setApplicants] = useState([
    {
      id: 1,
      name: "Budi Santoso",
      phone: "081234567891",
      age: 7,
      program: "Kids Swimming Development",
      registeredDate: "18 Oktober 2026",
      status: "pending",
    },
    {
      id: 2,
      name: "Siti Rahmawati",
      phone: "081987654321",
      age: 3,
      program: "Toddler Motoric Exploration",
      registeredDate: "18 Oktober 2026",
      status: "pending",
    },
    {
      id: 3,
      name: "Dimas Anggara",
      phone: "082145678901",
      age: 19,
      program: "Persiapan Jasmani TNI/POLRI",
      registeredDate: "19 Oktober 2026",
      status: "pending",
    },
  ]);

  const handleApprove = (id: number) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "approved" } : app))
    );
  };

  const handleReject = (id: number) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "rejected" } : app))
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200/80 p-6 flex flex-col justify-between shrink-0">
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
              { id: "applicants", label: "Data Pendaftar Baru", icon: FileCheck },
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
                      ? "bg-[#5E17EB] text-white shadow-sm"
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

        <div className="pt-6 border-t border-neutral-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website Utama</span>
          </Link>
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
              Kelola data pendaftar, keanggotaan aktif, warta klub, dan pembukuan kas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-purple-50 text-[#5E17EB] rounded-full border border-purple-200">
            <Shield className="w-3.5 h-3.5" />
            <span>Hak Akses: Administrator Utama</span>
          </div>
        </div>

        {/* KPI Cards (Baris 1 Sesuai Design Document) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Anggota Aktif</span>
              <Users className="w-4 h-4 text-[#21649D]" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">142</div>
            <p className="text-[11px] text-emerald-600 font-medium">↑ +12 pendaftar bulan ini</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Pendaftar Pending</span>
              <FileCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600">3</div>
            <p className="text-[11px] text-neutral-500">Menunggu verifikasi admin</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Saldo Kas Klub</span>
              <DollarSign className="w-4 h-4 text-[#38AD4F]" />
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 font-mono">Rp 28.450.000</div>
            <p className="text-[11px] text-emerald-600 font-medium">Arus kas surplus</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-semibold uppercase">Artikel & Kabar</span>
              <Layers className="w-4 h-4 text-[#5E17EB]" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">16</div>
            <p className="text-[11px] text-neutral-500">Terbit di Mading Digital</p>
          </div>
        </div>

        {/* Tabel Verifikasi Pendaftar Baru (Full CRUD Sesuai PRD) */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Pendaftar Baru Menunggu Persetujuan</h2>
              <p className="text-xs text-neutral-500">
                Data calon anggota yang mendaftar melalui formulir trial & konsultasi website.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              3 Permohonan Baru
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Nama Calon Anggota</th>
                  <th className="py-3 px-4">Program Pilihan</th>
                  <th className="py-3 px-4">Usia</th>
                  <th className="py-3 px-4">Nomor WhatsApp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-50 transition">
                    <td className="py-3 px-4 font-bold text-neutral-900">{app.name}</td>
                    <td className="py-3 px-4 text-neutral-700">{app.program}</td>
                    <td className="py-3 px-4">{app.age} Tahun</td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      <a
                        href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#21649D] hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-[#25D366]" />
                        <span>{app.phone}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {app.status === "pending" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                          Menunggu Persetujuan
                        </span>
                      )}
                      {app.status === "approved" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          Disetujui & KTA Aktif
                        </span>
                      )}
                      {app.status === "rejected" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {app.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#38AD4F] hover:bg-[#2e9341] text-white text-[11px] font-bold shadow-sm transition"
                            title="Terima pendaftar & otomatis aktifkan KTA"
                          >
                            <Check className="w-3 h-3" />
                            <span>Terima</span>
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold transition"
                            title="Tolak pendaftaran"
                          >
                            <X className="w-3 h-3" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-normal italic">
                          Telah Diproses
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
