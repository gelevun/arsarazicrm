CREATE TABLE "accounting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ay" integer NOT NULL,
	"yil" integer NOT NULL,
	"toplam_ciro" numeric(15, 2) DEFAULT '0',
	"ofis_payi" numeric(15, 2) DEFAULT '0',
	"aylik_gelirler" numeric(15, 2) DEFAULT '0',
	"aylik_giderler_sabit" numeric(15, 2) DEFAULT '0',
	"giderler" numeric(15, 2) DEFAULT '0',
	"gider_adi" text,
	"aylik_brut" numeric(15, 2) DEFAULT '0',
	"aylik_net" numeric(15, 2) DEFAULT '0',
	"vergiler" numeric(15, 2) DEFAULT '0',
	"vergi_turu" text,
	"odemeler" numeric(15, 2) DEFAULT '0',
	"odeme_turu" text,
	"olusturulma_tarihi" timestamp DEFAULT now(),
	"guncellenme_tarihi" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad" text NOT NULL,
	"soyad" text NOT NULL,
	"tc_kimlik_no" text,
	"telefon" text,
	"email" text,
	"adres" text,
	"cinsiyet" text,
	"meslek" text,
	"sirket_adi" text,
	"vergi_no" text,
	"iban" text,
	"notlar" text,
	"durum" text DEFAULT 'aktif',
	"danisman_id" uuid,
	"yonlendiren_id" uuid,
	"olusturan_kullanici" uuid,
	"olusturulma_tarihi" timestamp DEFAULT now(),
	"guncellenme_tarihi" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"belge_id" text,
	"gayrimenkul_id" uuid,
	"islem_id" uuid,
	"belge_turu" text NOT NULL,
	"noter" text,
	"vekil" text,
	"vekalet_tarihi" timestamp,
	"vekalet_bitis" timestamp,
	"yetkili_makam" text,
	"malik" text,
	"tapu_tarihi" timestamp,
	"onceki_malik_id" uuid,
	"dosya_url" text,
	"dosya_turu" text,
	"dosya_boyutu" integer,
	"yuklenme_tarihi" timestamp DEFAULT now(),
	"duzenlenme_tarihi" timestamp,
	"duzenleyen_kurum" text,
	"imzalayan" text,
	"imza_tarihi" timestamp,
	"onaylayan" text,
	"onay_tarihi" timestamp,
	"dogrulama_kodu" text,
	"sozlesme_id" text,
	"olusturan" uuid,
	"olusturulma_tarihi" timestamp DEFAULT now(),
	"guncellenme_tarihi" timestamp DEFAULT now(),
	"gizlilik" text DEFAULT 'public',
	"notlar" text,
	"durum" text DEFAULT 'aktif',
	CONSTRAINT "documents_belge_id_unique" UNIQUE("belge_id")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gayrimenkul_id" text,
	"il" text NOT NULL,
	"ilce" text NOT NULL,
	"mahalle" text,
	"ada_no" text,
	"parsel_no" text,
	"alan_m2" numeric(10, 2),
	"tur" text DEFAULT 'arsa',
	"imar_plani_turu" text,
	"taks" numeric(5, 2),
	"kaks" numeric(5, 2),
	"maksimum_yukseklik" numeric(5, 2),
	"malik_id" uuid,
	"onceki_malik_id" uuid,
	"danisman_id" uuid,
	"edinme_tarihi" timestamp,
	"alis_fiyati" numeric(15, 2),
	"tapu_bedeli" numeric(15, 2),
	"tapu_satis_bedeli" numeric(15, 2),
	"degerleme_fiyati" numeric(15, 2),
	"ilan_fiyati" numeric(15, 2),
	"koordinatlar" jsonb,
	"fotograf_url" text,
	"foto_360" text,
	"ilan_tarihi" timestamp,
	"son_guncelleme_tarihi" timestamp DEFAULT now(),
	"notlar" text,
	"durum" text DEFAULT 'aktif',
	"kullanim_durumu" text,
	"tapu_durumu" text,
	"ipotek_durumu" text,
	"olusturulma_tarihi" timestamp DEFAULT now(),
	CONSTRAINT "properties_gayrimenkul_id_unique" UNIQUE("gayrimenkul_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rapor_turu" text NOT NULL,
	"baslik" text NOT NULL,
	"icerik" jsonb,
	"danisman_id" uuid,
	"tarih_baslangic" timestamp,
	"tarih_bitis" timestamp,
	"olusturan" uuid,
	"olusturulma_tarihi" timestamp DEFAULT now(),
	"durum" text DEFAULT 'aktif'
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"islem_id" text,
	"gayrimenkul_id" uuid,
	"alici_id" uuid,
	"satici_id" uuid,
	"danisman_id" uuid,
	"islem_tarihi" timestamp DEFAULT now(),
	"tutar" numeric(15, 2) NOT NULL,
	"para_birimi" text DEFAULT 'TRY',
	"durum" text DEFAULT 'beklemede',
	"olusturulma_tarihi" timestamp DEFAULT now(),
	"guncellenme_tarihi" timestamp DEFAULT now(),
	"odeme_yontemi" text,
	"odeme_durumu" text DEFAULT 'bekleyen',
	"komisyon_orani" numeric(5, 2) DEFAULT '3',
	"komisyon_tutari" numeric(15, 2),
	"vergi_tutari" numeric(15, 2),
	"net_tutar" numeric(15, 2),
	"sozlesme_id" text,
	"notlar" text,
	CONSTRAINT "transactions_islem_id_unique" UNIQUE("islem_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad" text NOT NULL,
	"soyad" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"telefon" text,
	"rol" text DEFAULT 'consultant' NOT NULL,
	"departman" text,
	"password" text NOT NULL,
	"son_giris" timestamp,
	"durum" boolean DEFAULT true,
	"foto" text,
	"notlar" text,
	"olusturulma_tarihi" timestamp DEFAULT now(),
	"guncellenme_tarihi" timestamp DEFAULT now(),
	"ciro" numeric(15, 2) DEFAULT '0',
	"ciro_ofis_payi" numeric(15, 2) DEFAULT '0',
	"ciro_danisman_payi" numeric(15, 2) DEFAULT '0',
	"ciro_danisman_yuzde" numeric(5, 2) DEFAULT '3',
	"islem_sayisi" integer DEFAULT 0,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_danisman_id_users_id_fk" FOREIGN KEY ("danisman_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_yonlendiren_id_users_id_fk" FOREIGN KEY ("yonlendiren_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_olusturan_kullanici_users_id_fk" FOREIGN KEY ("olusturan_kullanici") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_gayrimenkul_id_properties_id_fk" FOREIGN KEY ("gayrimenkul_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_onceki_malik_id_clients_id_fk" FOREIGN KEY ("onceki_malik_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_olusturan_users_id_fk" FOREIGN KEY ("olusturan") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_malik_id_clients_id_fk" FOREIGN KEY ("malik_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_onceki_malik_id_clients_id_fk" FOREIGN KEY ("onceki_malik_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_danisman_id_users_id_fk" FOREIGN KEY ("danisman_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_danisman_id_users_id_fk" FOREIGN KEY ("danisman_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_olusturan_users_id_fk" FOREIGN KEY ("olusturan") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_gayrimenkul_id_properties_id_fk" FOREIGN KEY ("gayrimenkul_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_alici_id_clients_id_fk" FOREIGN KEY ("alici_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_satici_id_clients_id_fk" FOREIGN KEY ("satici_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_danisman_id_users_id_fk" FOREIGN KEY ("danisman_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;