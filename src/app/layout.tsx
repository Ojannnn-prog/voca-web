import type { Metadata } from "next";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "VOCA — Vortex Community of Athletics | One Community, Many Sports",
  description:
    "Komunitas dan klub olahraga multisport pembinaan motorik anak, renang (Swimming Academy), dan persiapan kebugaran jasmani sejak 10 Oktober 2026. Every Movement Matters.",
  keywords: [
    "VOCA",
    "Vortex Community of Athletics",
    "Klub Renang",
    "Rumah Motorik",
    "Pendidikan Gerak Anak",
    "Renang Balita",
    "Persiapan TNI POLRI",
    "Renang Adaptif",
  ],
  icons: {
    icon: [
      { url: "/LOGO%20VOCA.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/LOGO%20VOCA.svg",
    apple: "/LOGO%20VOCA.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-[#5E17EB] selection:text-white">
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
