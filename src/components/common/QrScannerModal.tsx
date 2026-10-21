"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  RotateCcw,
  X,
  CheckCircle2,
  AlertCircle,
  Keyboard,
  Scan,
} from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (result: {
    type: "member" | "coach";
    id: string;
    name: string;
    category?: string;
  }) => void;
  title?: string;
  activeMembers?: Array<{ memberId: string; fullName: string; ageCategory: string }>;
  activeCoaches?: Array<{ coachCode?: string | null; fullName: string; specialty?: string | null }>;
}

export function QrScannerModal({
  isOpen,
  onClose,
  onScanResult,
  title = "Scan QR Code Presensi",
  activeMembers = [],
  activeCoaches = [],
}: QrScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Form input manual fallback
  const [manualTargetType, setManualTargetType] = useState<"member" | "coach">("member");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualStatus, setManualStatus] = useState<"hadir" | "izin" | "sakit" | "alpha">("hadir");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "voca-qr-reader";

  // Web Audio API beep sound for feedback
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio not supported or blocked
    }
  };

  const handleDecodedText = useCallback((decodedText: string) => {
    if (!decodedText || decodedText === lastScanned) return;
    setLastScanned(decodedText);
    playBeep();

    try {
      // Coba parse payload JSON dari QR
      const parsed = JSON.parse(decodedText);
      if (parsed.id && (parsed.type === "member" || parsed.type === "coach")) {
        onScanResult({
          type: parsed.type,
          id: parsed.id,
          name: parsed.name || parsed.id,
          category: parsed.category,
        });
        return;
      }
    } catch {
      // Plain text fallback (misal barcode teks langsung: VOCA-2026-001)
      const clean = decodedText.trim();
      if (clean.startsWith("VOCA-")) {
        const found = activeMembers.find((m) => m.memberId === clean);
        onScanResult({
          type: "member",
          id: clean,
          name: found?.fullName || clean,
          category: found?.ageCategory,
        });
        return;
      } else if (clean.startsWith("COACH-")) {
        const found = activeCoaches.find((c) => c.coachCode === clean);
        onScanResult({
          type: "coach",
          id: clean,
          name: found?.fullName || clean,
          category: found?.specialty || "Pelatih",
        });
        return;
      }
    }

    // Generic fallback
    onScanResult({
      type: "member",
      id: decodedText,
      name: decodedText,
    });
  }, [activeCoaches, activeMembers, lastScanned, onScanResult]);

  // Start scanner
  const startScanner = useCallback(async () => {
    try {
      setCameraError(null);
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // Ignore
        }
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: facingMode },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        () => {
          // Scanning frame error, ignore
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn("Camera start warning:", err);
      setCameraError(
        err.message?.includes("Permission")
          ? "Izin akses kamera ditolak. Silakan izinkan akses kamera di browser Anda atau gunakan input manual."
          : "Kamera tidak terdeteksi atau sedang digunakan aplikasi lain."
      );
      setIsScanning(false);
    }
  }, [facingMode, handleDecodedText]);

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // Ignore
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpen, activeTab, facingMode, startScanner, stopScanner]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    if (manualTargetType === "member") {
      const found = activeMembers.find((m) => m.memberId === selectedTargetId);
      onScanResult({
        type: "member",
        id: selectedTargetId,
        name: found?.fullName || selectedTargetId,
        category: found?.ageCategory,
      });
    } else {
      const found = activeCoaches.find((c) => (c.coachCode || c.fullName) === selectedTargetId);
      onScanResult({
        type: "coach",
        id: found?.coachCode || selectedTargetId,
        name: found?.fullName || selectedTargetId,
        category: found?.specialty || "Pelatih",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5E17EB]/10 flex items-center justify-center text-[#5E17EB]">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">{title}</h3>
              <p className="text-[11px] text-neutral-500">
                Pindai QR Code KTA Member atau Kartu Pelatih VOCA
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switch: Scanner Kamera vs Input Manual */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === "camera"
                  ? "bg-white text-[#5E17EB] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Kamera</span>
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === "manual"
                  ? "bg-white text-[#5E17EB] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Pilih Manual</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {activeTab === "camera" ? (
            <div className="space-y-4">
              {/* Camera Container */}
              <div className="relative w-full aspect-square max-h-[300px] mx-auto bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center">
                <div id={readerElementId} className="w-full h-full" />

                {/* Overlaid Target Guide */}
                <div className="absolute inset-0 pointer-events-none border-[3px] border-[#5E17EB]/40 rounded-2xl m-6 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-white/80 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-neutral-900/90 p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                    <p className="text-xs text-neutral-300 mb-3">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab("manual")}
                      className="px-4 py-2 bg-[#5E17EB] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#4d10c7] transition"
                    >
                      Beralih ke Input Manual
                    </button>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isScanning ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                    }`}
                  />
                  <span>
                    {isScanning
                      ? `Kamera aktif (${facingMode === "environment" ? "Belakang" : "Depan"})`
                      : "Menghubungkan kamera..."}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    Ganti ke Kamera {facingMode === "environment" ? "Depan" : "Belakang"}
                  </span>
                </button>
              </div>

              {lastScanned && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="truncate">Terdeteksi: <strong>{lastScanned}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Tipe Presensi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualTargetType("member");
                      setSelectedTargetId("");
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      manualTargetType === "member"
                        ? "border-[#5E17EB] bg-[#5E17EB]/5 text-[#5E17EB]"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    Anggota / Siswa ({activeMembers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualTargetType("coach");
                      setSelectedTargetId("");
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      manualTargetType === "coach"
                        ? "border-[#2563eb] bg-[#2563eb]/5 text-[#2563eb]"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    Pelatih / Coach ({activeCoaches.length})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Pilih {manualTargetType === "member" ? "Nama Anggota" : "Nama Pelatih"}
                </label>
                <select
                  required
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5E17EB] focus:outline-none"
                >
                  <option value="">-- Pilih {manualTargetType === "member" ? "Siswa Atlet" : "Pelatih"} --</option>
                  {manualTargetType === "member"
                    ? activeMembers.map((m) => (
                        <option key={m.memberId} value={m.memberId}>
                          {m.fullName} ({m.memberId}) • {m.ageCategory}
                        </option>
                      ))
                    : activeCoaches.map((c) => (
                        <option key={c.coachCode || c.fullName} value={c.coachCode || c.fullName}>
                          {c.fullName} ({c.coachCode || "Coach"}) • {c.specialty || "Pelatih"}
                        </option>
                      ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    stopScanner();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedTargetId}
                  className="px-5 py-2 bg-[#5E17EB] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 hover:bg-[#4d10c7] disabled:opacity-50 transition"
                >
                  Proses Presensi Manual
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
