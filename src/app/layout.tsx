import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fredoka } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

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
    <html lang="id" className={`${plusJakartaSans.variable} ${fredoka.variable}`}>
      <body className="antialiased selection:bg-[#5E17EB] selection:text-white">
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
