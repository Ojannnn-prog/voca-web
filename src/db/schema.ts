import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";

// 1. Tabel Pendaftaran Trial Class, Konsultasi & Registrasi Anggota VOCA
export const trialLeads = pgTable("trial_leads", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  participantAge: integer("participant_age"),
  ageCategory: varchar("age_category", { length: 50 }).default("kids"), // toddler | kids | junior | adult | adaptive | tni_polri
  programCategory: varchar("program_category", { length: 50 }).notNull(), // swimming | motoric | both
  planType: varchar("plan_type", { length: 50 }).default("free_trial"), // free_trial | reguler | premium_private | consultation
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending | approved | rejected | converted
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Tabel Database Anggota Resmi VOCA (Keanggotaan & KTA Digital)
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id", { length: 50 }).notNull().unique(), // contoh: VOCA-2026-001
  username: varchar("username", { length: 100 }), // contoh: membervoca20261
  password: varchar("password", { length: 100 }), // contoh: vocamember2026
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  participantAge: integer("participant_age"),
  ageCategory: varchar("age_category", { length: 50 }).notNull(), // Balita | Anak-anak | Remaja | Dewasa | Terapi Lansia | Terapi Disabilitas | Casis TNI/Polri
  programType: varchar("program_type", { length: 50 }).notNull(), // Reguler Member | Premium Private Class
  sportBranch: varchar("sport_branch", { length: 100 }).notNull(), // Renang & Akuatik | Fundamental Motorik | Multi-Sport Atletik | Persiapan TNI/POLRI
  monthlyFee: integer("monthly_fee").notNull(), // Rp. 299.000 s/d Rp. 597.000 atau Rp. 400.000+
  joinDate: timestamp("join_date").defaultNow().notNull(),
  validUntil: timestamp("valid_until").notNull(), // Tanggal akhir masa aktif membership
  status: varchar("status", { length: 50 }).default("active").notNull(), // active | inactive | suspended
  bloodType: varchar("blood_type", { length: 10 }).default("O"),
  photoUrl: text("photo_url"), // URL / base64 foto profil anggota untuk KTA resmi
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2.1 Tabel Tagihan Bulanan / Invoicing Anggota VOCA
export const memberInvoices = pgTable("member_invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(), // contoh: INV-202610-001
  memberId: varchar("member_id", { length: 50 }).notNull(), // relasi ke members.memberId
  memberName: varchar("member_name", { length: 255 }).notNull(),
  monthPeriod: varchar("month_period", { length: 50 }).notNull(), // contoh: "Oktober 2026"
  amount: integer("amount").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(), // batas waktu pembayaran (misal 7 hari setelah terbit)
  status: varchar("status", { length: 50 }).default("unpaid").notNull(), // unpaid (belum bayar) | pending (menunggu verifikasi) | paid (lunas)
  paymentProofUrl: text("payment_proof_url"), // URL file bukti transfer atau base64
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method", { length: 50 }).default("Transfer Bank"),
  notes: text("notes"),
  verifiedByUser: varchar("verified_by_user", { length: 100 }),
  transactionCode: varchar("transaction_code", { length: 50 }), // relasi ke finance_transactions jika lunas
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Tabel Pembukuan Kas & Transaksi Keuangan Klub VOCA
export const financeTransactions = pgTable("finance_transactions", {
  id: serial("id").primaryKey(),
  transactionCode: varchar("transaction_code", { length: 50 }).notNull().unique(), // TRX-202610-001
  type: varchar("type", { length: 20 }).notNull(), // income | expense
  category: varchar("category", { length: 100 }).notNull(), // Iuran Bulanan | Pendaftaran Baru | Honor Pelatih | Sewa Venue | Peralatan | Operasional
  amount: integer("amount").notNull(), // Nominal dalam Rupiah
  memberId: varchar("member_id", { length: 50 }), // Relasi opsional ke ID Anggota (VOCA-2026-xxx)
  paymentMethod: varchar("payment_method", { length: 50 }).default("Transfer Bank").notNull(), // Transfer Bank | QRIS | Tunai
  description: text("description").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdByUser: varchar("created_by_user", { length: 100 }).default("adminvoca").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Tabel Pengguna Sistem (Akun Admin, Pelatih, & Staff)
export const systemUsers = pgTable("system_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // admin | coach | staff
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  specialty: varchar("specialty", { length: 100 }), // Pelatih Renang, Pelatih Motorik, Bendahara, dll.
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Tabel Preset Metrik Evaluasi untuk Bento Chart
export const analyticsPresets = pgTable("analytics_presets", {
  id: serial("id").primaryKey(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(), // level1 | level2 | level3 | level4 | level5
  waterConfidenceStart: integer("water_confidence_start").notNull(),
  waterConfidenceEnd: integer("water_confidence_end").notNull(),
  motoricAgilityStart: integer("motoric_agility_start").notNull(),
  motoricAgilityEnd: integer("motoric_agility_end").notNull(),
  yellowPathD: text("yellow_path_d").notNull(),
  pinkPathD: text("pink_path_d").notNull(),
});

// 6. Tabel Demografi Peserta
export const audienceDemographics = pgTable("audience_demographics", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  percentage: integer("percentage").notNull(),
  sortOrder: integer("sort_order").notNull(),
});
