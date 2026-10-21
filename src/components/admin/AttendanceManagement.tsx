"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Scan,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Trash2,
  Filter,
  Search,
  Plus,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Clock,
  Printer,
  BarChart3,
  Award,
  Camera,
} from "lucide-react";
import { QrScannerModal } from "@/components/common/QrScannerModal";
import { exportAttendanceReportPdf, AttendanceReportItem } from "@/lib/pdf-report-generator";
import { generateQrDataUrl, createCoachQrPayload } from "@/lib/qr-generator";

interface AttendanceManagementProps {
  attendanceRecords: AttendanceReportItem[];
  attendanceStats: any;
  membersList: any[];
  systemUsersList: any[];
  currentRole: "admin" | "staff" | "coach";
  onRefresh: () => Promise<void>;
  showToast: (type: "success" | "error" | "info" | "warning", title: string, message: string) => void;
}

export function AttendanceManagement({
  attendanceRecords,
  attendanceStats,
  membersList,
  systemUsersList,
  currentRole,
  onRefresh,
  showToast,
}: AttendanceManagementProps) {
  // Scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Manual Attendance modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    targetType: "member" as "member" | "coach",
    targetId: "",
    targetName: "",
    className: "",
    ageCategory: "Anak-anak",
    status: "hadir" as "hadir" | "izin" | "sakit" | "alpha",
    notes: "",
  });

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfRangeType, setPdfRangeType] = useState<"all" | "daily" | "monthly" | "semester" | "yearly">("monthly");
  const [pdfDailyDate, setPdfDailyDate] = useState(new Date().toISOString().slice(0, 10));
  const [pdfMonth, setPdfMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [pdfYear, setPdfYear] = useState(String(new Date().getFullYear()));
  const [pdfSemester, setPdfSemester] = useState<"1" | "2">("2");
  const [pdfClassification, setPdfClassification] = useState("all");

  // Filtering list
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [activeSubTab, setActiveSubTab] = useState<"records" | "coaches" | "charts">("records");

  // Coach QR Cache
  const [coachQrs, setCoachQrs] = useState<Record<string, string>>({});

  const coachesList = systemUsersList.filter((u) => u.role === "coach");

  useEffect(() => {
    // Generate coach QRs for the coach section
    coachesList.forEach((c) => {
      const code = c.coachCode || `COACH-${c.id}`;
      if (!coachQrs[code]) {
        const payload = createCoachQrPayload({
          coachCode: code,
          fullName: c.fullName,
          specialty: c.specialty,
        });
        generateQrDataUrl(payload).then((url) => {
          if (url) {
            setCoachQrs((prev) => ({ ...prev, [code]: url }));
          }
        });
      }
    });
  }, [coachesList, coachQrs]);

  // Handle Scan Result from Camera
  const handleScanResult = async (result: {
    type: "member" | "coach";
    id: string;
    name: string;
    category?: string;
  }) => {
    setIsScannerOpen(false);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: result.type,
          targetId: result.id,
          targetName: result.name,
          ageCategory: result.category || (result.type === "coach" ? "Pelatih" : "Anak-anak"),
          status: "hadir",
          scanMethod: "qr_code",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          data.alreadyRecorded ? "info" : "success",
          data.alreadyRecorded ? "Presensi Sudah Tercatat" : "Presensi Berhasil",
          data.message || `Presensi HADIR berhasil untuk ${result.name}`
        );
        await onRefresh();
      } else {
        showToast("error", "Gagal Mencatat", data.error || "Gagal mencatat presensi.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    }
  };

  // Submit Manual Attendance
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.targetId) {
      showToast("error", "Form Belum Lengkap", "Silakan pilih anggota atau pelatih.");
      return;
    }

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: manualForm.targetType,
          targetId: manualForm.targetId,
          targetName: manualForm.targetName,
          className: manualForm.className || undefined,
          ageCategory: manualForm.ageCategory,
          status: manualForm.status,
          scanMethod: "manual",
          notes: manualForm.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Presensi Tersimpan", data.message);
        setIsManualModalOpen(false);
        setManualForm({
          targetType: "member",
          targetId: "",
          targetName: "",
          className: "",
          ageCategory: "Anak-anak",
          status: "hadir",
          notes: "",
        });
        await onRefresh();
      } else {
        showToast("error", "Gagal Mencatat", data.error || "Gagal mencatat presensi.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    }
  };

  // Delete Attendance Log
  const handleDeleteAttendance = async (id: number) => {
    if (!confirm("Hapus catatan presensi ini?")) return;
    try {
      const res = await fetch(`/api/admin/attendance?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Log Dihapus", "Catatan presensi berhasil dihapus.");
        await onRefresh();
      } else {
        showToast("error", "Gagal Menghapus", data.error);
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    }
  };

  // Trigger PDF Report Download
  const handleExportPdf = () => {
    let filtered = [...attendanceRecords];
    let filterDescription = "";
    let classificationDescription = "Semua Klasifikasi";

    // 1. Time Range Filter
    if (pdfRangeType === "daily") {
      const targetDate = pdfDailyDate;
      filtered = filtered.filter((r) => r.attendanceDate && r.attendanceDate.startsWith(targetDate));
      filterDescription = `Harian (${targetDate})`;
    } else if (pdfRangeType === "monthly") {
      filtered = filtered.filter((r) => {
        if (!r.attendanceDate) return false;
        const d = new Date(r.attendanceDate);
        return d.getFullYear() === parseInt(pdfYear, 10) && d.getMonth() + 1 === parseInt(pdfMonth, 10);
      });
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      filterDescription = `Bulan ${monthNames[parseInt(pdfMonth, 10) - 1]} ${pdfYear}`;
    } else if (pdfRangeType === "semester") {
      filtered = filtered.filter((r) => {
        if (!r.attendanceDate) return false;
        const d = new Date(r.attendanceDate);
        if (d.getFullYear() !== parseInt(pdfYear, 10)) return false;
        const m = d.getMonth() + 1;
        return pdfSemester === "1" ? m <= 6 : m >= 7;
      });
      filterDescription = `Semester ${pdfSemester} Tahun ${pdfYear}`;
    } else if (pdfRangeType === "yearly") {
      filtered = filtered.filter((r) => {
        if (!r.attendanceDate) return false;
        const d = new Date(r.attendanceDate);
        return d.getFullYear() === parseInt(pdfYear, 10);
      });
      filterDescription = `Tahun Penuh ${pdfYear}`;
    } else {
      filterDescription = "Keseluruhan Riwayat";
    }

    // 2. Classification Filter
    if (pdfClassification === "balita") {
      filtered = filtered.filter((r) => (r.ageCategory || "").toLowerCase().includes("balita"));
      classificationDescription = "Khusus Balita (1 - 4 Tahun)";
    } else if (pdfClassification === "balita_anak") {
      filtered = filtered.filter(
        (r) =>
          (r.ageCategory || "").toLowerCase().includes("balita") ||
          (r.ageCategory || "").toLowerCase().includes("anak")
      );
      classificationDescription = "Rentang Balita s/d Anak-anak (1 - 12 Tahun)";
    } else if (pdfClassification === "remaja_casis") {
      filtered = filtered.filter(
        (r) =>
          (r.ageCategory || "").toLowerCase().includes("remaja") ||
          (r.ageCategory || "").toLowerCase().includes("casis") ||
          (r.ageCategory || "").toLowerCase().includes("dewasa")
      );
      classificationDescription = "Rentang Remaja s/d Casis TNI/Polri (13 - 22+ Tahun)";
    } else if (pdfClassification === "coach") {
      filtered = filtered.filter((r) => r.targetType === "coach");
      classificationDescription = "Khusus Presensi & Rekap Sesi Pelatih (Honor)";
    }

    exportAttendanceReportPdf({
      records: filtered,
      filterDescription,
      classificationFilter: classificationDescription,
      printedBy: currentRole,
    });

    setIsPdfModalOpen(false);
    showToast("success", "PDF Diunduh", `Laporan presensi (${filtered.length} baris) berhasil diunduh murni.`);
  };

  // Filter records for Table display
  const displayedRecords = attendanceRecords.filter((r) => {
    const matchesSearch =
      r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.className && r.className.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesType = targetTypeFilter === "all" || r.targetType === targetTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E17EB] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Modul Presensi Kehadiran
          </span>
          <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
            Presensi QR Code & Rekap Kehadiran
          </h2>
          <p className="text-xs text-neutral-500">
            Pindai QR Code via kamera (Depan/Belakang) atau input presensi manual secara instan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold transition shadow-md shadow-purple-500/20"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR (Dual-Cam)</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Presensi Manual</span>
          </button>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5E17EB] border border-purple-200 text-xs font-bold transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor PDF Multi-Filter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards / Statistical Highlight */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Hadir Tepat Waktu
          </span>
          <p className="text-2xl font-black text-emerald-700">
            {attendanceStats?.statusCounts?.hadir || 0}
          </p>
          <p className="text-[10px] text-neutral-400">Total kehadiran tercatat</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Izin Terkonfirmasi
          </span>
          <p className="text-2xl font-black text-blue-700">
            {attendanceStats?.statusCounts?.izin || 0}
          </p>
          <p className="text-[10px] text-neutral-400">Berhalangan dengan izin</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Sakit (Keterangan)
          </span>
          <p className="text-2xl font-black text-amber-700">
            {attendanceStats?.statusCounts?.sakit || 0}
          </p>
          <p className="text-[10px] text-neutral-400">Istirahat pemulihan</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
            Alpha (Tanpa Kabar)
          </span>
          <p className="text-2xl font-black text-red-700">
            {attendanceStats?.statusCounts?.alpha || 0}
          </p>
          <p className="text-[10px] text-neutral-400">Tidak hadir tanpa izin</p>
        </div>
      </div>

      {/* Sub Tabs: Riwayat Presensi vs Diagram Statistik vs Kartu Pelatih */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("records")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === "records"
              ? "bg-[#5E17EB] text-white shadow-sm"
              : "text-neutral-600 hover:text-black hover:bg-neutral-50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Riwayat Presensi ({attendanceRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("charts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === "charts"
              ? "bg-[#5E17EB] text-white shadow-sm"
              : "text-neutral-600 hover:text-black hover:bg-neutral-50"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Statistik & Visualisasi Batang</span>
        </button>

        <button
          onClick={() => setActiveSubTab("coaches")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === "coaches"
              ? "bg-[#5E17EB] text-white shadow-sm"
              : "text-neutral-600 hover:text-black hover:bg-neutral-50"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Kartu & QR Pelatih ({coachesList.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: TABEL RIWAYAT PRESENSI */}
      {activeSubTab === "records" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, ID VOCA, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpha">Alpha</option>
              </select>

              <select
                value={targetTypeFilter}
                onChange={(e) => setTargetTypeFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="all">Semua Tipe</option>
                <option value="member">Anggota Saja</option>
                <option value="coach">Pelatih Saja</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nama & Identitas</th>
                  <th className="px-4 py-3.5">Kelas / Kategori</th>
                  <th className="px-4 py-3.5 text-center">Waktu Presensi</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5">Metode / Pencatat</th>
                  <th className="px-4 py-3.5">Keterangan</th>
                  {currentRole !== "coach" && <th className="px-4 py-3.5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {displayedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-neutral-400">
                      Belum ada data presensi yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  displayedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-neutral-900">{r.targetName}</div>
                        <div className="font-mono text-[10px] text-[#5E17EB] flex items-center gap-1.5">
                          <span>{r.targetId}</span>
                          <span className="uppercase text-[9px] px-1.5 py-0.2 bg-purple-50 rounded text-purple-700">
                            {r.targetType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-neutral-800">{r.className || "-"}</div>
                        <div className="text-[10px] text-neutral-500">{r.ageCategory || "-"}</div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="font-medium text-neutral-800">
                          {r.attendanceDate
                            ? new Date(r.attendanceDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })
                            : "-"}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {r.checkInTime
                            ? new Date(r.checkInTime).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            r.status === "hadir"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "izin"
                              ? "bg-blue-100 text-blue-800"
                              : r.status === "sakit"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-neutral-700">
                          {r.scanMethod === "qr_code" ? "QR Code" : "Manual"}
                        </span>
                        <div className="text-[10px] text-neutral-400">oleh @{r.recordedBy}</div>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 max-w-xs truncate">
                        {r.notes || "-"}
                      </td>
                      {currentRole !== "coach" && (
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteAttendance(r.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Log Presensi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: VISUALISASI STATISTIK BATANG (BAR CHARTS) */}
      {activeSubTab === "charts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Rekapitulasi Tingkat Status Kehadiran */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#5E17EB]" />
                <span>Statistik Distribusi Status Presensi</span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Visualisasi perbandingan total kehadiran siswa dan staf
              </p>
            </div>

            {(() => {
              const total = attendanceRecords.length || 1;
              const hadir = attendanceStats?.statusCounts?.hadir || 0;
              const izin = attendanceStats?.statusCounts?.izin || 0;
              const sakit = attendanceStats?.statusCounts?.sakit || 0;
              const alpha = attendanceStats?.statusCounts?.alpha || 0;

              return (
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-emerald-700">Hadir: {hadir}</span>
                      <span className="text-neutral-500 font-mono">{Math.round((hadir / total) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(hadir / total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-blue-700">Izin: {izin}</span>
                      <span className="text-neutral-500 font-mono">{Math.round((izin / total) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(izin / total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-amber-700">Sakit: {sakit}</span>
                      <span className="text-neutral-500 font-mono">{Math.round((sakit / total) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${(sakit / total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-red-700">Alpha: {alpha}</span>
                      <span className="text-neutral-500 font-mono">{Math.round((alpha / total) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${(alpha / total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Chart 2: Kehadiran Anggota vs Pelatih */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#21649D]" />
                <span>Statistik Kehadiran Pelatih & Honor Sesi</span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Pencatatan sesi kehadiran pelatih untuk transparansi honorarium
              </p>
            </div>

            {(() => {
              const coachHadir = attendanceStats?.coachAttendanceCount || 0;
              const memberHadir = attendanceStats?.memberAttendanceCount || 0;
              const totalHadir = (coachHadir + memberHadir) || 1;

              return (
                <div className="space-y-4 pt-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#5E17EB]">Sesi Pelatih (Coach): {coachHadir} Sesi</span>
                      <span className="font-mono text-neutral-500">{Math.round((coachHadir / totalHadir) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5E17EB] rounded-full transition-all duration-500"
                        style={{ width: `${(coachHadir / totalHadir) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#21649D]">Sesi Siswa (Member): {memberHadir} Sesi</span>
                      <span className="font-mono text-neutral-500">{Math.round((memberHadir / totalHadir) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#21649D] rounded-full transition-all duration-500"
                        style={{ width: `${(memberHadir / totalHadir) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-[11px] text-neutral-600 mt-4 leading-relaxed">
                    💡 Pelatih mencatatkan presensi menggunakan QR Code khusus kartu pelatih di bawah untuk keperluan kalkulasi honor mengajar.
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SUBTAB 3: KARTU & QR CODE KHUSUS PELATIH (COACH) */}
      {activeSubTab === "coaches" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">
                Kartu QR Code Resmi Pelatih VOCA
              </h3>
              <p className="text-xs text-neutral-500">
                Pindai QR Pelatih saat memimpin sesi renang untuk mencatat kehadiran dan rekap honor mengajar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coachesList.map((coach) => {
              const code = coach.coachCode || `COACH-${coach.id}`;
              const qrUrl = coachQrs[code];

              return (
                <div
                  key={coach.id}
                  className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-4 text-center hover:border-purple-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      Official Coach
                    </span>
                    <span className="text-xs font-mono font-bold text-[#5E17EB]">{code}</span>
                  </div>

                  <div className="w-40 h-40 mx-auto bg-neutral-50 p-2 rounded-2xl border border-dashed border-[#5E17EB]/40 flex items-center justify-center shadow-inner">
                    {qrUrl ? (
                      <img src={qrUrl} alt={coach.fullName} className="w-full h-full object-contain" />
                    ) : (
                      <RefreshCw className="w-6 h-6 animate-spin text-[#5E17EB]" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-sm">{coach.fullName}</h4>
                    <p className="text-[11px] text-neutral-500">{coach.specialty || "Pelatih Renang"}</p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">@{coach.username}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL SCANNER KAMERA ================= */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanResult}
        title="Scan QR Code Presensi (Dual-Cam)"
        activeMembers={membersList}
        activeCoaches={coachesList}
      />

      {/* ================= MODAL PRESENSI MANUAL ================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-extrabold text-neutral-900 text-sm">Input Presensi Manual</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Tipe Peserta</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualForm({ ...manualForm, targetType: "member", targetId: "", targetName: "" });
                    }}
                    className={`py-2 rounded-xl font-bold border transition ${
                      manualForm.targetType === "member"
                        ? "border-[#5E17EB] bg-[#5E17EB]/5 text-[#5E17EB]"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    Anggota / Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualForm({ ...manualForm, targetType: "coach", targetId: "", targetName: "" });
                    }}
                    className={`py-2 rounded-xl font-bold border transition ${
                      manualForm.targetType === "coach"
                        ? "border-[#21649D] bg-[#21649D]/5 text-[#21649D]"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    Pelatih / Coach
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Pilih {manualForm.targetType === "member" ? "Siswa Atlet" : "Pelatih"}
                </label>
                <select
                  required
                  value={manualForm.targetId}
                  onChange={(e) => {
                    const idVal = e.target.value;
                    if (manualForm.targetType === "member") {
                      const m = membersList.find((mem) => mem.memberId === idVal);
                      setManualForm({
                        ...manualForm,
                        targetId: idVal,
                        targetName: m?.fullName || idVal,
                        ageCategory: m?.ageCategory || "Anak-anak",
                      });
                    } else {
                      const c = coachesList.find((coa) => (coa.coachCode || `COACH-${coa.id}`) === idVal);
                      setManualForm({
                        ...manualForm,
                        targetId: idVal,
                        targetName: c?.fullName || idVal,
                        ageCategory: c?.specialty || "Pelatih",
                      });
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                >
                  <option value="">-- Pilih Nama --</option>
                  {manualForm.targetType === "member"
                    ? membersList.map((m) => (
                        <option key={m.memberId} value={m.memberId}>
                          {m.fullName} ({m.memberId}) • {m.ageCategory}
                        </option>
                      ))
                    : coachesList.map((c) => {
                        const code = c.coachCode || `COACH-${c.id}`;
                        return (
                          <option key={code} value={code}>
                            {c.fullName} ({code}) • {c.specialty || "Pelatih"}
                          </option>
                        );
                      })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Status Kehadiran</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "hadir", label: "Hadir", color: "emerald" },
                    { id: "izin", label: "Izin", color: "blue" },
                    { id: "sakit", label: "Sakit", color: "amber" },
                    { id: "alpha", label: "Alpha", color: "red" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, status: st.id as any })}
                      className={`py-2 text-xs font-bold rounded-xl border transition uppercase ${
                        manualForm.status === st.id
                          ? st.id === "hadir"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : st.id === "izin"
                            ? "bg-blue-600 text-white border-blue-600"
                            : st.id === "sakit"
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-red-600 text-white border-red-600"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Catatan / Alasan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Sakit demam ada surat dokter / Izin kegiatan sekolah..."
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5E17EB] hover:bg-[#4d10c7] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EKSPOR PDF MULTI-FILTER ================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#5E17EB]" />
                <span>Pengaturan Ekspor PDF Presensi</span>
              </h3>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Rentang Waktu */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Rentang Laporan</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl mb-3">
                  {[
                    { id: "daily", label: "Harian" },
                    { id: "monthly", label: "Bulanan" },
                    { id: "semester", label: "Semester" },
                    { id: "yearly", label: "Tahunan" },
                    { id: "all", label: "Semua" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setPdfRangeType(r.id as any)}
                      className={`py-1.5 text-center font-bold rounded-lg transition ${
                        pdfRangeType === r.id
                          ? "bg-white text-[#5E17EB] shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {pdfRangeType === "daily" && (
                  <div>
                    <label className="block text-neutral-500 mb-1">Pilih Tanggal Latihan</label>
                    <input
                      type="date"
                      value={pdfDailyDate}
                      onChange={(e) => setPdfDailyDate(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                    />
                  </div>
                )}

                {pdfRangeType === "monthly" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-500 mb-1">Bulan</label>
                      <select
                        value={pdfMonth}
                        onChange={(e) => setPdfMonth(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                      >
                        <option value="01">Januari</option>
                        <option value="02">Februari</option>
                        <option value="03">Maret</option>
                        <option value="04">April</option>
                        <option value="05">Mei</option>
                        <option value="06">Juni</option>
                        <option value="07">Juli</option>
                        <option value="08">Agustus</option>
                        <option value="09">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-500 mb-1">Tahun</label>
                      <select
                        value={pdfYear}
                        onChange={(e) => setPdfYear(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                      >
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                  </div>
                )}

                {pdfRangeType === "semester" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-500 mb-1">Semester</label>
                      <select
                        value={pdfSemester}
                        onChange={(e) => setPdfSemester(e.target.value as any)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                      >
                        <option value="1">Semester 1 (Jan - Jun)</option>
                        <option value="2">Semester 2 (Jul - Des)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-500 mb-1">Tahun</label>
                      <select
                        value={pdfYear}
                        onChange={(e) => setPdfYear(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                      >
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Klasifikasi */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Filter Klasifikasi Peserta</label>
                <select
                  value={pdfClassification}
                  onChange={(e) => setPdfClassification(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                >
                  <option value="all">Semua Klasifikasi Sekaligus (Master Rekap)</option>
                  <option value="balita">Hanya Balita (1 - 4 Tahun)</option>
                  <option value="balita_anak">Rentang Balita s/d Anak-anak (1 - 12 Tahun)</option>
                  <option value="remaja_casis">Rentang Remaja s/d Casis TNI/Polri (13 - 22+ Tahun)</option>
                  <option value="coach">Khusus Presensi Pelatih (Rekap Sesi & Honor)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="px-5 py-2 bg-[#5E17EB] hover:bg-[#4d10c7] text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Langsung</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
