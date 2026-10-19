"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VocaLogo } from "@/components/common/VocaLogo";
import { KtaCard } from "@/components/common/KtaCard";
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
  Plus,
  Search,
  Printer,
  Calendar,
  CreditCard,
  UserCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
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

interface Member {
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
  createdAt: string;
}

interface FinanceTransaction {
  id: number;
  transactionCode: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  memberId: string | null;
  paymentMethod: string;
  description: string;
  transactionDate: string;
  createdByUser: string;
  createdAt: string;
}

interface SystemUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string | null;
  phoneNumber: string | null;
  specialty: string | null;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "applicants" | "members" | "finance" | "users"
  >("dashboard");

  // State Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [financeSummary, setFinanceSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0,
    transactionCount: 0,
  });
  const [systemUsersList, setSystemUsersList] = useState<SystemUser[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Search & Filter
  const [leadFilter, setLeadFilter] = useState("all");
  const [memberSearch, setMemberSearch] = useState("");
  const [financeFilter, setFinanceFilter] = useState("all");

  // Modals
  const [selectedKtaMember, setSelectedKtaMember] = useState<Member | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddFinanceOpen, setIsAddFinanceOpen] = useState(false);
  const [financeModalType, setFinanceModalType] = useState<"income" | "expense">("income");
  const [isConvertLeadOpen, setIsConvertLeadOpen] = useState<Lead | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Form States - Add Member
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    participantAge: "",
    ageCategory: "Anak-anak",
    programType: "Reguler Member",
    sportBranch: "Renang & Akuatik",
    monthlyFee: "347000",
    bloodType: "O",
    emergencyContact: "",
    notes: "",
  });

  // Form States - Add Finance
  const [financeForm, setFinanceForm] = useState({
    category: "Iuran Bulanan Member",
    amount: "",
    memberId: "",
    paymentMethod: "Transfer Bank",
    description: "",
  });

  // Form States - Add User
  const [userForm, setUserForm] = useState({
    username: "",
    fullName: "",
    role: "coach",
    email: "",
    phoneNumber: "",
    specialty: "Pelatih Renang",
  });

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch leads
      const resLeads = await fetch("/api/admin/leads");
      const dataLeads = await resLeads.json();
      if (dataLeads.success) setLeads(dataLeads.leads || []);

      // 2. Fetch members
      const resMembers = await fetch("/api/admin/members");
      const dataMembers = await resMembers.json();
      if (dataMembers.success) setMembersList(dataMembers.members || []);

      // 3. Fetch finance
      const resFinance = await fetch("/api/admin/finance");
      const dataFinance = await resFinance.json();
      if (dataFinance.success) {
        setTransactions(dataFinance.transactions || []);
        if (dataFinance.summary) setFinanceSummary(dataFinance.summary);
      }

      // 4. Fetch users
      const resUsers = await fetch("/api/admin/users");
      const dataUsers = await resUsers.json();
      if (dataUsers.success) setSystemUsersList(dataUsers.users || []);
    } catch (err) {
      console.error("Gagal sinkronisasi data admin:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.isAdmin) {
          setIsAuthenticated(true);
          fetchAllData();
        } else {
          router.push("/login?role=admin&redirect=/admin");
        }
      } catch {
        router.push("/login?role=admin&redirect=/admin");
      }
    }
    checkAuth();
  }, [router, fetchAllData]);

  // Lead Status Updater
  const handleUpdateLeadStatus = async (id: number, status: string) => {
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
      console.error("Gagal update status lead:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Convert Lead to Official Member
  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConvertLeadOpen) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/convert-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: isConvertLeadOpen.id,
          programType: isConvertLeadOpen.planType === "premium_private" ? "Premium Private Class" : "Reguler Member",
          sportBranch: isConvertLeadOpen.programCategory === "motoric" ? "Fundamental Motorik" : "Renang & Akuatik",
          monthlyFee: isConvertLeadOpen.planType === "premium_private" ? 400000 : 347000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsConvertLeadOpen(null);
        await fetchAllData();
        alert(data.message || "Pendaftar berhasil dijadikan anggota resmi VOCA!");
      } else {
        alert(data.error || "Gagal konversi keanggotaan.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemberForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddMemberOpen(false);
        setNewMemberForm({
          fullName: "",
          phoneNumber: "",
          email: "",
          participantAge: "",
          ageCategory: "Anak-anak",
          programType: "Reguler Member",
          sportBranch: "Renang & Akuatik",
          monthlyFee: "347000",
          bloodType: "O",
          emergencyContact: "",
          notes: "",
        });
        await fetchAllData();
        alert(data.message);
      } else {
        alert(data.error || "Gagal menambah anggota.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Member Status / Extend
  const handleUpdateMember = async (id: number, status?: string, extendMonths?: number) => {
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, extendMonths }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) return;
    try {
      const res = await fetch(`/api/admin/members?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Finance Transaction
  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: financeModalType,
          category: financeForm.category,
          amount: financeForm.amount,
          memberId: financeForm.memberId || null,
          paymentMethod: financeForm.paymentMethod,
          description: financeForm.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddFinanceOpen(false);
        setFinanceForm({
          category: "Iuran Bulanan Member",
          amount: "",
          memberId: "",
          paymentMethod: "Transfer Bank",
          description: "",
        });
        await fetchAllData();
        alert(data.message);
      } else {
        alert(data.error || "Gagal mencatat transaksi.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Finance Transaction
  const handleDeleteFinance = async (id: number) => {
    if (!confirm("Hapus catatan transaksi ini dari buku kas?")) return;
    try {
      const res = await fetch(`/api/admin/finance?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add System User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddUserOpen(false);
        setUserForm({
          username: "",
          fullName: "",
          role: "coach",
          email: "",
          phoneNumber: "",
          specialty: "Pelatih Renang",
        });
        await fetchAllData();
        alert(data.message);
      } else {
        alert(data.error || "Gagal menambah user.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?role=admin");
    router.refresh();
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#5E17EB]" />
        <p className="text-sm font-medium text-neutral-400">
          Memeriksa hak akses administrator VOCA...
        </p>
      </div>
    );
  }

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    if (leadFilter === "pending") return l.status === "pending";
    if (leadFilter === "approved") return l.status === "approved";
    if (leadFilter === "converted") return l.status === "converted";
    if (leadFilter === "rejected") return l.status === "rejected";
    return true;
  });

  // Filtered Members
  const filteredMembers = membersList.filter((m) => {
    const q = memberSearch.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.phoneNumber.includes(q)
    );
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (financeFilter === "income") return t.type === "income";
    if (financeFilter === "expense") return t.type === "expense";
    return true;
  });

  const pendingLeadsCount = leads.filter((l) => l.status === "pending").length;
  const activeMembersCount = membersList.filter((m) => m.status === "active").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 flex flex-col md:flex-row">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200/80 p-5 sm:p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <VocaLogo variant="full" size="sm" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-3">
              Admin CMS Management
            </p>
            {[
              { id: "dashboard", label: "Dashboard Utama", icon: Layers, badge: null },
              { id: "applicants", label: "Pendaftar Baru", icon: FileCheck, badge: pendingLeadsCount },
              { id: "members", label: "Database Anggota & KTA", icon: Users, badge: activeMembersCount },
              { id: "finance", label: "Kas & Keuangan Klub", icon: DollarSign, badge: null },
              { id: "users", label: "Kelola User & Staf", icon: UserCheck, badge: null },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    isActive
                      ? "bg-[#5E17EB] text-white shadow-md shadow-purple-500/15"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{nav.label}</span>
                  </div>
                  {nav.badge !== null && nav.badge > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white text-[#5E17EB]" : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {nav.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-black p-2 rounded-lg hover:bg-neutral-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Website Utama</span>
          </Link>
          <Link
            href="/member"
            className="flex items-center gap-2 text-xs font-semibold text-[#21649D] hover:underline p-2 rounded-lg hover:bg-blue-50 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Portal Member</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-bold text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun Admin</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-5 sm:p-8 md:p-10 overflow-y-auto max-h-screen">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {activeTab === "dashboard" && "Dashboard Tata Kelola VOCA"}
              {activeTab === "applicants" && "Pendaftaran & Trial Leads"}
              {activeTab === "members" && "Database Anggota Resmi & KTA Digital"}
              {activeTab === "finance" && "Buku Kas & Transaksi Keuangan Klub"}
              {activeTab === "users" && "Kelola User, Pengurus, & Pelatih"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Vortex Community of Athletics • Berdiri 10 Oktober 2026 (10.10.26)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#5E17EB]" : ""}`} />
              <span>Segarkan Data</span>
            </button>

            {activeTab === "members" && (
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Anggota Baru</span>
              </button>
            )}

            {activeTab === "finance" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFinanceModalType("income");
                    setIsAddFinanceOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Catat Pemasukan</span>
                </button>
                <button
                  onClick={() => {
                    setFinanceModalType("expense");
                    setIsAddFinanceOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Catat Pengeluaran</span>
                </button>
              </div>
            )}

            {activeTab === "users" && (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Staf / Pelatih</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= TAB 1: DASHBOARD UTAMA ================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top 4 Stat Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Pendaftar Baru</span>
                  <FileCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-neutral-900">{leads.length}</span>
                  <span className="text-xs font-bold text-amber-600">
                    {pendingLeadsCount} Pending
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Lead formulir masuk via web</p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Anggota Aktif</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-neutral-900">{activeMembersCount}</span>
                  <span className="text-xs font-bold text-emerald-600">Terdaftar KTA</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Total {membersList.length} anggota resmi</p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Saldo Kas Klub</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-neutral-500">Rp</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                    {financeSummary.currentBalance.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Arus kas bersih saat ini
                </p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Pemasukan</span>
                  <ArrowDownLeft className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-neutral-500">Rp</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    {financeSummary.totalIncome.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Pengeluaran: Rp {financeSummary.totalExpense.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Quick Actions & 2 Tables Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Applicants */}
              <div className="bg-white rounded-[24px] border border-neutral-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">Pendaftar Terbaru</h3>
                    <p className="text-xs text-neutral-500">Pendaftar trial & konsultasi program</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("applicants")}
                    className="text-xs font-bold text-[#5E17EB] hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {leads.slice(0, 4).map((lead) => (
                    <div key={lead.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{lead.fullName}</p>
                        <p className="text-[11px] text-neutral-500 capitalize">
                          {lead.programCategory} • {lead.planType || "free_trial"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.status === "pending" ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                            Pending
                          </span>
                        ) : lead.status === "converted" ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                            Member Resmi
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            Disetujui
                          </span>
                        )}
                        <a
                          href={`https://wa.me/${lead.phoneNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                          title="Hubungi WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-xs text-neutral-400 py-4 text-center">Belum ada pendaftar baru.</p>
                  )}
                </div>
              </div>

              {/* Recent Finance Transactions */}
              <div className="bg-white rounded-[24px] border border-neutral-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">Arus Kas Terbaru</h3>
                    <p className="text-xs text-neutral-500">Mutasi iuran dan pengeluaran operasional</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("finance")}
                    className="text-xs font-bold text-[#5E17EB] hover:underline"
                  >
                    Buku Kas Lengkap
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {transactions.slice(0, 4).map((trx) => (
                    <div key={trx.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{trx.description}</p>
                        <p className="text-[11px] text-neutral-500">
                          {trx.category} • {trx.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-extrabold ${
                            trx.type === "income" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {trx.type === "income" ? "+" : "-"} Rp{" "}
                          {trx.amount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono">{trx.transactionCode}</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-xs text-neutral-400 py-4 text-center">Belum ada transaksi kas.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PENDAFTAR BARU (APPLICANTS) ================= */}
        {activeTab === "applicants" && (
          <div className="bg-white rounded-[24px] border border-neutral-200/80 shadow-sm overflow-hidden animate-fadeIn">
            {/* Filter Pills */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {[
                  { id: "all", label: `Semua (${leads.length})` },
                  { id: "pending", label: `Menunggu (${pendingLeadsCount})` },
                  { id: "converted", label: "Sudah Member" },
                  { id: "rejected", label: "Ditolak" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setLeadFilter(f.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition ${
                      leadFilter === f.id
                        ? "bg-[#5E17EB] text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-neutral-200/80">
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Program & Paket</th>
                    <th className="py-3.5 px-4">Usia / Kategori</th>
                    <th className="py-3.5 px-4">Kontak WhatsApp</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Tindakan Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        {lead.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 capitalize">
                        <span className="font-semibold block">{lead.programCategory}</span>
                        <span className="text-[11px] text-neutral-500">{lead.planType || "free_trial"}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold block">
                          {lead.participantAge ? `${lead.participantAge} Thn` : "-"}
                        </span>
                        <span className="text-[11px] text-neutral-500 capitalize">
                          {lead.ageCategory || "Anak"}
                        </span>
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
                      <td className="py-3.5 px-4">
                        {lead.status === "pending" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                            Menunggu Persetujuan
                          </span>
                        )}
                        {lead.status === "approved" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            Disetujui
                          </span>
                        )}
                        {lead.status === "converted" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                            Resmi Jadi Member
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
                          {lead.status !== "converted" && (
                            <button
                              onClick={() => setIsConvertLeadOpen(lead)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-[11px] font-bold shadow-sm transition"
                              title="Jadikan Anggota Resmi VOCA & Terbitkan KTA"
                            >
                              <Sparkles className="w-3 h-3 text-yellow-300" />
                              <span>Jadikan Member</span>
                            </button>
                          )}
                          {lead.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateLeadStatus(lead.id, "approved")}
                                disabled={actionLoadingId === lead.id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition disabled:opacity-50"
                                title="Terima Pendaftaran"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleUpdateLeadStatus(lead.id, "rejected")}
                                disabled={actionLoadingId === lead.id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold transition disabled:opacity-50"
                                title="Tolak"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Tidak ada pendaftar dalam kategori filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DATABASE ANGGOTA & KTA DIGITAL ================= */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search Bar & Stats Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ID (VOCA-2026-...) atau Nama..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/30 focus:border-[#5E17EB]"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-neutral-600">
                <span>Total: <strong className="text-neutral-900">{membersList.length}</strong></span>
                <span className="text-emerald-600">Aktif: <strong>{activeMembersCount}</strong></span>
              </div>
            </div>

            {/* Members Data Table */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-neutral-200/80">
                      <th className="py-3.5 px-4">ID Anggota</th>
                      <th className="py-3.5 px-4">Nama Lengkap</th>
                      <th className="py-3.5 px-4">Program & Kategori</th>
                      <th className="py-3.5 px-4">Iuran / Bulan</th>
                      <th className="py-3.5 px-4">Masa Berlaku</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi & KTA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#5E17EB]">
                          {member.memberId}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-900">{member.fullName}</p>
                          <p className="text-[11px] text-neutral-500 font-mono">{member.phoneNumber}</p>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700">
                          <span className="font-semibold block">{member.programType}</span>
                          <span className="text-[11px] text-neutral-500">
                            {member.sportBranch} • {member.ageCategory}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          Rp {member.monthlyFee.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600">
                          {new Date(member.validUntil).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              member.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {member.status === "active" ? "Aktif" : member.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Tombol Lihat & Cetak KTA Digital */}
                            <button
                              onClick={() => setSelectedKtaMember(member)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#21649D] hover:bg-[#1a4f7c] text-white text-[11px] font-bold shadow-sm transition"
                              title="Lihat KTA Digital ISO/IEC 7810"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>KTA Digital</span>
                            </button>

                            {/* Tombol Perpanjang 1 Bulan */}
                            <button
                              onClick={() => handleUpdateMember(member.id, "active", 1)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition"
                              title="Perpanjang 1 Bulan"
                            >
                              +1 Bln
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          Tidak ditemukan anggota dengan kata kunci pencarian tersebut.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: KAS & KEUANGAN KLUB ================= */}
        {activeTab === "finance" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[24px] border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Saldo Kas Bersih VOCA
                </span>
                <p className="text-3xl font-extrabold text-emerald-600">
                  Rp {financeSummary.currentBalance.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Total Pemasukan dikurangi Pengeluaran</p>
              </div>

              <div className="bg-white p-6 rounded-[24px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Total Pemasukan
                  </span>
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-extrabold text-neutral-900">
                  Rp {financeSummary.totalIncome.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Iuran member & pendaftaran baru</p>
              </div>

              <div className="bg-white p-6 rounded-[24px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Total Pengeluaran
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-3xl font-extrabold text-rose-600">
                  Rp {financeSummary.totalExpense.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Sewa venue, honor pelatih, alat</p>
              </div>
            </div>

            {/* Filter & Transactions Table */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "all", label: "Semua Transaksi" },
                    { id: "income", label: "Pemasukan Saja" },
                    { id: "expense", label: "Pengeluaran Saja" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFinanceFilter(f.id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition ${
                        financeFilter === f.id
                          ? "bg-[#5E17EB] text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-neutral-400 font-medium">
                  {filteredTransactions.length} transaksi tercatat
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-neutral-200/80">
                      <th className="py-3.5 px-4">Kode Transaksi</th>
                      <th className="py-3.5 px-4">Tanggal</th>
                      <th className="py-3.5 px-4">Tipe</th>
                      <th className="py-3.5 px-4">Kategori & Keterangan</th>
                      <th className="py-3.5 px-4">Metode Bayar</th>
                      <th className="py-3.5 px-4 text-right">Nominal</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">
                          {trx.transactionCode}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-500">
                          {new Date(trx.transactionDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              trx.type === "income"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {trx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-900">{trx.description}</p>
                          <p className="text-[11px] text-neutral-500">
                            {trx.category} {trx.memberId && `• Ref ID: ${trx.memberId}`}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600 font-medium">
                          {trx.paymentMethod}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-extrabold text-sm ${
                            trx.type === "income" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {trx.type === "income" ? "+" : "-"} Rp{" "}
                          {trx.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeleteFinance(trx.id)}
                            className="p-1 text-neutral-400 hover:text-red-600 transition"
                            title="Hapus transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          Belum ada transaksi pada kategori ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: KELOLA USER & STAF ================= */}
        {activeTab === "users" && (
          <div className="bg-white rounded-[24px] border border-neutral-200/80 shadow-sm overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-neutral-200/80">
                    <th className="py-3.5 px-4">Nama Lengkap & Username</th>
                    <th className="py-3.5 px-4">Peran (Role)</th>
                    <th className="py-3.5 px-4">Spesialisasi</th>
                    <th className="py-3.5 px-4">Kontak Telepon / Email</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {systemUsersList.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900">{user.fullName}</p>
                        <p className="text-[11px] text-neutral-400 font-mono">@{user.username}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            user.role === "admin"
                              ? "bg-purple-100 text-[#5E17EB]"
                              : user.role === "coach"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700">
                        {user.specialty || "-"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500">
                        {user.phoneNumber || "-"} • {user.email || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          {user.status === "active" ? "Aktif" : user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {systemUsersList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-400">
                        Belum ada data staf/pelatih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL 1: PREVIEW & PRINT KTA DIGITAL ================= */}
      {selectedKtaMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">KTA Digital Resmi VOCA</h3>
                <p className="text-xs text-neutral-500">
                  Standar ISO/IEC 7810 ID-1 • {selectedKtaMember.memberId}
                </p>
              </div>
              <button
                onClick={() => setSelectedKtaMember(null)}
                className="p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reusable KTA Component */}
            <KtaCard member={selectedKtaMember} showControls={true} />
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TAMBAH ANGGOTA BARU ================= */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-lg text-neutral-900">Registrasi Anggota Baru</h3>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={newMemberForm.fullName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                  placeholder="Contoh: Muhammad Fadhil"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={newMemberForm.phoneNumber}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phoneNumber: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Usia Peserta</label>
                  <input
                    type="number"
                    value={newMemberForm.participantAge}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, participantAge: e.target.value })}
                    placeholder="Contoh: 10"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kategori Usia</label>
                  <select
                    value={newMemberForm.ageCategory}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, ageCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Balita">Balita (1 - 4 Tahun)</option>
                    <option value="Anak-anak">Anak-anak (5 - 12 Tahun)</option>
                    <option value="Remaja">Remaja (13 - 17 Tahun)</option>
                    <option value="Dewasa">Dewasa (18+ Tahun)</option>
                    <option value="Terapi Lansia">Terapi Lansia</option>
                    <option value="Terapi Disabilitas">Terapi Disabilitas</option>
                    <option value="Casis TNI/Polri">Casis TNI/Polri</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Tipe Paket</label>
                  <select
                    value={newMemberForm.programType}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, programType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Reguler Member">Reguler Member (Maks. 3 Murid)</option>
                    <option value="Premium Private Class">Premium Private Class (1-on-1)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Cabang Olahraga</label>
                  <select
                    value={newMemberForm.sportBranch}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, sportBranch: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Renang & Akuatik">Renang & Akuatik</option>
                    <option value="Fundamental Motorik">Fundamental Motorik</option>
                    <option value="Multi-Sport Atletik">Multi-Sport Atletik</option>
                    <option value="Persiapan TNI/POLRI">Persiapan Fisik TNI/POLRI</option>
                    <option value="Terapi Gerak">Terapi Gerak & Adaptif</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Iuran Bulanan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newMemberForm.monthlyFee}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Golongan Darah</label>
                  <select
                    value={newMemberForm.bloodType}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, bloodType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="O">O</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kontak Darurat</label>
                  <input
                    type="text"
                    value={newMemberForm.emergencyContact}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, emergencyContact: e.target.value })}
                    placeholder="0812... (Orang Tua)"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Daftarkan & Terbitkan KTA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CATAT TRANSAKSI KAS ================= */}
      {isAddFinanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-base text-neutral-900">
                {financeModalType === "income" ? "Catat Pemasukan Kas" : "Catat Pengeluaran Kas"}
              </h3>
              <button
                onClick={() => setIsAddFinanceOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFinance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kategori Transaksi *</label>
                <select
                  value={financeForm.category}
                  onChange={(e) => setFinanceForm({ ...financeForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  {financeModalType === "income" ? (
                    <>
                      <option value="Iuran Bulanan Member">Iuran Bulanan Member</option>
                      <option value="Pendaftaran Baru">Pendaftaran Baru</option>
                      <option value="Sponsorship & Donasi">Sponsorship & Donasi</option>
                      <option value="Pemasukan Sports Festival">Pemasukan Sports Festival</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Honor Pelatih">Honor Pelatih</option>
                      <option value="Sewa Venue / Kolam">Sewa Venue / Kolam</option>
                      <option value="Peralatan & Fasilitas">Peralatan & Fasilitas</option>
                      <option value="Operasional & ATK">Operasional & ATK</option>
                      <option value="Konsumsi & Event">Konsumsi & Event</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Jumlah Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 350000"
                  value={financeForm.amount}
                  onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Keterangan Transaksi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iuran Oktober 2026 Ahmad Rizky"
                  value={financeForm.description}
                  onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Metode Bayar</label>
                  <select
                    value={financeForm.paymentMethod}
                    onChange={(e) => setFinanceForm({ ...financeForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Tunai">Tunai</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Ref ID Anggota (Opsional)</label>
                  <input
                    type="text"
                    placeholder="VOCA-2026-..."
                    value={financeForm.memberId}
                    onChange={(e) => setFinanceForm({ ...financeForm, memberId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFinanceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-sm disabled:opacity-50 ${
                    financeModalType === "income"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isLoading ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: KONVERSI PENDAFTAR KE MEMBER RESMI ================= */}
      {isConvertLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Konversi ke Anggota Resmi</span>
              </h3>
              <button
                onClick={() => setIsConvertLeadOpen(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvertLead} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
                <p className="font-bold text-neutral-900 text-sm">{isConvertLeadOpen.fullName}</p>
                <p className="text-neutral-600">
                  No HP: <strong>{isConvertLeadOpen.phoneNumber}</strong>
                </p>
                <p className="text-neutral-600 capitalize">
                  Program: {isConvertLeadOpen.programCategory} • {isConvertLeadOpen.planType || "free_trial"}
                </p>
              </div>

              <p className="text-neutral-500 text-[11px] leading-relaxed">
                Menyetujui pendaftar ini akan secara otomatis:
                <br />1. Menerbitkan ID Anggota baru (contoh: VOCA-2026-...) dan KTA Digital.
                <br />2. Mencatat iuran perdana ke buku kas klub VOCA.
              </p>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConvertLeadOpen(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
                  <span>Resmikan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: TAMBAH USER / STAF ================= */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-base text-neutral-900">Tambah Akun Staf / Pelatih</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Username Akun *</label>
                <input
                  type="text"
                  required
                  placeholder="coach_arya"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Arya Maulana, S.Pd."
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Peran (Role)</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="coach">Pelatih (Coach)</option>
                    <option value="staff">Staf Sekretariat</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Spesialisasi</label>
                  <input
                    type="text"
                    placeholder="Pelatih Renang Anak"
                    value={userForm.specialty}
                    onChange={(e) => setUserForm({ ...userForm, specialty: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
