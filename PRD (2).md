# Product Requirements Document (PRD): Wollo Interactive Landing Page & Web App

## 1. Project Overview & Objectives
* **Product Name:** Wollo[cite: 1, 2]
* **Product Concept:** Platform manajemen dan analitik media sosial berbasis SaaS dengan *landing page* interaktif bergaya *scrollytelling*.
* **Objective:** Membangun aplikasi web menggunakan **Next.js (App Router)** yang terhubung dengan database **Neon Serverless PostgreSQL** dan siap di-deploy ke **Vercel**. Halaman utama harus mereplikasi 100% tata letak, perilaku animasi *scroll*, dan komponen analitik dari referensi desain tanpa terjadi *clipping* atau area terpotong[cite: 1, 2].

---

## 2. Tech Stack & Architecture (Strict Guidelines for AI Agent)

### A. Core Framework & Styling
* **Framework:** Next.js 14/15 (App Router, TypeScript, `src/` directory structure).
* **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`.
* **Fonts (`next/font/google`):**
  * **Body & Headings:** `Plus Jakarta Sans` (Weights: 400, 500, 600, 700).
  * **Brand Logo ("wollo"):** `Fredoka` (Weights: 600, 700).

### B. Animation & Interactive Libraries
* **Scroll & Timeline Animation:** `gsap` dan `@gsap/react` (menggunakan plugin `ScrollTrigger`). **Wajib menggunakan `useGSAP()` hook** untuk mencegah *memory leak* atau konflik *DOM hydration* di React.
* **UI Transitions & Physics:**
  * Gunakan **GSAP Bounce / Custom Physics** atau **Matter.js** untuk animasi jatuhnya kapsul pada kartu *Hashtag Performance*.
  * Gunakan **GSAP SVG Morph / Attribute Tweening** untuk pergerakan garis kurva pada *Optimizing Performance Chart*.

### C. Backend, Database & Deployment
* **Database:** **Neon Serverless PostgreSQL** (`@neondatabase/serverless`).
* **ORM:** **Drizzle ORM** (`drizzle-orm`, `drizzle-kit`) atau **Prisma ORM**.
* **Backend Logic:** Next.js Server Actions & Route Handlers (`app/api/...`) untuk menangani pendaftaran *Free Trial*, pembuatan akun, dan pengambilan data metrik analitik dinamis[cite: 1].
* **Deployment Target:** **Vercel** (konfigurasi *Environment Variables* otomatis untuk `DATABASE_URL`).

---

## 3. Design System & Visual Tokens

### A. Color Palette
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `bg-surface` | `#FFFFFF` | Latar belakang utama halaman & *pill* navigasi saat *dark mode*[cite: 1, 2]. |
| `bg-card` | `#F8F9FA` | Latar belakang kartu *Bento Grid* pada seksi Analytics[cite: 1]. |
| `brand-purple` | `#5E17EB` | Tombol Primary CTA ("Start Free Trial") & aksen *progress bar*[cite: 1]. |
| `canvas-purple-start`| `#4A00E0` | Warna gradasi atas pada kanvas ilustrasi utama[cite: 1, 2]. |
| `canvas-purple-end` | `#2E008B` | Warna gradasi bawah pada kanvas ilustrasi utama[cite: 1, 2]. |
| `brand-pink` | `#FF4D8D` | Logo saat *scroll*, kartu tengah tumpukan Hero, grafik garis & batang[cite: 1, 2]. |
| `brand-yellow` | `#FFC700` | Kartu belakang tumpukan Hero, kotak metrik *Engagement Rate*, grafik garis[cite: 1]. |
| `text-primary` | `#111111` | Teks utama, tombol hitam navbar, *tooltip* grafik[cite: 1, 2]. |

### B. Textures & Effects
* **Grainy Noise Overlay:** Kanvas ilustrasi wajib dilapisi *SVG Fractal Noise* dengan `opacity: 0.14` dan `pointer-events: none` untuk menghasilkan tekstur *grainy* khas ilustrasi modern[cite: 1, 2].

---

## 4. Detailed Component & Animation Specifications

> **CRITICAL LAYOUT RULE FOR AI AGENT:**
> Jangan gunakan `flex-col` standar yang menumpuk `#hero-content` dan `#card-stage` dalam satu aliran dokumen (*normal flow*) saat melakukan *pinning* dengan GSAP. Hal tersebut menyebabkan kartu ungu tertahan oleh tinggi elemen teks di atasnya dan menyisakan ruang putih yang memotong layar[cite: 2].
> **Solusi Wajib:** Gunakan `position: relative; height: 100vh; overflow: hidden;` pada pembungkus utama (`#scroll-wrapper`), lalu posisikan `#hero-content` dan `#card-stage` menggunakan `position: absolute`. Saat di-*scroll*, animasikan `#card-stage` menuju `top: 0px`, `width: 100vw`, `height: 100vh`, dan `borderRadius: 0px`.

### Section 1: Adaptive Sticky Navbar (`<Navbar />`)
* **Posisi:** `fixed top-0 left-0 right-0 z-50`.
* **Elemen:**
  * **Kiri:** Logo teks `wollo`[cite: 1, 2].
  * **Tengah:** Link navigasi (`Features`, `Integrations`, `Pricing`, `About us`, `Contact`)[cite: 1, 2].
  * **Kanan:** Link `Log In` dan tombol kapsul `Start Free Trial`[cite: 1, 2].
* **State machine (Dikontrol oleh `ScrollTrigger` progress):**
  1. **Default State (Latar Putih - Scroll Progress `0.00` s/d `0.12` & `> 0.94`):**
     * Logo: Hitam (`#111111`)[cite: 1].
     * Menu Tengah: Teks abu-abu tua transparan tanpa latar kapsul[cite: 1].
     * `Log In`: Hitam (`#111111`)[cite: 1].
     * `Start Free Trial`: Latar hitam (`#111111`), teks putih (`#FFFFFF`)[cite: 1].
  2. **Canvas Dark Mode State (Latar Ungu Fullscreen - Scroll Progress `0.12` s/d `0.94`):**
     * Logo: Berubah menjadi Pink (`#FF4D8D`)[cite: 1, 2].
     * Menu Tengah: Dibungkus kapsul putih (`bg-white px-7 py-2.5 rounded-full shadow-lg`)[cite: 1, 2].
     * `Log In`: Berubah menjadi Putih (`#FFFFFF`)[cite: 1].
     * `Start Free Trial`: Latar putih (`#FFFFFF`), teks hitam (`#111111`), border hitam `1.5px`[cite: 1, 2].

### Section 2: Hero & Full-Screen Scroll Showcase (`<HeroShowcase />`)
* **Initial State (00:00 - 00:01):**
  * **Headline:** "Maximize Your Social Media Presence" (2 baris, *center-aligned*, ukuran `3.65rem`, `font-medium`)[cite: 1].
  * **CTA Group:** Tombol ungu `Start Free Trial` (membuka modal pendaftaran Neon DB) dan tombol putih ber-border `Create Free Account`[cite: 1].
  * **Stacked Cards (`#card-stage`):** Berada di `top: 410px`, lebar `88vw` (`max-w-[1180px]`). Terdiri dari 3 kartu bertumpuk dengan rotasi miring:
    * Kartu Kuning (`#FFC700`): `-rotate-[4.2deg]`[cite: 1].
    * Kartu Pink (`#FF4D8D`): `-rotate-[2deg]`[cite: 1].
    * Kartu Utama Ungu (`#4300D2`): `-rotate-[0.8deg]`, menampilkan bagian atas ilustrasi (bola biru di dalam cincin orbit dan hati 3D pink-oranye)[cite: 1].
* **Scroll Animation Timeline (`pin: true`, `scrub: 0.5`, `end: "+=2400"`):**
  * **Phase 1 (Progress `0.00` -> `0.25`):**
    * `#hero-content` memudar ke atas (`opacity: 0, y: -90`)[cite: 1].
    * Kartu kuning dan pink memudar (`opacity: 0`)[cite: 1].
    * `#card-stage` bergerak ke `top: 0px`, `width: 100vw`, `maxWidth: 100vw`, `height: 100vh`[cite: 1].
    * `#main-purple-card` meluruskan rotasi ke `0deg` dan `borderRadius: 0px`[cite: 1].
  * **Phase 2 (Progress `0.22` -> `1.00`):**
    * Kontainer dalam `#illustration-canvas` (tinggi `300vh`) bergeser ke atas (`y: "-185vh"`), memamerkan alur ilustrasi SVG secara berurutan[cite: 1]:
      1. Bola biru & hati 3D pink[cite: 1].
      2. Pensil kuning raksasa miring, balon chat gelap, dan balon chat dengan 3 lingkaran/ikon tangan[cite: 1, 2].
      3. Robot/mesin ungu berkaki pink dan monitor isometrik di sisi kanan[cite: 1].
      4. Karakter bola biru-hijau besar yang tersenyum di kiri bawah dan kerucut pesta pink-kuning di tengah bawah[cite: 1].

### Section 3: Advanced Analytics & Reporting (`<AnalyticsSection />`)
* **Transisi Masuk (Curtain Reveal - 00:05 - 00:06):**
  * Seksi ini memiliki latar putih (`bg-white`), sudut atas membulat besar (`rounded-t-[48px]`), margin atas negatif (`-mt-14`), `z-30`, dan bayangan atas tebal untuk memberikan efek tirai putih yang naik menutupi kanvas ilustrasi ungu[cite: 1].
* **Headline:** "Advanced Analytics and Reporting" (2 baris, tengah)[cite: 1].
* **Layout:** Bento Grid 12 kolom (`lg:grid-cols-12 gap-8`).

#### 1. Kartu Kiri (`lg:col-span-5`): Auto-Switching Card
Memiliki tinggi minimal `430px`, latar `#F8F9FA`, `rounded-[32px]`, dan 4 *progress bar* warna di bagian bawah (`#FFC700`, `#FF4D8D`, `#5E17EB`, `#A5B4FC`)[cite: 1].
* **View A: Hashtag Performance (00:06 - 00:07)**
  * Saat seksi masuk ke *viewport* (`ScrollTrigger` `start: "top 68%"`), 12 kapsul hashtag (`#Nature`, `#Art`, `#Photography`, `#Cooking`, `#Fun`, `#AI`, `#Travel`, `#Selfie`, `#Explore`, `#Fitness`, `#Foodie`, `#Movie`) jatuh dari `top: -80px` ke koordinat tumpukan bawah dengan efek `bounce.out` dan rotasi acak sebagaimana terlihat pada video[cite: 1].
* **View B: Audience Demographics (00:08 - 00:09)**
  * Setelah `2200ms` sejak kapsul jatuh, View A melakukan *fade-out* (`opacity: 0`) dan View B melakukan *fade-in* (`opacity: 1`)[cite: 1].
  * Menampilkan 6 grafik batang horizontal berwarna pink (`#FF66A3`) yang beranimasi memanjang dari lebar `0%` ke nilai target (data diambil dari Neon DB / *fallback static data*)[cite: 1]:
    * `78%` — Pet Owners[cite: 1]
    * `56%` — Travelers[cite: 1]
    * `52%` — Parents[cite: 1]
    * `45%` — Foodies[cite: 1]
    * `38%` — Fitness Enthusiasts[cite: 1]
    * `28%` — Fashionistas[cite: 1]

#### 2. Kartu Kanan (`lg:col-span-7`): Optimizing Performance
* **Sub-kolom Kiri (Metric Cards):**
  * **Kartu Kuning (`#FFCC00`):** Label "Engagement Rate", nilai awal `+26%` beranimasi naik (*number tween*) hingga `+48%`[cite: 1].
  * **Kartu Pink (`#FF5C97`):** Label "Followers", nilai awal `+50%` beranimasi naik hingga `+59%`[cite: 1].
* **Sub-kolom Kanan (Time Filter & Dynamic Line Chart):**
  * **Filter Pills:** `3 days`, `1 week` (aktif: latar `#111111` teks putih), `1 month`, `3 months`, `6 months`, `1 year`[cite: 1]. Jika pengguna mengklik filter waktu lain, grafik dan angka metrik dapat memperbarui datanya secara interaktif.
  * **SVG Line Chart:**
    * Memiliki 2 kurva (`#FFCC00` dan `#FF4D8D`) yang bentuk jalurnya (`d` attribute) beranimasi secara mulus bersamaan dengan kenaikan angka metrik[cite: 1].
    * Dilengkapi 2 titik hitam beserta garis vertikal ke sumbu bawah dan *pill tooltip* hitam yang angkanya ikut berubah (`+28%` -> `+38%` dan `+43%` -> `+54%`)[cite: 1].

---

## 5. Database Schema (Neon PostgreSQL + Drizzle ORM)

Buat skema di `src/db/schema.ts` untuk mendukung penyimpanan prospek (*leads*) dari tombol CTA dan data analitik dinamis:

```typescript
import { pgTable, serial, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

// 1. Tabel Leads / Pendaftar Free Trial dari Hero & Navbar CTA
export const trialLeads = pgTable('trial_leads', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  planType: varchar('plan_type', { length: 50 }).default('free_trial'), // 'free_trial' | 'free_account'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabel Metrik Analytics (Untuk menyuplai data ke seksi Optimizing Performance & Demographics)
export const analyticsPresets = pgTable('analytics_presets', {
  id: serial('id').primaryKey(),
  timeframe: varchar('timeframe', { length: 20 }).notNull(), // '3d', '1w', '1m', '3m', '6m', '1y'
  engagementStart: integer('engagement_start').notNull(),
  engagementEnd: integer('engagement_end').notNull(),
  followersStart: integer('followers_start').notNull(),
  followersEnd: integer('followers_end').notNull(),
  yellowPathD: text('yellow_path_d').notNull(),
  pinkPathD: text('pink_path_d').notNull(),
});

// 3. Tabel Demografi Audiens
export const audienceDemographics = pgTable('audience_demographics', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(), // Contoh: 'Pet Owners'
  percentage: integer('percentage').notNull(),              // Contoh: 78
  sortOrder: integer('sort_order').notNull(),
});