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
  planType: varchar("plan_type", { length: 50 }).default("free_trial"), // free_trial | consultation | membership
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending | contacted | verified
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Tabel Preset Metrik Evaluasi untuk Bento Chart
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

// 3. Tabel Demografi Peserta
export const audienceDemographics = pgTable("audience_demographics", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  percentage: integer("percentage").notNull(),
  sortOrder: integer("sort_order").notNull(),
});
