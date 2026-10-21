"use client";

import React, { useState } from "react";
import { KeyRound, X, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

interface ResetCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  membersList: Array<{ id: number; memberId: string; fullName: string; username?: string | null }>;
  systemUsersList: Array<{ id: number; username: string; fullName: string; role: string }>;
  showToast: (type: "success" | "error" | "info" | "warning", title: string, message: string) => void;
  onSuccess?: () => void;
}

export function ResetCredentialsModal({
  isOpen,
  onClose,
  membersList,
  systemUsersList,
  showToast,
  onSuccess,
}: ResetCredentialsModalProps) {
  const [targetType, setTargetType] = useState<"member" | "system">("member");
  const [selectedId, setSelectedId] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setErrorMessage("Silakan pilih pengguna terlebih dahulu.");
      return;
    }
    if (!newUsername.trim() && !newPassword.trim()) {
      setErrorMessage("Minimal isi salah satu antara Username baru atau Password baru.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/users/reset-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId: selectedId,
          newUsername: newUsername.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses reset kredensial.");
      }

      showToast("success", "Kredensial Direset", data.message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan pada server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-neutral-900">
              Reset Kredensial Multi-Role
            </h3>
            <p className="text-xs text-neutral-500">
              Otoritas khusus Administrator untuk reset akun yang lupa password
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Tingkat Pengguna</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTargetType("member");
                  setSelectedId("");
                }}
                className={`py-2 rounded-xl font-bold border transition ${
                  targetType === "member"
                    ? "border-[#5E17EB] bg-[#5E17EB]/5 text-[#5E17EB]"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                Anggota / Member ({membersList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetType("system");
                  setSelectedId("");
                }}
                className={`py-2 rounded-xl font-bold border transition ${
                  targetType === "system"
                    ? "border-[#21649D] bg-[#21649D]/5 text-[#21649D]"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                Staf / Pelatih ({systemUsersList.length})
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Pilih {targetType === "member" ? "Nama Anggota" : "Nama Staf / Pelatih"}
            </label>
            <select
              required
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                // Pre-fill username
                if (targetType === "member") {
                  const m = membersList.find((mem) => String(mem.id) === e.target.value);
                  setNewUsername(m?.username || "");
                } else {
                  const u = systemUsersList.find((usr) => String(usr.id) === e.target.value);
                  setNewUsername(u?.username || "");
                }
              }}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
            >
              <option value="">-- Pilih Akun --</option>
              {targetType === "member"
                ? membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberId}) • @{m.username || "no-username"}
                    </option>
                  ))
                : systemUsersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (@{u.username}) • {u.role.toUpperCase()}
                    </option>
                  ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Username Baru</label>
              <input
                type="text"
                placeholder="Biarkan jika tidak diubah"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Password Baru</label>
              <input
                type="text"
                placeholder="Masukkan kata sandi baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 font-bold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedId}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Kredensial Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
