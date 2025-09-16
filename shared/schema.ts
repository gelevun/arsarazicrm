import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ad: text("ad").notNull(),
  soyad: text("soyad").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  telefon: text("telefon"),
  rol: text("rol").notNull().default("consultant"), // admin, consultant
  departman: text("departman"),
  password: text("password").notNull(),
  son_giris: timestamp("son_giris"),
  durum: boolean("durum").default(true),
  foto: text("foto"),
  notlar: text("notlar"),
  olusturulma_tarihi: timestamp("olusturulma_tarihi").defaultNow(),
  guncellenme_tarihi: timestamp("guncellenme_tarihi").defaultNow(),
  ciro: decimal("ciro", { precision: 15, scale: 2 }).default("0"),
  ciro_ofis_payi: decimal("ciro_ofis_payi", { precision: 15, scale: 2 }).default("0"),
  ciro_danisman_payi: decimal("ciro_danisman_payi", { precision: 15, scale: 2 }).default("0"),
  ciro_danisman_yuzde: decimal("ciro_danisman_yuzde", { precision: 5, scale: 2 }).default("3"),
  islem_sayisi: integer("islem_sayisi").default(0),
});

// Clients table
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ad: text("ad").notNull(),
  soyad: text("soyad").notNull(),
  tc_kimlik_no: text("tc_kimlik_no"),
  telefon: text("telefon"),
  email: text("email"),
  adres: text("adres"),
  cinsiyet: text("cinsiyet"),
  meslek: text("meslek"),
  sirket_adi: text("sirket_adi"),
  vergi_no: text("vergi_no"),
  iban: text("iban"),
  notlar: text("notlar"),
  durum: text("durum").default("aktif"), // aktif, pasif, bekleyen
  danisman_id: uuid("danisman_id").references(() => users.id),
  yonlendiren_id: uuid("yonlendiren_id").references(() => users.id),
  olusturan_kullanici: uuid("olusturan_kullanici").references(() => users.id),
  olusturulma_tarihi: timestamp("olusturulma_tarihi").defaultNow(),
  guncellenme_tarihi: timestamp("guncellenme_tarihi").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  gayrimenkul_id: text("gayrimenkul_id").unique(),
  il: text("il").notNull(),
  ilce: text("ilce").notNull(),
  mahalle: text("mahalle"),
  ada_no: text("ada_no"),
  parsel_no: text("parsel_no"),
  alan_m2: decimal("alan_m2", { precision: 10, scale: 2 }),
  tur: text("tur").default("arsa"), // arsa, arazi, bina
  imar_plani_turu: text("imar_plani_turu"),
  taks: decimal("taks", { precision: 5, scale: 2 }),
  kaks: decimal("kaks", { precision: 5, scale: 2 }),
  maksimum_yukseklik: decimal("maksimum_yukseklik", { precision: 5, scale: 2 }),
  malik_id: uuid("malik_id").references(() => clients.id),
  onceki_malik_id: uuid("onceki_malik_id").references(() => clients.id),
  danisman_id: uuid("danisman_id").references(() => users.id),
  edinme_tarihi: timestamp("edinme_tarihi"),
  alis_fiyati: decimal("alis_fiyati", { precision: 15, scale: 2 }),
  tapu_bedeli: decimal("tapu_bedeli", { precision: 15, scale: 2 }),
  tapu_satis_bedeli: decimal("tapu_satis_bedeli", { precision: 15, scale: 2 }),
  degerleme_fiyati: decimal("degerleme_fiyati", { precision: 15, scale: 2 }),
  ilan_fiyati: decimal("ilan_fiyati", { precision: 15, scale: 2 }),
  koordinatlar: jsonb("koordinatlar"), // {lat, lng}
  fotograf_url: text("fotograf_url"),
  foto_360: text("foto_360"),
  ilan_tarihi: timestamp("ilan_tarihi"),
  son_guncelleme_tarihi: timestamp("son_guncelleme_tarihi").defaultNow(),
  notlar: text("notlar"),
  durum: text("durum").default("aktif"), // aktif, satildi, beklemede, iptal
  kullanim_durumu: text("kullanim_durumu"),
  tapu_durumu: text("tapu_durumu"),
  ipotek_durumu: text("ipotek_durumu"),
  olusturulma_tarihi: timestamp("olusturulma_tarihi").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  belge_id: text("belge_id").unique(),
  gayrimenkul_id: uuid("gayrimenkul_id").references(() => properties.id),
  islem_id: uuid("islem_id"),
  belge_turu: text("belge_turu").notNull(),
  noter: text("noter"),
  vekil: text("vekil"),
  vekalet_tarihi: timestamp("vekalet_tarihi"),
  vekalet_bitis: timestamp("vekalet_bitis"),
  yetkili_makam: text("yetkili_makam"),
  malik: text("malik"),
  tapu_tarihi: timestamp("tapu_tarihi"),
  onceki_malik_id: uuid("onceki_malik_id").references(() => clients.id),
  dosya_url: text("dosya_url"),
  dosya_turu: text("dosya_turu"),
  dosya_boyutu: integer("dosya_boyutu"),
  yuklenme_tarihi: timestamp("yuklenme_tarihi").defaultNow(),
  duzenlenme_tarihi: timestamp("duzenlenme_tarihi"),
  duzenleyen_kurum: text("duzenleyen_kurum"),
  imzalayan: text("imzalayan"),
  imza_tarihi: timestamp("imza_tarihi"),
  onaylayan: text("onaylayan"),
  onay_tarihi: timestamp("onay_tarihi"),
  dogrulama_kodu: text("dogrulama_kodu"),
  sozlesme_id: text("sozlesme_id"),
  olusturan: uuid("olusturan").references(() => users.id),
  olusturulma_tarihi: timestamp("olusturulma_tarihi").defaultNow(),
  guncellenme_tarihi: timestamp("guncellenme_tarihi").defaultNow(),
  gizlilik: text("gizlilik").default("public"), // public, private
  notlar: text("notlar"),
  durum: text("durum").default("aktif"),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  islem_id: text("islem_id").unique(),
  gayrimenkul_id: uuid("gayrimenkul_id").references(() => properties.id),
  alici_id: uuid("alici_id").references(() => clients.id),
  satici_id: uuid("satici_id").references(() => clients.id),
  danisman_id: uuid("danisman_id").references(() => users.id),
  islem_tarihi: timestamp("islem_tarihi").defaultNow(),
  tutar: decimal("tutar", { precision: 15, scale: 2 }).notNull(),
  para_birimi: text("para_birimi").default("TRY"),
  durum: text("durum").default("beklemede"), // beklemede, tamamlandi, iptal
  olusturulma_tarihi: timestamp("olusturulma_tarihi").defaultNow(),
  guncellenme_tarihi: timestamp("guncellenme_tarihi").defaultNow(),
  odeme_yontemi: text("odeme_yontemi"),
  odeme_durumu: text("odeme_durumu").default("bekleyen"),
  komisyon_orani: decimal("komisyon_orani", { precision: 5, scale: 2 }).default("3"),
  komisyon_tutari: decimal("komisyon_tutari", { precision: 15, scale: 2 }),
  vergi_tutari: decimal("vergi_tutari", { precision: 15, scale: 2 }),
  net_tutar: decimal("net_tutar", { precision: 15, scale: 2 }),
  sozlesme_id: text("sozlesme_id"),
  notlar: text("notlar"),
});

// Reports table
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  rapor_turu: text("rapor_turu").notNull(), // ciro, islem, fatura, musteri_sayisi, portfoy_sayisi, yatirimci_raporu
  baslik: text("baslik").notNull(),
  icerik: jsonb("icerik"),
  danisman_id: uuid("danisman_id").references(() => users.id),
  tarih_baslangic: timestamp("tarih_baslangic"),
  tarih_bitis: timestamp("tarih_bitis"),
  olusturan: uuid("olusturan").references(() => users.id),
  olusturulma_tarihi: timestamp("olusturulma_tarihi").defaultNow(),
  durum: text("durum").default("aktif"),
});

// Accounting table
export const accounting = pgTable("accounting", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ay: integer("ay").notNull(),
  yil: integer("yil").notNull(),
  toplam_ciro: decimal("toplam_ciro", { precision: 15, scale: 2 }).default("0"),
  ofis_payi: decimal("ofis_payi", { precision: 15, scale: 2 }).default("0"),
  aylik_gelirler: decimal("aylik_gelirler", { precision: 15, scale: 2 }).default("0"),
  aylik_giderler_sabit: decimal("aylik_giderler_sabit", { precision: 15, scale: 2 }).default("0"),
  giderler: decimal("giderler", { precision: 15, scale: 2 }).default("0"),
  gider_adi: text("gider_adi"),
  aylik_brut: decimal("aylik_brut", { precision: 15, scale: 2 }).default("0"),
  aylik_net: decimal("aylik_net", { precision: 15, scale: 2 }).default("0"),
  vergiler: decimal("vergiler", { precision: 15, scale: 2 }).default("0"),
  vergi_turu: text("vergi_turu"),
  odemeler: decimal("odemeler", { precision: 15, scale: 2 }).default("0"),
  odeme_turu: text("odeme_turu"),
  olusturulma_tarihi: timestamp("olusturulma_tarihi").defaultNow(),
  guncellenme_tarihi: timestamp("guncellenme_tarihi").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients, { relationName: "danisman" }),
  properties: many(properties),
  transactions: many(transactions),
  documents: many(documents),
  reports: many(reports),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  danisman: one(users, {
    fields: [clients.danisman_id],
    references: [users.id],
    relationName: "danisman",
  }),
  yonlendiren: one(users, {
    fields: [clients.yonlendiren_id],
    references: [users.id],
  }),
  olusturan: one(users, {
    fields: [clients.olusturan_kullanici],
    references: [users.id],
  }),
  properties: many(properties),
  transactions_as_buyer: many(transactions, { relationName: "alici" }),
  transactions_as_seller: many(transactions, { relationName: "satici" }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  malik: one(clients, {
    fields: [properties.malik_id],
    references: [clients.id],
  }),
  onceki_malik: one(clients, {
    fields: [properties.onceki_malik_id],
    references: [clients.id],
  }),
  danisman: one(users, {
    fields: [properties.danisman_id],
    references: [users.id],
  }),
  documents: many(documents),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  gayrimenkul: one(properties, {
    fields: [transactions.gayrimenkul_id],
    references: [properties.id],
  }),
  alici: one(clients, {
    fields: [transactions.alici_id],
    references: [clients.id],
    relationName: "alici",
  }),
  satici: one(clients, {
    fields: [transactions.satici_id],
    references: [clients.id],
    relationName: "satici",
  }),
  danisman: one(users, {
    fields: [transactions.danisman_id],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  gayrimenkul: one(properties, {
    fields: [documents.gayrimenkul_id],
    references: [properties.id],
  }),
  onceki_malik: one(clients, {
    fields: [documents.onceki_malik_id],
    references: [clients.id],
  }),
  olusturan: one(users, {
    fields: [documents.olusturan],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  danisman: one(users, {
    fields: [reports.danisman_id],
    references: [users.id],
  }),
  olusturan: one(users, {
    fields: [reports.olusturan],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  olusturulma_tarihi: true,
  guncellenme_tarihi: true,
  son_giris: true,
});

// Update schema for users (includes son_giris field)
export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  olusturulma_tarihi: true,
  guncellenme_tarihi: true,
}).partial();

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  olusturulma_tarihi: true,
  guncellenme_tarihi: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  olusturulma_tarihi: true,
  son_guncelleme_tarihi: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  olusturulma_tarihi: true,
  guncellenme_tarihi: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  olusturulma_tarihi: true,
  guncellenme_tarihi: true,
  yuklenme_tarihi: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  olusturulma_tarihi: true,
});

export const insertAccountingSchema = createInsertSchema(accounting).omit({
  id: true,
  olusturulma_tarihi: true,
  guncellenme_tarihi: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Accounting = typeof accounting.$inferSelect;
export type InsertAccounting = z.infer<typeof insertAccountingSchema>;
