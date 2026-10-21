"use client";

import React, { useState } from "react";
import { User, X, Loader2, AlertCircle, KeyRound } from "lucide-react";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    fullName: string;
    role: string;
    coachCode?: string | null;
  } | null;
  showToast: (type: "success" | "error" | "info" | "warning", title: string, message: string) => void;
  onSuccess?: () => void;
}

function AdminProfileModalContent({
  onClose,
  currentUser,
  showToast,
  onSuccess,
}: Omit<AdminProfileModalProps, "isOpen">) {
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil.");
      }

      showToast("success", "Profil Diperbarui", data.message || "Profil dan password Anda berhasil diperbarui.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan.");
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
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5E17EB] flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-neutral-900">
              Profil Saya & Ubah Password
            </h3>
            <p className="text-xs text-neutral-500">
              Peran: <strong className="uppercase text-[#5E17EB]">{currentUser?.role || "ADMIN"}</strong>
              {currentUser?.coachCode ? ` • Kode: ${currentUser.coachCode}` : ""}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">No. WhatsApp</label>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <p className="font-bold text-neutral-800 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#5E17EB]" />
              <span>Ganti Kata Sandi (Opsional)</span>
            </p>
            <div className="space-y-2">
              <div>
                <label className="block text-neutral-500 mb-0.5">Password Lama</label>
                <input
                  type="password"
                  placeholder="Diperlukan jika ingin ganti password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 mb-0.5">Password Baru</label>
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-0.5">Ulangi Password</label>
                  <input
                    type="password"
                    placeholder="Konfirmasi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                  />
                </div>
              </div>
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#5E17EB] hover:bg-[#4d10c7] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminProfileModal({
  isOpen,
  onClose,
  currentUser,
  showToast,
  onSuccess,
}: AdminProfileModalProps) {
  if (!isOpen) return null;

  return (
    <AdminProfileModalContent
      key={currentUser?.username || "profile"}
      onClose={onClose}
      currentUser={currentUser}
      showToast={showToast}
      onSuccess={onSuccess}
    />
  );
}
