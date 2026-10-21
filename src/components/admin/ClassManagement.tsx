"use client";

import React, { useState } from "react";
import {
  Calendar,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  UserCheck,
  Search,
  Filter,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

interface TrainingClass {
  id: number;
  className: string;
  classType: "reguler" | "private_premium";
  ageGroup: string;
  sportBranch: string;
  coachId?: number | null;
  coachName: string;
  days: string;
  sessionTime: string;
  venue: string;
  maxCapacity: number;
  notes?: string | null;
  status: string;
  studentCount: number;
  roster: Array<{
    id: number;
    classId: number;
    memberId: string;
    memberName: string;
    ageCategory: string;
    participantAge?: number | null;
    joinedAt: string;
  }>;
}

interface ClassManagementProps {
  trainingClassesList: TrainingClass[];
  membersList: Array<{
    id: number;
    memberId: string;
    fullName: string;
    participantAge: number | null;
    ageCategory: string;
    programType: string;
  }>;
  systemUsersList: Array<{
    id: number;
    username: string;
    fullName: string;
    role: string;
    specialty?: string | null;
  }>;
  currentRole: "admin" | "staff" | "coach";
  onRefresh: () => Promise<void>;
  showToast: (type: "success" | "error" | "info" | "warning", title: string, message: string) => void;
}

export function ClassManagement({
  trainingClassesList,
  membersList,
  systemUsersList,
  currentRole,
  onRefresh,
  showToast,
}: ClassManagementProps) {
  const [classTypeFilter, setClassTypeFilter] = useState<"all" | "reguler" | "private_premium">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Edit Class Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [classForm, setClassForm] = useState({
    className: "",
    classType: "reguler" as "reguler" | "private_premium",
    ageGroup: "Anak-anak",
    sportBranch: "Renang & Akuatik",
    coachId: "",
    coachName: "",
    days: "Senin, Kamis",
    sessionTime: "Sesi 2 (15:30 - 17:00 WIB)",
    venue: "Kolam Renang VOCA Center",
    maxCapacity: 12,
    notes: "",
  });
  const [isSavingClass, setIsSavingClass] = useState(false);

  // Add Student to Class Modal
  const [targetClassForStudent, setTargetClassForStudent] = useState<TrainingClass | null>(null);
  const [selectedStudentMemberId, setSelectedStudentMemberId] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Anti-Duplicate Warning Modal
  const [duplicateConflictData, setDuplicateConflictData] = useState<{
    targetClassId: number;
    targetClassName: string;
    memberId: string;
    memberName: string;
    currentClassName: string;
    errorMessage: string;
  } | null>(null);

  // Auto-Generate Loading State
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const coaches = systemUsersList.filter((u) => u.role === "coach");

  const openCreateClassModal = () => {
    setEditingClassId(null);
    setClassForm({
      className: "",
      classType: "reguler",
      ageGroup: "Anak-anak",
      sportBranch: "Renang & Akuatik",
      coachId: coaches[0]?.id ? String(coaches[0].id) : "",
      coachName: coaches[0]?.fullName || "Coach VOCA",
      days: "Senin, Kamis",
      sessionTime: "Sesi 2 (15:30 - 17:00 WIB)",
      venue: "Kolam Renang VOCA Center",
      maxCapacity: 12,
      notes: "",
    });
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (cls: TrainingClass) => {
    setEditingClassId(cls.id);
    setClassForm({
      className: cls.className,
      classType: cls.classType,
      ageGroup: cls.ageGroup,
      sportBranch: cls.sportBranch,
      coachId: cls.coachId ? String(cls.coachId) : "",
      coachName: cls.coachName,
      days: cls.days,
      sessionTime: cls.sessionTime,
      venue: cls.venue,
      maxCapacity: cls.maxCapacity,
      notes: cls.notes || "",
    });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.className.trim()) {
      showToast("error", "Form Belum Lengkap", "Nama kelas wajib diisi.");
      return;
    }

    setIsSavingClass(true);
    try {
      const isEdit = Boolean(editingClassId);
      const url = "/api/admin/classes";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit ? { ...classForm, id: editingClassId } : classForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", isEdit ? "Kelas Diperbarui" : "Kelas Ditambahkan", data.message);
        setIsClassModalOpen(false);
        await onRefresh();
      } else {
        showToast("error", "Gagal Menyimpan", data.error || "Gagal memproses kelas.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    } finally {
      setIsSavingClass(false);
    }
  };

  const handleDeleteClass = async (id: number, className: string) => {
    if (!confirm(`Hapus kelas '${className}' beserta seluruh daftar muridnya?`)) return;
    try {
      const res = await fetch(`/api/admin/classes?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Kelas Dihapus", `Kelas '${className}' berhasil dihapus.`);
        await onRefresh();
      } else {
        showToast("error", "Gagal Menghapus", data.error);
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    }
  };

  // Add student to class with anti-duplicate guard
  const handleAddStudentToClass = async (forceTransfer = false) => {
    if (!targetClassForStudent || !selectedStudentMemberId) return;

    setIsAddingStudent(true);
    try {
      const res = await fetch("/api/admin/classes/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: targetClassForStudent.id,
          memberId: selectedStudentMemberId,
          forceTransfer,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicateDetected) {
        // Tampilkan modal konfirmasi Anti-Duplicate
        setDuplicateConflictData({
          targetClassId: targetClassForStudent.id,
          targetClassName: targetClassForStudent.className,
          memberId: data.memberId,
          memberName: data.memberName,
          currentClassName: data.currentClassName,
          errorMessage: data.error,
        });
        return;
      }

      if (data.success) {
        showToast("success", "Siswa Ditambahkan", data.message);
        setTargetClassForStudent(null);
        setSelectedStudentMemberId("");
        setDuplicateConflictData(null);
        await onRefresh();
      } else {
        showToast("error", "Gagal Menambahkan", data.error || "Gagal mendaftarkan siswa ke kelas.");
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Remove student from roster
  const handleRemoveStudent = async (rosterId: number, studentName: string) => {
    if (!confirm(`Keluarkan ${studentName} dari kelas ini?`)) return;
    try {
      const res = await fetch(`/api/admin/classes/roster?id=${rosterId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Siswa Dikeluarkan", `${studentName} berhasil dikeluarkan dari kelas.`);
        await onRefresh();
      } else {
        showToast("error", "Gagal Mengeluarkan", data.error);
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    }
  };

  // Smart Auto-Generate Roster
  const handleAutoGenerateRoster = async () => {
    if (!confirm("Jalankan fitur Smart Auto-Generate Roster?\nSistem akan mendistribusikan siswa yang belum memiliki kelas secara otomatis berdasarkan usia tanpa duplikasi.")) return;

    setIsAutoGenerating(true);
    try {
      const res = await fetch("/api/admin/classes/auto-generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Auto-Generate Selesai", data.message);
        await onRefresh();
      } else {
        showToast("error", "Gagal Auto-Generate", data.error || data.message);
      }
    } catch (err: any) {
      showToast("error", "Kesalahan Server", err.message);
    } finally {
      setIsAutoGenerating(false);
    }
  };

  // Filtered classes list
  const filteredClasses = trainingClassesList.filter((cls) => {
    const matchesType = classTypeFilter === "all" || cls.classType === classTypeFilter;
    const matchesSearch =
      cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.ageGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.days.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalAssignedStudents = trainingClassesList.reduce((acc, c) => acc + (c.studentCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E17EB] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Modul Manajemen Roster & Sesi
          </span>
          <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
            Atur Kelas & Penjadwalan Siswa
          </h2>
          <p className="text-xs text-neutral-500">
            Atur pembagian kelas renang/atletik berdasarkan klasifikasi usia, pelatih, hari, dan sesi latihan.
          </p>
        </div>

        {currentRole === "coach" && (
          <div className="w-full bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs">
            <span className="p-1 rounded-md bg-blue-100 text-blue-700 font-bold uppercase tracking-wider text-[10px]">READ ONLY</span>
            <span>
              <strong>Mode Akses Pelatih:</strong> Anda dapat meninjau jadwal kelas, hari latihan, lokasi, dan daftar siswa yang terdaftar. Penambahan atau mutasi kelas dikelola oleh Staf & Admin.
            </span>
          </div>
        )}

        {currentRole !== "coach" && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openCreateClassModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5E17EB] hover:bg-[#4d10c7] text-white text-xs font-bold transition shadow-md shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas Baru</span>
            </button>

            <button
              onClick={handleAutoGenerateRoster}
              disabled={isAutoGenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5E17EB] border border-purple-200 text-xs font-bold transition disabled:opacity-50"
            >
              {isAutoGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#5E17EB]" />
              )}
              <span>Auto-Generate Berdasarkan Usia</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E17EB] block">
            Total Kelas Aktif
          </span>
          <p className="text-2xl font-black text-neutral-900">{trainingClassesList.length}</p>
          <p className="text-[10px] text-neutral-400">Reguler & Private Premium</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Siswa Terdaftar di Roster
          </span>
          <p className="text-2xl font-black text-emerald-700">{totalAssignedStudents}</p>
          <p className="text-[10px] text-neutral-400">Dari total {membersList.length} anggota aktif</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Kelas Reguler
          </span>
          <p className="text-2xl font-black text-blue-700">
            {trainingClassesList.filter((c) => c.classType === "reguler").length}
          </p>
          <p className="text-[10px] text-neutral-400">Pembagian kelompok usia rutin</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
            Private Premium
          </span>
          <p className="text-2xl font-black text-purple-700">
            {trainingClassesList.filter((c) => c.classType === "private_premium").length}
          </p>
          <p className="text-[10px] text-neutral-400">Jadwal & pelatih khusus</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kelas, pelatih, hari, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setClassTypeFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              classTypeFilter === "all"
                ? "bg-[#5E17EB] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Semua Kelas ({trainingClassesList.length})
          </button>
          <button
            onClick={() => setClassTypeFilter("reguler")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              classTypeFilter === "reguler"
                ? "bg-[#5E17EB] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Reguler ({trainingClassesList.filter((c) => c.classType === "reguler").length})
          </button>
          <button
            onClick={() => setClassTypeFilter("private_premium")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              classTypeFilter === "private_premium"
                ? "bg-[#5E17EB] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Private Premium ({trainingClassesList.filter((c) => c.classType === "private_premium").length})
          </button>
        </div>
      </div>

      {/* Grid Kelas Latihan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-neutral-200 text-center text-neutral-400 text-xs">
            Belum ada kelas yang sesuai dengan filter. Silakan tambahkan kelas baru atau gunakan tombol Auto-Generate.
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const capacityRatio = Math.round(((cls.studentCount || 0) / cls.maxCapacity) * 100);
            const isFull = (cls.studentCount || 0) >= cls.maxCapacity;

            return (
              <div
                key={cls.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-4 hover:border-purple-200 transition"
              >
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-neutral-900 text-base">{cls.className}</h3>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          cls.classType === "private_premium"
                            ? "bg-purple-100 text-[#5E17EB]"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {cls.classType === "private_premium" ? "Private Premium" : "Reguler"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Kelompok Usia: <strong>{cls.ageGroup}</strong> • Cabang: <strong>{cls.sportBranch}</strong>
                    </p>
                  </div>

                  {currentRole !== "coach" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditClassModal(cls)}
                        className="p-1.5 text-neutral-400 hover:text-[#5E17EB] hover:bg-neutral-100 rounded-lg transition"
                        title="Edit Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.className)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Sesi & Pelatih */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50/70 p-3.5 rounded-2xl">
                  <div>
                    <p className="text-neutral-400 font-semibold mb-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#5E17EB]" />
                      <span>Pelatih</span>
                    </p>
                    <p className="font-bold text-neutral-800">{cls.coachName}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400 font-semibold mb-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#5E17EB]" />
                      <span>Hari Latihan</span>
                    </p>
                    <p className="font-bold text-neutral-800">{cls.days}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400 font-semibold mb-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#5E17EB]" />
                      <span>Jam & Sesi</span>
                    </p>
                    <p className="font-bold text-neutral-800">{cls.sessionTime}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400 font-semibold mb-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5E17EB]" />
                      <span>Venue</span>
                    </p>
                    <p className="font-bold text-neutral-800 truncate">{cls.venue}</p>
                  </div>
                </div>

                {/* Progress Kuota */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-neutral-700">Kapasitas Kelas</span>
                    <span className="font-mono text-neutral-500 text-[11px]">
                      {cls.studentCount || 0} / {cls.maxCapacity} Siswa ({capacityRatio}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? "bg-red-500" : capacityRatio > 75 ? "bg-amber-500" : "bg-[#5E17EB]"
                      }`}
                      style={{ width: `${Math.min(capacityRatio, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Daftar Siswa Terdaftar (Roster) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-800">
                      Roster Siswa ({cls.roster?.length || 0})
                    </p>
                    {currentRole !== "coach" && !isFull && (
                      <button
                        onClick={() => {
                          setTargetClassForStudent(cls);
                          setSelectedStudentMemberId("");
                        }}
                        className="text-[11px] font-bold text-[#5E17EB] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Siswa</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-neutral-50/40">
                    {!cls.roster || cls.roster.length === 0 ? (
                      <p className="p-3 text-center text-[11px] text-neutral-400">
                        Belum ada siswa terdaftar di kelas ini.
                      </p>
                    ) : (
                      cls.roster.map((student) => (
                        <div
                          key={student.id}
                          className="p-2.5 flex items-center justify-between text-xs hover:bg-white transition"
                        >
                          <div>
                            <p className="font-bold text-neutral-900">{student.memberName}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">
                              {student.memberId} • {student.ageCategory}
                              {student.participantAge ? ` (${student.participantAge} Thn)` : ""}
                            </p>
                          </div>
                          {currentRole !== "coach" && (
                            <button
                              onClick={() => handleRemoveStudent(student.id, student.memberName)}
                              className="text-neutral-400 hover:text-red-600 p-1 rounded transition"
                              title="Keluarkan dari kelas"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL TAMBAH / EDIT KELAS ================= */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-extrabold text-neutral-900 text-sm">
                {editingClassId ? "Edit Kelas Latihan" : "Tambah Kelas Latihan Baru"}
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Nama Kelas (Input Bebas / Custom)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VOCA Child 1, VOCA Teen 3, VOCA Casis Akmil A"
                  value={classForm.className}
                  onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Tipe Program</label>
                  <select
                    value={classForm.classType}
                    onChange={(e) => setClassForm({ ...classForm, classType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="reguler">Reguler Member</option>
                    <option value="private_premium">Private Premium Class</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Klasifikasi Usia</label>
                  <select
                    value={classForm.ageGroup}
                    onChange={(e) => setClassForm({ ...classForm, ageGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Balita (1 - 4 Tahun)">Balita (1 - 4 Tahun)</option>
                    <option value="Anak-anak (5 - 12 Tahun)">Anak-anak (5 - 12 Tahun)</option>
                    <option value="Remaja (13 - 17 Tahun)">Remaja (13 - 17 Tahun)</option>
                    <option value="Dewasa (18+ Tahun)">Dewasa (18+ Tahun)</option>
                    <option value="Casis TNI/Polri">Casis TNI/Polri</option>
                    <option value="Terapi & Khusus">Terapi & Khusus</option>
                    <option value="Semua Usia">Semua Usia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Pelatih Pembimbing</label>
                  <select
                    value={classForm.coachName}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const c = coaches.find((coa) => coa.fullName === selectedName);
                      setClassForm({
                        ...classForm,
                        coachName: selectedName,
                        coachId: c?.id ? String(c.id) : "",
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="">-- Pilih Pelatih --</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.fullName}>
                        {c.fullName} • {c.specialty || "Coach"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={classForm.maxCapacity}
                    onChange={(e) => setClassForm({ ...classForm, maxCapacity: parseInt(e.target.value, 10) || 12 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Hari Latihan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Senin, Kamis atau Selasa, Jumat"
                    value={classForm.days}
                    onChange={(e) => setClassForm({ ...classForm, days: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Jam & Sesi Latihan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sesi 2 (15:30 - 17:00 WIB)"
                    value={classForm.sessionTime}
                    onChange={(e) => setClassForm({ ...classForm, sessionTime: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Lokasi Venue</label>
                <input
                  type="text"
                  required
                  value={classForm.venue}
                  onChange={(e) => setClassForm({ ...classForm, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingClass}
                  className="px-5 py-2 bg-[#5E17EB] hover:bg-[#4d10c7] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {isSavingClass && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingClassId ? "Simpan Perubahan" : "Terbitkan Kelas"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH SISWA KE KELAS ================= */}
      {targetClassForStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="font-extrabold text-neutral-900 text-sm">
                  Daftarkan Siswa ke {targetClassForStudent.className}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Pilih siswa aktif untuk dimasukkan ke dalam daftar roster kelas ini.
                </p>
              </div>
              <button
                onClick={() => setTargetClassForStudent(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Pilih Siswa Atlet</label>
                <select
                  value={selectedStudentMemberId}
                  onChange={(e) => setSelectedStudentMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {membersList.map((m) => (
                    <option key={m.memberId} value={m.memberId}>
                      {m.fullName} ({m.memberId}) • {m.ageCategory} ({m.participantAge ? `${m.participantAge} Thn` : ""})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl text-[11px] text-purple-900 leading-relaxed border border-purple-100">
                🛡️ <strong>Anti-Duplicate Guard:</strong> Siswa hanya boleh terdaftar pada satu kelas reguler. Jika siswa sudah terdaftar di kelas lain, sistem akan memvalidasi konfirmasi pemindahan jadwal.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setTargetClassForStudent(null)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!selectedStudentMemberId || isAddingStudent}
                  onClick={() => handleAddStudentToClass(false)}
                  className="px-5 py-2 bg-[#5E17EB] hover:bg-[#4d10c7] text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isAddingStudent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Masukkan ke Kelas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ANTI-DUPLICATE WARNING & TRANSFER ================= */}
      {duplicateConflictData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-neutral-900 text-sm">Peringatan Duplikasi Kelas</h3>
                <p className="text-[11px] text-neutral-500">Anti-Duplicate Class Policy</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2">
              <p>
                Siswa <strong>{duplicateConflictData.memberName}</strong> ({duplicateConflictData.memberId}) saat ini sudah terdaftar aktif di kelas:
              </p>
              <p className="p-2 bg-white rounded-xl font-bold font-mono text-center text-amber-950 border border-amber-300">
                {duplicateConflictData.currentClassName}
              </p>
              <p>
                Sesuai aturan sistem VOCA, siswa <strong>tidak boleh terdaftar ganda di dua kelas</strong>. Apakah Anda ingin memindahkan siswa ini ke kelas <strong>{duplicateConflictData.targetClassName}</strong>?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 text-xs">
              <button
                type="button"
                onClick={() => setDuplicateConflictData(null)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 font-bold rounded-xl"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={() => handleAddStudentToClass(true)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <span>Pindahkan Siswa (Ganti Jadwal)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
