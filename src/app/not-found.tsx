import Link from "next/link";
import { VocaLogo } from "@/components/common/VocaLogo";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <VocaLogo variant="full" size="lg" />
      </div>
      <h1 className="text-6xl font-black text-neutral-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-neutral-800 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">
        Halaman yang Anda tuju mungkin sudah dipindahkan atau URL yang dimasukkan salah.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5E17EB] hover:bg-[#4b11bd] text-white text-sm font-bold shadow-md transition-all active:scale-95"
      >
        <Home className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  );
}
