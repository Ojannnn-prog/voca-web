"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { VocaLogo } from "@/components/common/VocaLogo";
import { Shield, User, Lock, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "member" ? "member" : "admin";
  const redirectParam = searchParams.get("redirect");

  const [role, setRole] = useState<"admin" | "member">(defaultRole);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleQuickFillAdmin = () => {
    setUsername("adminvoca");
    setPassword("admin123");
  };

  const handleQuickFillMember = () => {
    setUsername("VOCA-2026-001");
    setPassword("member123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan login.");
      }

      // Redirect ke target atau default sesuai peran
      const targetUrl = redirectParam || data.redirect || (role === "admin" ? "/admin" : "/member");
      router.push(targetUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1D2B] via-[#16232E] to-[#21649D] flex items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#5E17EB]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-[#21649D]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white/95 text-neutral-900 rounded-[32px] p-7 sm:p-9 shadow-2xl backdrop-blur-xl border border-white/20">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Utama</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <VocaLogo variant="full" size="md" />
          </div>
          <p className="text-xs text-neutral-500">
            Sistem Autentikasi Terpadu Vortex Community of Athletics
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setErrorMessage("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition ${
              role === "admin"
                ? "bg-white text-[#5E17EB] shadow-md shadow-purple-500/10"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Pengurus / Admin</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("member");
              setErrorMessage("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition ${
              role === "member"
                ? "bg-white text-[#21649D] shadow-md shadow-blue-500/10"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Anggota / Member</span>
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              {role === "admin" ? "Username Admin" : "Nomor Anggota (NIA) / Email"}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === "admin" ? "adminvoca" : "VOCA-2026-089"}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB] transition"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/40 focus:border-[#5E17EB] transition"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="pt-1 flex items-center justify-between text-[11px]">
            {role === "admin" ? (
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="text-[#5E17EB] hover:underline font-semibold"
              >
                Isi Otomatis Kredensial Admin
              </button>
            ) : (
              <button
                type="button"
                onClick={handleQuickFillMember}
                className="text-[#21649D] hover:underline font-semibold"
              >
                Isi Otomatis Akun Member Demo
              </button>
            )}
            <span className="text-neutral-400">VOCA v1.0</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-full font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 ${
              role === "admin"
                ? "bg-[#5E17EB] hover:bg-[#4b11bd] shadow-purple-500/25"
                : "bg-[#21649D] hover:bg-[#1b5383] shadow-blue-500/25"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke {role === "admin" ? "Panel Admin" : "Portal Member"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-neutral-100 text-center text-xs text-neutral-500">
          <p>
            Belum mendaftar sebagai anggota?{" "}
            <Link href="/#pendaftaran" className="text-[#5E17EB] font-bold hover:underline">
              Daftar Trial Class Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F1D2B] flex items-center justify-center text-white">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
