"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Calendar,
  CreditCard,
  UserCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Receipt,
  FileText,
  Eye,
  Send,
  Copy,
  CheckCheck,
  Edit2,
  Edit3,
  AlertTriangle,
  Printer,
  Download,
  Info,
} from "lucide-react";
import {
  exportFinancialReportPdf,
  exportMembersReportPdf,
  exportStaffReportPdf,
} from "@/lib/pdf-report-generator";

// Konstanta Periode Bulan dan Tahun untuk Dropdown Otomatis
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const YEAR_OPTIONS = [2025, 2026, 2027, 2028, 2029, 2030];

function parseMonthPeriod(periodStr: string) {
  const parts = (periodStr || "").trim().split(" ");
  const month = MONTH_NAMES.includes(parts[0]) ? parts[0] : "Oktober";
  const year = parts[1] || "2026";
  return { month, year };
}

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
  username: string | null;
  password: string | null;
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

interface Invoice {
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

interface Toast {
  id: number;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  isDanger?: boolean;
  onConfirm: () => Promise<void> | void;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "applicants" | "members" | "invoices" | "finance" | "users"
  >("dashboard");

  // State Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [financeFilter, setFinanceFilter] = useState("all");

  // Filter Periode Kustom Kas & Keuangan (Harian, Bulanan, Semester, Tahunan)
  const [financePeriodMode, setFinancePeriodMode] = useState<"all" | "daily" | "monthly" | "semester" | "yearly">("all");
  const [financeFilterDate, setFinanceFilterDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [financeFilterMonth, setFinanceFilterMonth] = useState<string>("Oktober");
  const [financeFilterYear, setFinanceFilterYear] = useState<string>("2026");
  const [financeFilterSemester, setFinanceFilterSemester] = useState<"1" | "2">("2");

  // ================= NOTIFICATION TOAST & CONFIRM MODAL STATES =================
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalProps | null>(null);

  const showToast = useCallback(
    (type: "success" | "error" | "info" | "warning", title: string, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals - View & Action
  const [selectedKtaMember, setSelectedKtaMember] = useState<Member | null>(null);
  const [selectedProofInvoice, setSelectedProofInvoice] = useState<Invoice | null>(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(null);

  // Modals - Create
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddFinanceOpen, setIsAddFinanceOpen] = useState(false);
  const [financeModalType, setFinanceModalType] = useState<"income" | "expense">("income");
  const [isConvertLeadOpen, setIsConvertLeadOpen] = useState<Lead | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isBulkInvoiceOpen, setIsBulkInvoiceOpen] = useState(false);
  const [isSingleInvoiceOpen, setIsSingleInvoiceOpen] = useState(false);

  // Modals - Edit / Update (Complete CRUD)
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingFinance, setEditingFinance] = useState<FinanceTransaction | null>(null);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Success Notification for Auto-Generated Credentials
  const [generatedAccountSuccess, setGeneratedAccountSuccess] = useState<{
    fullName: string;
    phoneNumber: string;
    username: string;
    password: string;
    memberId: string;
  } | null>(null);

  const [copiedText, setCopiedText] = useState(false);

  // Form States - Add Lead
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    participantAge: "",
    ageCategory: "kids",
    programCategory: "swimming",
    planType: "free_trial",
    notes: "",
  });

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

  // Form States - Bulk Invoice
  const [bulkInvoiceForm, setBulkInvoiceForm] = useState({
    monthPeriod: "Oktober 2026",
    daysUntilDue: "7",
    notes: "Tagihan Iuran Bulanan Reguler VOCA",
  });

  // Form States - Single Invoice
  const [singleInvoiceForm, setSingleInvoiceForm] = useState({
    memberId: "",
    monthPeriod: "Oktober 2026",
    amount: "347000",
    daysUntilDue: "7",
    notes: "Tagihan Iuran Khusus",
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

      // 3. Fetch invoices
      const resInvoices = await fetch("/api/admin/invoices");
      const dataInvoices = await resInvoices.json();
      if (dataInvoices.success) setInvoices(dataInvoices.invoices || []);

      // 4. Fetch finance
      const resFinance = await fetch("/api/admin/finance");
      const dataFinance = await resFinance.json();
      if (dataFinance.success) {
        setTransactions(dataFinance.transactions || []);
        if (dataFinance.summary) setFinanceSummary(dataFinance.summary);
      }

      // 5. Fetch users
      const resUsers = await fetch("/api/admin/users");
      const dataUsers = await resUsers.json();
      if (dataUsers.success) setSystemUsersList(dataUsers.users || []);
    } catch (err) {
      console.error("Gagal sinkronisasi data admin:", err);
      showToast("error", "Koneksi Terganggu", "Gagal menyinkronkan data terbaru dengan server.");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

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

  // Tab switcher with notification
  const handleTabSwitch = (tabId: "dashboard" | "applicants" | "members" | "invoices" | "finance" | "users", label: string) => {
    setActiveTab(tabId);
    showToast("info", "Navigasi Menu", `Beralih ke tab: ${label}`);
  };

  // ================= 1. LEADS CRUD HANDLERS =================

  // Create Lead Manual
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddLeadOpen(false);
        setNewLeadForm({
          fullName: "",
          phoneNumber: "",
          email: "",
          participantAge: "",
          ageCategory: "kids",
          programCategory: "swimming",
          planType: "free_trial",
          notes: "",
        });
        await fetchAllData();
        showToast("success", "Pendaftar Tersimpan", data.message || "Data pendaftar baru berhasil masuk.");
      } else {
        showToast("error", "Gagal Menambahkan", data.error || "Gagal menyimpan pendaftar.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Lead Status (Quick)
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
        showToast("success", "Status Pendaftar Diperbarui", `Status diubah menjadi: ${status.toUpperCase()}`);
      } else {
        showToast("error", "Gagal Update", data.error || "Gagal memperbarui status.");
      }
    } catch (err) {
      showToast("error", "Kesalahan Jaringan", "Gagal update status pendaftar.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Edit Lead Full
  const handleUpdateLeadDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLead),
      });
      const data = await res.json();
      if (data.success) {
        setEditingLead(null);
        await fetchAllData();
        showToast("success", "Pendaftar Diperbarui", data.message || "Data berhasil disimpan.");
      } else {
        showToast("error", "Gagal Edit", data.error || "Gagal memperbarui data pendaftar.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Jaringan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Lead
  const handleDeleteLead = (id: number, name: string) => {
    setConfirmModal({
      title: "Hapus Pendaftar",
      message: `Apakah Anda yakin ingin menghapus data pendaftar "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Pendaftar",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            await fetchAllData();
            showToast("warning", "Pendaftar Dihapus", `Data ${name} berhasil dihapus.`);
          } else {
            showToast("error", "Gagal Hapus", data.error || "Gagal menghapus pendaftar.");
          }
        } catch {
          showToast("error", "Kesalahan", "Terjadi kegagalan saat menghapus pendaftar.");
        }
      },
    });
  };

  // Convert Lead to Official Member (Auto-generate membervoca2026x & vocamember2026)
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
          programType:
            isConvertLeadOpen.planType === "premium_private"
              ? "Premium Private Class"
              : "Reguler Member",
          sportBranch:
            isConvertLeadOpen.programCategory === "motoric"
              ? "Fundamental Motorik"
              : "Renang & Akuatik",
          monthlyFee:
            isConvertLeadOpen.planType === "premium_private" ? 400000 : 347000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedAccountSuccess({
          fullName: isConvertLeadOpen.fullName,
          phoneNumber: isConvertLeadOpen.phoneNumber,
          username: data.credentials.username,
          password: data.credentials.password,
          memberId: data.credentials.memberId,
        });
        setIsConvertLeadOpen(null);
        await fetchAllData();
        showToast("success", "Anggota Resmi Terdaftar", data.message);
      } else {
        showToast("error", "Gagal Konversi", data.error || "Gagal konversi keanggotaan.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 2. MEMBERS CRUD HANDLERS =================

  // Add Member Manually
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
        setGeneratedAccountSuccess({
          fullName: newMemberForm.fullName,
          phoneNumber: newMemberForm.phoneNumber,
          username: data.member.username || `membervoca2026`,
          password: data.member.password || `vocamember2026`,
          memberId: data.member.memberId,
        });
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
        showToast("success", "Anggota Berhasil Dibuat", data.message);
      } else {
        showToast("error", "Gagal Menambah Anggota", data.error || "Gagal menambah anggota.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit Member Full
  const handleUpdateMemberProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMember),
      });
      const data = await res.json();
      if (data.success) {
        setEditingMember(null);
        await fetchAllData();
        showToast("success", "Profil Anggota Diperbarui", data.message);
      } else {
        showToast("error", "Gagal Update", data.error || "Gagal memperbarui data.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Extend Member Validity
  const handleExtendMember = async (id: number, months: number, name: string) => {
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, extendMonths: months }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
        showToast("success", "Masa Aktif Diperpanjang", `Masa aktif ${name} bertambah ${months} bulan.`);
      }
    } catch {
      showToast("error", "Gagal", "Gagal memperpanjang masa aktif.");
    }
  };

  // Delete Member
  const handleDeleteMember = (id: number, name: string) => {
    setConfirmModal({
      title: "Hapus Anggota",
      message: `Apakah Anda yakin ingin menghapus data anggota "${name}"? Seluruh tagihan terkait anggota ini juga akan dibersihkan.`,
      confirmText: "Ya, Hapus Anggota",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/members?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            await fetchAllData();
            showToast("warning", "Anggota Dihapus", `Data anggota ${name} berhasil dihapus.`);
          } else {
            showToast("error", "Gagal Hapus", data.error || "Gagal menghapus anggota.");
          }
        } catch {
          showToast("error", "Kesalahan", "Terjadi kesalahan saat menghapus anggota.");
        }
      },
    });
  };

  // ================= 3. INVOICES CRUD HANDLERS =================

  // Bulk Invoice Generation
  const handleGenerateBulkInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const days = parseInt(bulkInvoiceForm.daysUntilDue, 10) || 7;
      const targetDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk",
          monthPeriod: bulkInvoiceForm.monthPeriod,
          dueDate: targetDueDate.toISOString(),
          notes: bulkInvoiceForm.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsBulkInvoiceOpen(false);
        await fetchAllData();
        showToast("success", "Tagihan Massal Terbit", data.message);
      } else {
        showToast("error", "Gagal Terbitkan Tagihan", data.error || "Gagal menerbitkan tagihan massal.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Single Invoice Creation
  const handleCreateSingleInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const days = parseInt(singleInvoiceForm.daysUntilDue, 10) || 7;
      const targetDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "single",
          memberId: singleInvoiceForm.memberId,
          monthPeriod: singleInvoiceForm.monthPeriod,
          amount: singleInvoiceForm.amount,
          dueDate: targetDueDate.toISOString(),
          notes: singleInvoiceForm.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSingleInvoiceOpen(false);
        await fetchAllData();
        showToast("success", "Tagihan Diterbitkan", data.message);
      } else {
        showToast("error", "Gagal Terbitkan", data.error || "Gagal menerbitkan tagihan.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Invoice Status (LUNAS, PENDING, UNPAID) - Otomatis Mutasi Saldo Kas!
  const handleUpdateInvoiceStatus = async (
    id: number,
    status: "paid" | "pending" | "unpaid",
    paymentMethod?: string
  ) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, paymentMethod }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedProofInvoice && selectedProofInvoice.id === id) {
          setSelectedProofInvoice(null);
        }
        await fetchAllData();
        showToast("success", "Status Tagihan Diperbarui", data.message);
      } else {
        showToast("error", "Gagal Verifikasi", data.error || "Gagal memperbarui status tagihan.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Edit Invoice Full
  const handleUpdateInvoiceDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingInvoice),
      });
      const data = await res.json();
      if (data.success) {
        setEditingInvoice(null);
        await fetchAllData();
        showToast("success", "Tagihan Diperbarui", data.message);
      } else {
        showToast("error", "Gagal Edit", data.error || "Gagal update tagihan.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = (id: number, invNumber: string) => {
    setConfirmModal({
      title: "Hapus Tagihan",
      message: `Hapus catatan tagihan ${invNumber}? Transaksi kas terkait jika ada tidak akan dihapus otomatis demi kehati-hatian.`,
      confirmText: "Ya, Hapus Tagihan",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/invoices?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            await fetchAllData();
            showToast("warning", "Tagihan Dihapus", `Tagihan ${invNumber} berhasil dihapus.`);
          }
        } catch {
          showToast("error", "Kesalahan", "Gagal menghapus tagihan.");
        }
      },
    });
  };

  // ================= 4. FINANCE CRUD HANDLERS =================

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
        showToast("success", "Transaksi Kas Tercatat", data.message);
      } else {
        showToast("error", "Gagal Catat Transaksi", data.error || "Gagal mencatat transaksi.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit Finance Transaction
  const handleUpdateFinanceTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFinance) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFinance),
      });
      const data = await res.json();
      if (data.success) {
        setEditingFinance(null);
        await fetchAllData();
        showToast("success", "Transaksi Diperbarui", data.message);
      } else {
        showToast("error", "Gagal Edit", data.error || "Gagal update transaksi.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Finance Transaction
  const handleDeleteFinance = (id: number, code: string) => {
    setConfirmModal({
      title: "Hapus Transaksi Kas",
      message: `Hapus catatan transaksi ${code} dari buku kas resmi? Saldo kas akan berkurang atau bertambah kembali sesuai mutasi.`,
      confirmText: "Ya, Hapus Transaksi",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/finance?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            await fetchAllData();
            showToast("warning", "Transaksi Dihapus", `Transaksi ${code} berhasil dihapus.`);
          }
        } catch {
          showToast("error", "Kesalahan", "Gagal menghapus transaksi.");
        }
      },
    });
  };

  // ================= 5. USERS CRUD HANDLERS =================

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
        showToast("success", "Akun Staf Ditambahkan", data.message);
      } else {
        showToast("error", "Gagal Menambah Staf", data.error || "Gagal menambah user.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit User
  const handleUpdateUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (data.success) {
        setEditingUser(null);
        await fetchAllData();
        showToast("success", "Akun Diperbarui", data.message);
      } else {
        showToast("error", "Gagal Edit", data.error || "Gagal update akun.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = (id: number, name: string) => {
    setConfirmModal({
      title: "Hapus Akun Pengguna",
      message: `Hapus akun staf / pelatih "${name}"? Pengguna tidak akan dapat login lagi.`,
      confirmText: "Ya, Hapus Akun",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            await fetchAllData();
            showToast("warning", "Akun Dihapus", `Akun ${name} berhasil dihapus.`);
          }
        } catch {
          showToast("error", "Kesalahan", "Gagal menghapus akun.");
        }
      },
    });
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    showToast("info", "Keluar Sesi", "Anda telah keluar dari panel administrator.");
    router.push("/login?role=admin");
    router.refresh();
  };

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
      (m.username && m.username.toLowerCase().includes(q)) ||
      m.phoneNumber.includes(q)
    );
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (invoiceFilter === "unpaid") return inv.status === "unpaid";
    if (invoiceFilter === "pending") return inv.status === "pending";
    if (invoiceFilter === "paid") return inv.status === "paid";
    return true;
  });

  // Filtered Finance Transactions (Tipe & Periode Kustom)
  const filteredTransactions = transactions.filter((t) => {
    // 1. Filter Tipe (income/expense)
    if (financeFilter === "income" && t.type !== "income") return false;
    if (financeFilter === "expense" && t.type !== "expense") return false;

    // 2. Filter Periode Kustom (Harian, Bulanan, Semester, Tahunan)
    if (financePeriodMode === "all") return true;

    const tDate = new Date(t.transactionDate);
    const tYear = tDate.getFullYear().toString();
    const tMonthIndex = tDate.getMonth();
    const tMonthName = MONTH_NAMES[tMonthIndex];

    if (financePeriodMode === "daily") {
      const dateStr = tDate.toISOString().split("T")[0];
      return dateStr === financeFilterDate;
    }

    if (financePeriodMode === "monthly") {
      return tMonthName === financeFilterMonth && tYear === financeFilterYear;
    }

    if (financePeriodMode === "semester") {
      if (tYear !== financeFilterYear) return false;
      if (financeFilterSemester === "1") {
        return tMonthIndex >= 0 && tMonthIndex <= 5;
      } else {
        return tMonthIndex >= 6 && tMonthIndex <= 11;
      }
    }

    if (financePeriodMode === "yearly") {
      return tYear === financeFilterYear;
    }

    return true;
  });

  // Dynamic Finance Summary untuk periode terpilih
  const dynamicFinanceSummary = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const trx of filteredTransactions) {
      if (trx.type === "income") income += trx.amount;
      else if (trx.type === "expense") expense += trx.amount;
    }
    return {
      totalIncome: income,
      totalExpense: expense,
      currentBalance: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Label Keterangan Periode Terpilih
  const currentPeriodLabel = React.useMemo(() => {
    if (financePeriodMode === "daily") {
      return `Harian (${new Date(financeFilterDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })})`;
    }
    if (financePeriodMode === "monthly") {
      return `Bulan ${financeFilterMonth} ${financeFilterYear}`;
    }
    if (financePeriodMode === "semester") {
      return `Semester ${financeFilterSemester} Tahun ${financeFilterYear}`;
    }
    if (financePeriodMode === "yearly") {
      return `Tahun ${financeFilterYear}`;
    }
    return "Seluruh Riwayat Kas";
  }, [
    financePeriodMode,
    financeFilterDate,
    financeFilterMonth,
    financeFilterYear,
    financeFilterSemester,
  ]);

  // Perhitungan Saldo Berjalan (Running Balance) untuk setiap transaksi
  const transactionsWithRunningBalance = React.useMemo(() => {
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );
    let balance = 0;
    const balanceMap = new Map<number, number>();
    for (const t of sorted) {
      if (t.type === "income") balance += t.amount;
      else balance -= t.amount;
      balanceMap.set(t.id, balance);
    }
    return balanceMap;
  }, [filteredTransactions]);

  // Handler Export PDF Laporan Keuangan
  const handleExportFinancePdf = () => {
    exportFinancialReportPdf({
      transactions: filteredTransactions,
      periodTitle: currentPeriodLabel,
      summary: dynamicFinanceSummary,
      printedBy: "adminvoca",
    });
    showToast("success", "Export PDF Siap", "Laporan audit kas & keuangan siap dicetak atau disimpan sebagai PDF.");
  };

  // Handler Export PDF Laporan Anggota
  const handleExportMembersPdf = () => {
    exportMembersReportPdf({
      members: membersList,
      printedBy: "adminvoca",
    });
    showToast("success", "Export PDF Siap", "Laporan biodata seluruh anggota siap dicetak.");
  };

  // Handler Export PDF Laporan Staf/Pelatih
  const handleExportStaffPdf = () => {
    exportStaffReportPdf({
      users: systemUsersList,
      printedBy: "adminvoca",
    });
    showToast("success", "Export PDF Siap", "Laporan staf & pelatih siap dicetak.");
  };

  const pendingLeadsCount = leads.filter((l) => l.status === "pending").length;
  const activeMembersCount = membersList.filter((m) => m.status === "active").length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === "pending").length;

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 flex flex-col md:flex-row relative">
      {/* ================= FLOATING TOAST NOTIFICATIONS CONTAINER ================= */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slideIn flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-white border-emerald-500/40"
                : toast.type === "error"
                ? "bg-rose-950/90 text-white border-rose-500/40"
                : toast.type === "warning"
                ? "bg-amber-950/90 text-white border-amber-500/40"
                : "bg-slate-900/90 text-white border-blue-500/40"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <p className="font-bold text-sm tracking-tight">{toast.title}</p>
              <p className="text-white/80 mt-0.5 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/50 hover:text-white p-1 rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ================= CONFIRMATION MODAL ALERT ================= */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">{confirmModal.title}</h3>
                <p className="text-xs text-neutral-500">Konfirmasi Tindakan CMS</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const act = confirmModal.onConfirm;
                  setConfirmModal(null);
                  await act();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm ${
                  confirmModal.isDanger
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#5E17EB] hover:bg-[#4d10c7]"
                }`}
              >
                {confirmModal.confirmText || "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              { id: "members", label: "Database Anggota", icon: Users, badge: activeMembersCount },
              { id: "invoices", label: "Tagihan & Bukti Bayar", icon: Receipt, badge: pendingInvoicesCount },
              { id: "finance", label: "Kas & Keuangan Klub", icon: DollarSign, badge: null },
              { id: "users", label: "Kelola User & Staf", icon: UserCheck, badge: null },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => handleTabSwitch(nav.id as any, nav.label)}
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
                        isActive
                          ? "bg-white text-[#5E17EB]"
                          : nav.id === "invoices"
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : "bg-neutral-200 text-neutral-700"
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
              {activeTab === "members" && "Database Anggota Resmi & Akun Member"}
              {activeTab === "invoices" && "Manajemen Tagihan & Verifikasi Bukti Transfer"}
              {activeTab === "finance" && "Buku Kas & Transaksi Keuangan Klub"}
              {activeTab === "users" && "Kelola User, Pengurus, & Pelatih"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Vortex Community of Athletics • Berdiri 10 Oktober 2026 (10.10.26)
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                fetchAllData();
                showToast("info", "Segarkan Data", "Data CMS berhasil disinkronkan kembali.");
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#5E17EB]" : ""}`} />
              <span>Segarkan Data</span>
            </button>

            {/* Tombol Tambah Pendaftar Manual */}
            {activeTab === "applicants" && (
              <button
                onClick={() => setIsAddLeadOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pendaftar Manual</span>
              </button>
            )}

            {/* Tombol Tambah Anggota & Export PDF */}
            {activeTab === "members" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMembersPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-sm active:scale-95"
                  title="Cetak Laporan Biodata & Kategori Anggota (A4 PDF)"
                >
                  <Printer className="w-3.5 h-3.5 text-[#5E17EB]" />
                  <span>Export PDF Anggota</span>
                </button>
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Anggota Baru</span>
                </button>
              </div>
            )}

            {/* Tombol Tagihan */}
            {activeTab === "invoices" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkInvoiceOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Terbitkan Tagihan Massal</span>
                </button>
                <button
                  onClick={() => setIsSingleInvoiceOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tagihan Khusus</span>
                </button>
              </div>
            )}

            {/* Tombol Keuangan & Export PDF */}
            {activeTab === "finance" && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportFinancePdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-sm active:scale-95"
                  title="Cetak Laporan Keuangan Resmi (Sesuai Periode Filter)"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export PDF Laporan Kas</span>
                </button>
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

            {/* Tombol User Staf & Export PDF */}
            {activeTab === "users" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportStaffPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-sm active:scale-95"
                  title="Cetak Daftar Pengguna & Staf Resmi"
                >
                  <Printer className="w-3.5 h-3.5 text-[#5E17EB]" />
                  <span>Export PDF Staf</span>
                </button>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold shadow-md transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Staf / Pelatih</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* NOTIFIKASI AKUN ANGGOTA BARU TER-GENERATE */}
        {generatedAccountSuccess && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-[24px] shadow-xl border border-purple-400/30 relative overflow-hidden animate-fadeIn">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/30 text-yellow-300 text-[11px] font-bold border border-yellow-300/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Akun Anggota Berhasil Dibuat Otomatis!</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Kredensial Login: {generatedAccountSuccess.fullName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-white/60 block text-[10px]">USERNAME ANGGOTA:</span>
                    <strong className="text-yellow-300 text-sm">{generatedAccountSuccess.username}</strong>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-white/60 block text-[10px]">PASSWORD RESMI:</span>
                    <strong className="text-emerald-300 text-sm">{generatedAccountSuccess.password}</strong>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-white/60 block text-[10px]">NOMOR KTA MEMBER:</span>
                    <strong className="text-white text-sm">{generatedAccountSuccess.memberId}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setGeneratedAccountSuccess(null)}
                className="text-white/60 hover:text-white p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-white/80">
                Kirim informasi login ini kepada orang tua agar dapat masuk ke Portal Anggota.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `Halo Bapak/Ibu ${generatedAccountSuccess.fullName},\n\nSelamat! Akun Portal Anggota VOCA Anda telah aktif.\n\n📌 Username: ${generatedAccountSuccess.username}\n🔑 Password: ${generatedAccountSuccess.password}\n🆔 ID Member: ${generatedAccountSuccess.memberId}\n\nSilakan login di website VOCA: https://voca-athletics.com/login untuk cek jadwal latihan, KTA digital, dan status iuran.\n\nSalam,\nAdmin VOCA Athletics`;
                    navigator.clipboard.writeText(text);
                    setCopiedText(true);
                    showToast("success", "Kredensial Tersalin", "Kredensial akun anggota disalin ke clipboard.");
                    setTimeout(() => setCopiedText(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition"
                >
                  {copiedText ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? "Tersalin!" : "Salin Kredensial"}</span>
                </button>

                <a
                  href={`https://wa.me/${generatedAccountSuccess.phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Halo Bapak/Ibu ${generatedAccountSuccess.fullName},\n\nSelamat! Akun Portal Anggota VOCA Anda telah aktif.\n\n📌 Username: ${generatedAccountSuccess.username}\n🔑 Password: ${generatedAccountSuccess.password}\n🆔 ID Member: ${generatedAccountSuccess.memberId}\n\nSilakan login di https://voca-athletics.com/login untuk melihat KTA Digital dan status iuran.\n\nSalam hangat,\nAdmin VOCA Athletics`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => showToast("info", "WhatsApp Dibuka", "Mengirim kredensial via WhatsApp.")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-md transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Akun via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 1: DASHBOARD UTAMA ================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top 4 Stat Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Pendaftar Masuk</span>
                  <FileCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-neutral-900">{leads.length}</span>
                  <span className="text-xs font-bold text-amber-600">{pendingLeadsCount} Pending</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Lead masuk dari web</p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Anggota Resmi</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-neutral-900">{activeMembersCount}</span>
                  <span className="text-xs font-bold text-emerald-600">Aktif</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Total {membersList.length} akun terdaftar</p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Saldo Kas Bersih</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-neutral-500">Rp</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                    {financeSummary.currentBalance.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Arus kas otomatis terverifikasi</p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Bukti Menunggu Cek</span>
                  <Receipt className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-600">{pendingInvoicesCount}</span>
                  <span className="text-xs font-bold text-neutral-500">Tagihan</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Perlu verifikasi admin</p>
              </div>
            </div>

            {/* Quick Actions & 2 Tables Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Invoices Awaiting Verification */}
              <div className="bg-white rounded-[24px] border border-neutral-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">Tagihan & Bukti Masuk</h3>
                    <p className="text-xs text-neutral-500">Bukti transfer yang perlu dicek</p>
                  </div>
                  <button
                    onClick={() => handleTabSwitch("invoices", "Tagihan & Bukti Bayar")}
                    className="text-xs font-bold text-[#5E17EB] hover:underline"
                  >
                    Buka Menu Tagihan
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {invoices.slice(0, 4).map((inv) => (
                    <div key={inv.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{inv.memberName}</p>
                        <p className="text-[11px] text-neutral-500">
                          {inv.invoiceNumber} • {inv.monthPeriod}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-xs font-extrabold text-neutral-900">
                            Rp {inv.amount.toLocaleString("id-ID")}
                          </p>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              inv.status === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : inv.status === "pending"
                                ? "bg-amber-100 text-amber-700 animate-pulse"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {inv.status === "paid" ? "Lunas" : inv.status === "pending" ? "Pending" : "Belum Bayar"}
                          </span>
                        </div>
                        {inv.paymentProofUrl && (
                          <button
                            onClick={() => setSelectedProofInvoice(inv)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="Lihat Bukti Transfer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {invoices.length === 0 && (
                    <p className="text-xs text-neutral-400 py-4 text-center">Belum ada tagihan.</p>
                  )}
                </div>
              </div>

              {/* Recent Finance Transactions */}
              <div className="bg-white rounded-[24px] border border-neutral-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">Mutasi Kas Terbaru</h3>
                    <p className="text-xs text-neutral-500">Pemasukan & pengeluaran kas klub</p>
                  </div>
                  <button
                    onClick={() => handleTabSwitch("finance", "Kas & Keuangan Klub")}
                    className="text-xs font-bold text-[#5E17EB] hover:underline"
                  >
                    Buka Buku Kas
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {transactions.slice(0, 4).map((trx) => (
                    <div key={trx.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{trx.description}</p>
                        <p className="text-[11px] text-neutral-400">
                          {trx.category} • {new Date(trx.transactionDate).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold ${
                            trx.type === "income" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {trx.type === "income" ? "+" : "-"} Rp {trx.amount.toLocaleString("id-ID")}
                        </span>
                        <p className="text-[10px] text-neutral-400 capitalize">{trx.paymentMethod}</p>
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

        {/* ================= TAB 2: PENDAFTARAN & TRIAL LEADS ================= */}
        {activeTab === "applicants" && (
          <div className="bg-white rounded-[24px] border border-neutral-200/80 shadow-sm overflow-hidden animate-fadeIn space-y-4 p-5 sm:p-6">
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "all", label: `Semua (${leads.length})` },
                  { id: "pending", label: `Menunggu (${pendingLeadsCount})` },
                  { id: "converted", label: "Sudah Member" },
                  { id: "rejected", label: "Ditolak" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setLeadFilter(f.id);
                      showToast("info", "Filter Pendaftar", `Menampilkan: ${f.label}`);
                    }}
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
                    <th className="py-3.5 px-4 text-center">Aksi Manajemen (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">{lead.fullName}</td>
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
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Detail Pendaftar */}
                          <button
                            onClick={() => setSelectedLeadDetail(lead)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Data Pendaftar */}
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#21649D] transition"
                            title="Edit Data Pendaftar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Konversi ke Member */}
                          {lead.status !== "converted" && (
                            <button
                              onClick={() => setIsConvertLeadOpen(lead)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-[11px] font-bold shadow-sm transition"
                              title="Terima & Otomatis Buat Akun (membervoca2026x)"
                            >
                              <Sparkles className="w-3 h-3 text-yellow-300" />
                              <span>Buat Akun</span>
                            </button>
                          )}

                          {/* Hapus Pendaftar */}
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.fullName)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Hapus Pendaftar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

        {/* ================= TAB 3: DATABASE ANGGOTA & AKUN MEMBER ================= */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search Bar & Stats Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Username (membervoca...), ID, atau Nama..."
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
                      <th className="py-3.5 px-4">ID & Akun Login</th>
                      <th className="py-3.5 px-4">Nama Lengkap</th>
                      <th className="py-3.5 px-4">Program & Kategori</th>
                      <th className="py-3.5 px-4">Iuran / Bulan</th>
                      <th className="py-3.5 px-4">Masa Berlaku</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi Manajemen (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-mono font-bold text-[#5E17EB]">{member.memberId}</p>
                          <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-neutral-600">
                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              User: {member.username || `membervoca2026${member.id}`}
                            </span>
                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] text-neutral-500">
                              Pass: {member.password || `vocamember2026`}
                            </span>
                          </div>
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
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Tombol Lihat & Cetak KTA Digital */}
                            <button
                              onClick={() => setSelectedKtaMember(member)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#21649D] hover:bg-[#1a4f7c] text-white text-[11px] font-bold shadow-sm transition"
                              title="Lihat KTA Digital ISO/IEC 7810"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>KTA</span>
                            </button>

                            {/* Tombol Edit Anggota */}
                            <button
                              onClick={() => setEditingMember(member)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit Data Anggota"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol WhatsApp Kirim Kredensial */}
                            <a
                              href={`https://wa.me/${member.phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Halo Bapak/Ibu ${member.fullName},\n\nBerikut akun resmi Portal Anggota VOCA:\nUsername: ${member.username || `membervoca2026${member.id}`}\nPassword: ${member.password || "vocamember2026"}\nID Member: ${member.memberId}\n\nSilakan login di https://voca-athletics.com/login.\n\nSalam,\nAdmin VOCA Athletics`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Kirim Kredensial Akun via WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>

                            {/* Tombol Perpanjang 1 Bulan */}
                            <button
                              onClick={() => handleExtendMember(member.id, 1, member.fullName)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition"
                              title="Perpanjang 1 Bulan"
                            >
                              +1 Bln
                            </button>

                            {/* Tombol Hapus Anggota */}
                            <button
                              onClick={() => handleDeleteMember(member.id, member.fullName)}
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

        {/* ================= TAB 4: TAGIHAN & VERIFIKASI BUKTI TRANSFER ================= */}
        {activeTab === "invoices" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Invoices Status Header Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
                  Menunggu Verifikasi Bukti
                </span>
                <p className="text-3xl font-extrabold text-amber-600">{pendingInvoicesCount}</p>
                <p className="text-[11px] text-neutral-500 mt-1">Bukti transfer sudah diunggah orang tua</p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Belum Bayar (Unpaid)
                </span>
                <p className="text-3xl font-extrabold text-neutral-800">
                  {invoices.filter((i) => i.status === "unpaid").length}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Menunggu pembayaran orang tua</p>
              </div>

              <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  Tagihan Lunas (Paid)
                </span>
                <p className="text-3xl font-extrabold text-emerald-600">
                  {invoices.filter((i) => i.status === "paid").length}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Otomatis menambah saldo kas klub</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "all", label: `Semua (${invoices.length})` },
                    { id: "pending", label: `Pending Bukti (${pendingInvoicesCount})` },
                    { id: "unpaid", label: "Belum Bayar" },
                    { id: "paid", label: "Lunas" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setInvoiceFilter(f.id);
                        showToast("info", "Filter Tagihan", `Menampilkan: ${f.label}`);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition ${
                        invoiceFilter === f.id
                          ? "bg-[#5E17EB] text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500">
                  Klik <strong>Verifikasi Lunas</strong> untuk otomatis menambah saldo kas
                </p>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-neutral-200/80">
                      <th className="py-3.5 px-4">No. Tagihan</th>
                      <th className="py-3.5 px-4">Anggota</th>
                      <th className="py-3.5 px-4">Periode Bulan</th>
                      <th className="py-3.5 px-4">Nominal</th>
                      <th className="py-3.5 px-4">Batas Bayar</th>
                      <th className="py-3.5 px-4">Status & Bukti</th>
                      <th className="py-3.5 px-4 text-center">Aksi Manajemen (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-900">{inv.memberName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{inv.memberId}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-700">{inv.monthPeriod}</td>
                        <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                          Rp {inv.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-500">
                          {new Date(inv.dueDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                inv.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : inv.status === "pending"
                                  ? "bg-amber-100 text-amber-700 animate-pulse"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {inv.status === "paid"
                                ? "Lunas"
                                : inv.status === "pending"
                                ? "Pending Bukti"
                                : "Belum Bayar"}
                            </span>

                            {inv.paymentProofUrl && (
                              <button
                                onClick={() => setSelectedProofInvoice(inv)}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-[#21649D] font-bold hover:bg-blue-100 transition"
                                title="Lihat Foto Bukti Pembayaran"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Struk</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {/* Tombol Cepat Lunas */}
                            {inv.status !== "paid" && (
                              <button
                                onClick={() => handleUpdateInvoiceStatus(inv.id, "paid")}
                                disabled={actionLoadingId === inv.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition disabled:opacity-50"
                                title="Setujui LUNAS & Otomatis Tambah Saldo Kas"
                              >
                                Lunas
                              </button>
                            )}

                            {/* Tombol Set Pending */}
                            {inv.status === "unpaid" && (
                              <button
                                onClick={() => handleUpdateInvoiceStatus(inv.id, "pending")}
                                disabled={actionLoadingId === inv.id}
                                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition"
                                title="Ubah status ke Pending"
                              >
                                Pending
                              </button>
                            )}

                            {/* Tombol Revert to Belum Bayar */}
                            {inv.status === "paid" && (
                              <button
                                onClick={() => handleUpdateInvoiceStatus(inv.id, "unpaid")}
                                disabled={actionLoadingId === inv.id}
                                className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition"
                                title="Batalkan Lunas & Kurangi Saldo Kas Kembali"
                              >
                                Batal
                              </button>
                            )}

                            {/* Tombol Edit Tagihan */}
                            <button
                              onClick={() => setEditingInvoice(inv)}
                              className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit Data Tagihan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Hapus Tagihan */}
                            <button
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                              className="p-1 text-neutral-400 hover:text-red-600 transition"
                              title="Hapus Tagihan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          Tidak ada tagihan pada kategori filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: KAS & KEUANGAN KLUB ================= */}
        {activeTab === "finance" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[24px] border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Saldo Kas Bersih ({currentPeriodLabel})
                </span>
                <p className={`text-3xl font-extrabold ${dynamicFinanceSummary.currentBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  Rp {dynamicFinanceSummary.currentBalance.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Kumulatif Kas VOCA: <strong>Rp {financeSummary.currentBalance.toLocaleString("id-ID")}</strong>
                </p>
              </div>

              <div className="bg-white p-6 rounded-[24px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Total Pemasukan
                  </span>
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-extrabold text-neutral-900">
                  Rp {dynamicFinanceSummary.totalIncome.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {currentPeriodLabel} • {filteredTransactions.filter(t => t.type === "income").length} transaksi
                </p>
              </div>

              <div className="bg-white p-6 rounded-[24px] border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Total Pengeluaran
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-3xl font-extrabold text-rose-600">
                  Rp {dynamicFinanceSummary.totalExpense.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {currentPeriodLabel} • {filteredTransactions.filter(t => t.type === "expense").length} transaksi
                </p>
              </div>
            </div>

            {/* Filter Periode Kustom & Export Controls */}
            <div className="bg-white p-5 rounded-[24px] border border-neutral-200/80 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Mode Periode Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-neutral-700 mr-1">Periode Laporan:</span>
                  {[
                    { id: "all", label: "Semua" },
                    { id: "daily", label: "Harian" },
                    { id: "monthly", label: "Bulanan" },
                    { id: "semester", label: "Semester" },
                    { id: "yearly", label: "Tahunan" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setFinancePeriodMode(mode.id as any);
                        showToast("info", "Filter Periode", `Mode laporan kas diubah: ${mode.label}`);
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition ${
                        financePeriodMode === mode.id
                          ? "bg-[#5E17EB] text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Tombol Cetak PDF Berdasarkan Filter Terpilih */}
                <button
                  onClick={handleExportFinancePdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition active:scale-95 shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF Laporan Kas ({currentPeriodLabel})</span>
                </button>
              </div>

              {/* Sub-Controls Dinamis berdasarkan Mode Periode */}
              {financePeriodMode !== "all" && (
                <div className="pt-3 border-t border-neutral-100 flex items-center gap-3 flex-wrap text-xs animate-fadeIn bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/60">
                  {financePeriodMode === "daily" && (
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-neutral-700">Pilih Tanggal:</label>
                      <input
                        type="date"
                        value={financeFilterDate}
                        onChange={(e) => setFinanceFilterDate(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg font-mono text-xs"
                      />
                    </div>
                  )}

                  {financePeriodMode === "monthly" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="font-bold text-neutral-700">Pilih Bulan & Tahun:</label>
                      <select
                        value={financeFilterMonth}
                        onChange={(e) => setFinanceFilterMonth(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium"
                      >
                        {MONTH_NAMES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={financeFilterYear}
                        onChange={(e) => setFinanceFilterYear(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {financePeriodMode === "semester" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="font-bold text-neutral-700">Pilih Semester & Tahun:</label>
                      <select
                        value={financeFilterSemester}
                        onChange={(e) => setFinanceFilterSemester(e.target.value as any)}
                        className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium"
                      >
                        <option value="1">Semester 1 (Januari - Juni)</option>
                        <option value="2">Semester 2 (Juli - Desember)</option>
                      </select>
                      <select
                        value={financeFilterYear}
                        onChange={(e) => setFinanceFilterYear(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {financePeriodMode === "yearly" && (
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-neutral-700">Pilih Tahun Anggaran:</label>
                      <select
                        value={financeFilterYear}
                        onChange={(e) => setFinanceFilterYear(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <span className="text-[11px] text-purple-700 font-semibold ml-auto">
                    Menampilkan arsip audit kas: <strong>{currentPeriodLabel}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Filter Tipe Transaksi & Transactions Table */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "all", label: "Semua Transaksi" },
                    { id: "income", label: "Pemasukan Saja" },
                    { id: "expense", label: "Pengeluaran Saja" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setFinanceFilter(f.id);
                        showToast("info", "Filter Kas", `Menampilkan: ${f.label}`);
                      }}
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
                <span className="text-xs text-neutral-500 font-medium">
                  {filteredTransactions.length} transaksi tercatat pada {currentPeriodLabel}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-neutral-200/80">
                      <th className="py-3.5 px-3 text-center">No</th>
                      <th className="py-3.5 px-3">Kode Transaksi</th>
                      <th className="py-3.5 px-3">Tanggal</th>
                      <th className="py-3.5 px-3">Tipe Arus</th>
                      <th className="py-3.5 px-4 min-w-[260px]">
                        Rincian Penggunaan (&quot;Dipergunakan Untuk Apa &amp; Bagaimana&quot;)
                      </th>
                      <th className="py-3.5 px-3">Metode Bayar</th>
                      <th className="py-3.5 px-3 text-right">Nominal Mutasi</th>
                      <th className="py-3.5 px-3 text-right">Saldo Berjalan</th>
                      <th className="py-3.5 px-3 text-center">Aksi (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredTransactions.map((trx, idx) => {
                      const runningBal = transactionsWithRunningBalance.get(trx.id) ?? 0;
                      return (
                        <tr key={trx.id} className="hover:bg-neutral-50/80 transition">
                          <td className="py-3.5 px-3 text-center text-neutral-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-neutral-800">
                            {trx.transactionCode}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-neutral-500 whitespace-nowrap">
                            {new Date(trx.transactionDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
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
                            <p className="font-bold text-neutral-900 leading-snug">{trx.description}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              <span className="font-semibold text-neutral-700">{trx.category}</span>
                              {trx.memberId && (
                                <span className="ml-1.5 font-mono text-[#5E17EB] bg-purple-50 px-1 py-0.2 rounded">
                                  Ref ID: {trx.memberId}
                                </span>
                              )}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 text-neutral-600 font-medium whitespace-nowrap">
                            {trx.paymentMethod}
                          </td>
                          <td
                            className={`py-3.5 px-3 text-right font-extrabold text-xs whitespace-nowrap ${
                              trx.type === "income" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {trx.type === "income" ? "+" : "-"} Rp{" "}
                            {trx.amount.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3.5 px-3 text-right font-extrabold text-xs text-neutral-900 bg-neutral-50/50 whitespace-nowrap">
                            Rp {runningBal.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Edit Transaksi Kas */}
                              <button
                                onClick={() => setEditingFinance(trx)}
                                className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                title="Edit Transaksi Kas"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Hapus Transaksi Kas */}
                              <button
                                onClick={() => handleDeleteFinance(trx.id, trx.transactionCode)}
                                className="p-1 text-neutral-400 hover:text-red-600 transition"
                                title="Hapus transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-neutral-400">
                          Belum ada transaksi pada kategori dan periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: KELOLA USER & STAF ================= */}
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
                    <th className="py-3.5 px-4 text-center">Aksi Manajemen (CRUD)</th>
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
                      <td className="py-3.5 px-4 text-neutral-700">{user.specialty || "-"}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500">
                        {user.phoneNumber || "-"} • {user.email || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          {user.status === "active" ? "Aktif" : user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit User */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                            title="Edit Data Akun Staf/Pelatih"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Hapus User */}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            className="p-1 text-neutral-400 hover:text-red-600 transition"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {systemUsersList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
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

      {/* ================= MODAL: DETAIL PENDAFTAR (LEAD) ================= */}
      {selectedLeadDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Detail Pendaftar</h3>
                <p className="text-[11px] text-neutral-400 font-mono">Ref ID #{selectedLeadDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedLeadDetail(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1.5">
                <p className="font-bold text-sm text-neutral-900">{selectedLeadDetail.fullName}</p>
                <p className="text-neutral-600">
                  WhatsApp: <strong className="font-mono text-neutral-900">{selectedLeadDetail.phoneNumber}</strong>
                </p>
                <p className="text-neutral-600">Email: {selectedLeadDetail.email || "-"}</p>
                <p className="text-neutral-600">
                  Usia: <strong>{selectedLeadDetail.participantAge ? `${selectedLeadDetail.participantAge} Thn` : "-"}</strong> (Kategori: {selectedLeadDetail.ageCategory || "-"})
                </p>
                <p className="text-neutral-600">Program: <strong>{selectedLeadDetail.programCategory}</strong> • Paket: <strong>{selectedLeadDetail.planType || "free_trial"}</strong></p>
                <p className="text-neutral-600">Catatan: {selectedLeadDetail.notes || "Tidak ada catatan."}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
              <a
                href={`https://wa.me/${selectedLeadDetail.phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Halo Bapak/Ibu ${selectedLeadDetail.fullName}, terima kasih telah mendaftar di VOCA Athletics!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedLeadDetail(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PENDAFTAR (LEAD) ================= */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#5E17EB]" />
                <span>Edit Data Pendaftar</span>
              </h3>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLeadDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingLead.fullName}
                  onChange={(e) => setEditingLead({ ...editingLead, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={editingLead.phoneNumber}
                    onChange={(e) => setEditingLead({ ...editingLead, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Usia (Tahun)</label>
                  <input
                    type="number"
                    value={editingLead.participantAge || ""}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        participantAge: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kategori Program</label>
                  <select
                    value={editingLead.programCategory}
                    onChange={(e) => setEditingLead({ ...editingLead, programCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="swimming">Renang & Akuatik</option>
                    <option value="motoric">Fundamental Motorik</option>
                    <option value="both">Kombinasi (Renang & Motorik)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Status</label>
                  <select
                    value={editingLead.status}
                    onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="pending">Menunggu (Pending)</option>
                    <option value="approved">Disetujui</option>
                    <option value="converted">Sudah Jadi Member</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DATA ANGGOTA (MEMBER) ================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#5E17EB]" />
                  <span>Edit Data Anggota</span>
                </h3>
                <p className="text-[11px] font-mono text-[#5E17EB]">{editingMember.memberId}</p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMemberProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName}
                  onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={editingMember.phoneNumber}
                    onChange={(e) => setEditingMember({ ...editingMember, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Iuran / Bulan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingMember.monthlyFee}
                    onChange={(e) => setEditingMember({ ...editingMember, monthlyFee: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Program</label>
                  <select
                    value={editingMember.programType}
                    onChange={(e) => setEditingMember({ ...editingMember, programType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Reguler Member">Reguler Member</option>
                    <option value="Premium Private Class">Premium Private Class</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Cabang Olahraga</label>
                  <select
                    value={editingMember.sportBranch}
                    onChange={(e) => setEditingMember({ ...editingMember, sportBranch: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Renang & Akuatik">Renang & Akuatik</option>
                    <option value="Fundamental Motorik">Fundamental Motorik</option>
                    <option value="Multi-Sport Atletik">Multi-Sport Atletik</option>
                    <option value="Persiapan TNI/POLRI">Persiapan TNI/POLRI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Status Keanggotaan</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="active">Aktif (Active)</option>
                    <option value="inactive">Nonaktif (Inactive)</option>
                    <option value="suspended">Ditangguhkan (Suspended)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kontak Darurat</label>
                  <input
                    type="text"
                    value={editingMember.emergencyContact || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editingMember.notes || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan Anggota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT TAGIHAN (INVOICE) ================= */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#5E17EB]" />
                  <span>Edit Data Tagihan</span>
                </h3>
                <p className="text-[11px] font-mono text-neutral-500">{editingInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setEditingInvoice(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInvoiceDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Periode Bulan & Tahun *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={parseMonthPeriod(editingInvoice.monthPeriod).month}
                    onChange={(e) => {
                      const { year } = parseMonthPeriod(editingInvoice.monthPeriod);
                      setEditingInvoice({ ...editingInvoice, monthPeriod: `${e.target.value} ${year}` });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={parseMonthPeriod(editingInvoice.monthPeriod).year}
                    onChange={(e) => {
                      const { month } = parseMonthPeriod(editingInvoice.monthPeriod);
                      setEditingInvoice({ ...editingInvoice, monthPeriod: `${month} ${e.target.value}` });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingInvoice.amount}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Status Tagihan</label>
                  <select
                    value={editingInvoice.status}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="unpaid">Belum Bayar (Unpaid)</option>
                    <option value="pending">Pending Bukti</option>
                    <option value="paid">Lunas (Paid - Masuk Kas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  value={editingInvoice.notes || ""}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan Tagihan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT TRANSAKSI KAS (FINANCE) ================= */}
      {editingFinance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#5E17EB]" />
                  <span>Edit Transaksi Kas</span>
                </h3>
                <p className="text-[11px] font-mono text-neutral-500">{editingFinance.transactionCode}</p>
              </div>
              <button
                onClick={() => setEditingFinance(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFinanceTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Tipe Transaksi</label>
                  <select
                    value={editingFinance.type}
                    onChange={(e) => setEditingFinance({ ...editingFinance, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="income">Pemasukan (+)</option>
                    <option value="expense">Pengeluaran (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingFinance.amount}
                    onChange={(e) => setEditingFinance({ ...editingFinance, amount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kategori Transaksi *</label>
                <input
                  type="text"
                  required
                  value={editingFinance.category}
                  onChange={(e) => setEditingFinance({ ...editingFinance, category: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Keterangan / Deskripsi *</label>
                <input
                  type="text"
                  required
                  value={editingFinance.description}
                  onChange={(e) => setEditingFinance({ ...editingFinance, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFinance(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Transaksi Kas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT AKUN PENGGUNA (USER) ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#5E17EB]" />
                  <span>Edit Akun Staf / Pelatih</span>
                </h3>
                <p className="text-[11px] font-mono text-neutral-500">@{editingUser.username}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Role / Peran</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="coach">Pelatih (Coach)</option>
                    <option value="staff">Staf Sekretariat</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Spesialisasi</label>
                <input
                  type="text"
                  value={editingUser.specialty || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, specialty: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVIEW BUKTI TRANSFER & VERIFIKASI ================= */}
      {selectedProofInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  Bukti Transfer: {selectedProofInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedProofInvoice.memberName} • Rp {selectedProofInvoice.amount.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => setSelectedProofInvoice(null)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gambar Bukti Transfer Nyata */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 mb-4 flex items-center justify-center">
              {selectedProofInvoice.paymentProofUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedProofInvoice.paymentProofUrl}
                  alt={`Bukti Transfer ${selectedProofInvoice.invoiceNumber}`}
                  className="max-h-full object-contain"
                />
              ) : (
                <p className="text-neutral-400 text-xs">Belum ada file bukti bayar yang diupload.</p>
              )}
            </div>

            <div className="space-y-1 text-xs text-neutral-600 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 mb-4">
              <p>
                <strong>Metode Bayar:</strong> {selectedProofInvoice.paymentMethod || "Transfer Bank"}
              </p>
              <p>
                <strong>Tanggal Upload:</strong>{" "}
                {selectedProofInvoice.paymentDate
                  ? new Date(selectedProofInvoice.paymentDate).toLocaleString("id-ID")
                  : "-"}
              </p>
              <p>
                <strong>Keterangan:</strong> {selectedProofInvoice.notes || "-"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => handleUpdateInvoiceStatus(selectedProofInvoice.id, "unpaid")}
                className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold"
              >
                Tolak / Belum Bayar
              </button>
              <button
                type="button"
                onClick={() => handleUpdateInvoiceStatus(selectedProofInvoice.id, "paid")}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Verifikasi LUNAS & Masuk Kas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TERBITKAN TAGIHAN MASSAL ================= */}
      {isBulkInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Terbitkan Tagihan Massal</span>
              </h3>
              <button
                onClick={() => setIsBulkInvoiceOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBulkInvoices} className="space-y-4 text-xs">
              <p className="text-neutral-500 text-[11px] leading-relaxed">
                Fitur ini akan secara otomatis menerbitkan tagihan bulanan kepada <strong>seluruh {activeMembersCount} anggota aktif</strong> sesuai dengan nominal iuran masing-masing.
              </p>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Periode Bulan & Tahun *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={parseMonthPeriod(bulkInvoiceForm.monthPeriod).month}
                    onChange={(e) => {
                      const { year } = parseMonthPeriod(bulkInvoiceForm.monthPeriod);
                      setBulkInvoiceForm({ ...bulkInvoiceForm, monthPeriod: `${e.target.value} ${year}` });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={parseMonthPeriod(bulkInvoiceForm.monthPeriod).year}
                    onChange={(e) => {
                      const { month } = parseMonthPeriod(bulkInvoiceForm.monthPeriod);
                      setBulkInvoiceForm({ ...bulkInvoiceForm, monthPeriod: `${month} ${e.target.value}` });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Batas Pembayaran Paling Lambat (Hari) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  placeholder="7"
                  value={bulkInvoiceForm.daysUntilDue}
                  onChange={(e) => setBulkInvoiceForm({ ...bulkInvoiceForm, daysUntilDue: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  value={bulkInvoiceForm.notes}
                  onChange={(e) => setBulkInvoiceForm({ ...bulkInvoiceForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkInvoiceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menerbitkan..." : "Terbitkan Tagihan Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAGIHAN KHUSUS PER USER ================= */}
      {isSingleInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-base text-neutral-900">Buat Tagihan Khusus Per Anggota</h3>
              <button
                onClick={() => setIsSingleInvoiceOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Pilih Anggota *</label>
                <select
                  required
                  value={singleInvoiceForm.memberId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const m = membersList.find((item) => item.memberId === selId);
                    setSingleInvoiceForm({
                      ...singleInvoiceForm,
                      memberId: selId,
                      amount: m ? String(m.monthlyFee) : singleInvoiceForm.amount,
                    });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {membersList.map((m) => (
                    <option key={m.id} value={m.memberId}>
                      {m.fullName} ({m.memberId}) - Rp {m.monthlyFee.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Periode Bulan & Tahun *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={parseMonthPeriod(singleInvoiceForm.monthPeriod).month}
                    onChange={(e) => {
                      const { year } = parseMonthPeriod(singleInvoiceForm.monthPeriod);
                      setSingleInvoiceForm({ ...singleInvoiceForm, monthPeriod: `${e.target.value} ${year}` });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={parseMonthPeriod(singleInvoiceForm.monthPeriod).year}
                    onChange={(e) => {
                      const { month } = parseMonthPeriod(singleInvoiceForm.monthPeriod);
                      setSingleInvoiceForm({ ...singleInvoiceForm, monthPeriod: `${month} ${e.target.value}` });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={singleInvoiceForm.amount}
                    onChange={(e) => setSingleInvoiceForm({ ...singleInvoiceForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Batas Bayar (Hari) *</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={singleInvoiceForm.daysUntilDue}
                    onChange={(e) => setSingleInvoiceForm({ ...singleInvoiceForm, daysUntilDue: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Keterangan Tagihan</label>
                <input
                  type="text"
                  value={singleInvoiceForm.notes}
                  onChange={(e) => setSingleInvoiceForm({ ...singleInvoiceForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSingleInvoiceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Terbitkan Tagihan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVIEW & PRINT KTA DIGITAL ================= */}
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

            <KtaCard member={selectedKtaMember} showControls={true} />
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH PENDAFTAR MANUAL ================= */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Tambah Pendaftar Baru Manual</h3>
                <p className="text-[11px] text-neutral-500">Input pendaftar langsung ke database leads.</p>
              </div>
              <button
                onClick={() => setIsAddLeadOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newLeadForm.fullName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={newLeadForm.phoneNumber}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Usia Peserta</label>
                  <input
                    type="number"
                    placeholder="Contoh: 8"
                    value={newLeadForm.participantAge}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, participantAge: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Program</label>
                  <select
                    value={newLeadForm.programCategory}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, programCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="swimming">Renang & Akuatik</option>
                    <option value="motoric">Fundamental Motorik</option>
                    <option value="both">Kombinasi Renang & Motorik</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Paket</label>
                  <select
                    value={newLeadForm.planType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, planType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="free_trial">Free Trial Class</option>
                    <option value="reguler">Reguler Member</option>
                    <option value="premium_private">Premium Private</option>
                    <option value="consultation">Konsultasi Gerak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pendaftar..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#5E17EB] text-white font-bold hover:bg-[#4d10c7] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Pendaftar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH ANGGOTA BARU MANUAL ================= */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">Registrasi Anggota Baru</h3>
                <p className="text-[11px] text-neutral-500">
                  Akun login (membervoca2026x & vocamember2026) akan otomatis ter-generate unik.
                </p>
              </div>
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
                  {isLoading ? "Menyimpan..." : "Daftarkan & Generate Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONVERSI PENDAFTAR KE MEMBER RESMI ================= */}
      {isConvertLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Konversi & Auto-Generate Akun</span>
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

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                <p className="font-bold text-neutral-800">Ketentuan Akun Ter-Generate Otomatis:</p>
                <p>1. <strong>Username:</strong> membervoca2026x (nomor urut pendaftar)</p>
                <p>2. <strong>Password:</strong> vocamember2026</p>
                <p>3. Uang pendaftaran langsung otomatis masuk ke kas klub.</p>
              </div>

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
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  )}
                  <span>Buat Akun & Resmikan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CATAT TRANSAKSI KAS ================= */}
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

      {/* ================= MODAL: TAMBAH USER / STAF ================= */}
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
