# Nipah Satay™ Business Management System (BMS)
## Laporan Kemajuan Projek (Progress Update Report) • Kemaskini 21 November 2026

- **Organisasi:** Nipah Satay, Laguna Park, Pulau Indah, Klang, Selangor
- **Dokumen PDF:** [Muat Turun Dokumen PDF (docs/Nipah_Satay_Project_Progress_Update.pdf)](./Nipah_Satay_Project_Progress_Update.pdf)
- **URL Pengeluaran (Live Production):** [https://nipah-satay.vercel.app](https://nipah-satay.vercel.app)
- **Cawangan Git:** `main` (GitHub: `aku18xy/nipah-satay`)
- **Talian Hotline Rasmi:** 017 365 9302 (WhatsApp & Panggilan)
- **Waktu Operasi:** 3.00 PM – 11.00 PM (Ahad Cuti)

---

## 1. Ringkasan Eksekutif Kemajuan Terkini

Sistem Pengurusan Operasi Bersepadu Nipah Satay™ telah mencapai tahap kematangan operasi yang tinggi melalui beberapa fasa penambahbaikan kritikal berpandukan maklum balas penggunaan sebenar di restoran dan barisan pengeluaran:

1. **Integrasi Menu Fizikal Rasmi Penuh (68 Item):** Menggantikan semua data placeholder dengan senarai menu sebenar restoran berserta harga rasmi (Sate Ayam RM1.20, Sate Daging RM1.30, Sate Kambing RM2.00, Sate Perut RM1.80, Ketupat Mini RM1.00, Soto RM5.00, Mee Rebus RM7.00, Nasi Lemak RM2.00, Karipap Panas & Karipap Frozen RM8/RM10, Lai Chee Kang RM8.50, dan 40+ minuman panas/sejuk).
2. **Pengoptimuman Mobile-First & Navigasi Bawah (Bottom Navigation Bar):** Menambah bar navigasi bawah 5-tab tetap yang mesra ibu jari (*thumb-friendly*), serta Bar Terapung Troli (*Floating Cart Pill*) di POS yang dinaikkan ke kedudukan `bottom-[5.25rem]` terapung kemas di atas bar navigasi.
3. **Penyelesaian Keserasian Tablet Klasik (Legacy Browser Support):** Berhijrah dari Tailwind CSS v4 ke Tailwind CSS v3 (`v3.4.19`) berserta sasaran `browserslist` (Android >= 5, Chrome >= 50). Ini menyelesaikan isu paparan mentah (tanpa CSS) pada tablet operasi lama di restoran yang tidak menyokong `@layer` moden.
4. **Antaramuka Mesra Warga Emas (Senior-Friendly UI):** Suis mod kontras tinggi `👓 A+`, sasaran sentuhan minimum 48px–56px, display gergasi berserta stepper `-50` / `+50` dan butang pilihan pantas untuk merekod cucukan sate harian.
5. **Penyepaduan Pangkalan Data Awan (Neon PostgreSQL di Vercel Storage):** Pangkalan data SQL awan serverless diintegrasikan sepenuhnya menggunakan `@neondatabase/serverless` dengan sokongan jadual `orders`, `meat_intake`, `worker_skewer_logs`, dan `chiller_inventory`. Sistem dilengkapi penyesuaian auto-migrasi, laluan API REST (`/api/orders`, `/api/orders/[id]`, `/api/production`, `/api/db/status`), penyegerakan berterusan Dapur KDS (auto-poll 4 saat), dan seni bina sandaran luar talian (*graceful offline fallback*).
6. **Rekabentuk Kad POS Mengikut Lakaran (Kotak Ikon + Nama Menu):** Setiap item menu kini dipaparkan mengikut format lakaran yang dimohon dengan kotak berbingkai ikon di bahagian atas dan label nama menu (`Satay ayam`) berserta harga di bahagian bawah.
7. **Kawalan Saiz Ikon, Teks & Kolum Boleh Ubah (Minima 3 Sebaris):** Menambah bar pelaras saiz intuitif di POS yang membolehkan pengguna menukar susunan kepada minima 3 sebaris atau 4 sebaris melintang, melaras saiz kotak ikon (Kecil/Sedang/Besar), dan melaras saiz teks nama & harga (A-/A/A+).
8. **Penyelesaian Muat Turun & Pemasangan PWA (PWA WebAPK & PNG Icons):** Menjana ikon standard PNG PWA (192x192, 512x512, maskable, apple-touch-icon) menggantikan format JPEG terdahulu yang disekat oleh enjin Chrome/Android daripada memaparkan dialog muat turun. Menambah bar amaran pemasangan automatik `[📲 Pasang Aplikasi Nipah Satay™]` berserta tetingkap panduan interaktif bagi tablet dan telefon pintar lama.
9. **Auto-Update PWA Service Worker (v9):** Service worker dinaikkan ke versi `nipah-satay-v9` dengan dasar *Network-First* supaya peranti telefon dan tablet sentiasa memuat turun antaramuka dan ikon terkini tanpa tersangkut pada memori cache lama.

---

## 2. Status Penyiapan Modul Perisian

| Modul Sistem | Laluan (Route) | Ciri Utama & Status Terkini | Status |
| :--- | :--- | :--- | :--- |
| **Pusat Kawalan (Dashboard)** | `/` | Integrasi dua sayap (Restoran vs Kilang), metrik jualan semasa, status chiller, waktu operasi rasmi (3PM–11PM, Ahad Cuti), dan pautan pantas POS/KDS. | **Siap & Aktif (Live)** |
| **POS Kaunter & Meja** | `/pos` | Katalog 68 menu rasmi, kategori dinamik (Sate, Istimewa, Santai, Karipap, Minuman), kad anti-mampat `min-h-[185px]`, bar troli terapung mudah alih, modal bayaran DuitNow QR & tunai. | **Siap & Aktif (Live)** |
| **Dapur Pintar (KDS Live)** | `/kitchen` | Penjumlahan cucuk sate api arang masa nyata untuk Pitmaster, stesen kuali soto/mee rebus, stesen minuman, dan kawalan status penyediaan pesanan. | **Siap & Aktif (Live)** |
| **Kilang Pemprosesan Sate** | `/production` | Kalkulator yield daging (timbangan kasar vs susut trim), kadar upah pencucuk dinamik mengikut jenis sate, borang pencucuk `order-1` di telefon, dan log pemindahan stok ke bilik sejuk. | **Siap & Aktif (Live)** |
| **Borong & Katering Acara** | `/wholesale` | Pengurusan stok sate beku pek vakum (20s & 50s), penambahan Karipap Frozen (Kentang RM8, Sardin/Ayam RM10), dan log slot tempahan kenduri katering pitmaster. | **Siap & Aktif (Live)** |
| **Laporan Z-Report & Kos** | `/reports` | Penyata penutupan kaunter harian, audit varians stok chiller vs tunai jualan POS, dan simulasi margin keuntungan se-cucuk sate. | **Siap & Aktif (Live)** |
| **Menu Awam Pelanggan** | `/menu` | Portal menu digital awam untuk pesanan pelanggan dan katering dengan fungsi penjana pesanan WhatsApp automatik terus ke nombor rasmi `017 365 9302`. | **Siap & Aktif (Live)** |

---

## 3. Metrik Infrastruktur, Keserasian & Prestasi

- **Penyedia Cloud:** Vercel Production (Edge Serverless) nod Singapura (`sin1`).
- **Domain Pengeluaran:** `https://nipah-satay.vercel.app` (Status: HTTP 200 OK, SSL A+).
- **Rangka Kerja Utama:** Next.js 16.4.6 (App Router) + React 19.3.1.
- **Enjin Penggayaan:** Tailwind CSS v3.4.19 + Autoprefixer + PostCSS 8 (Keserasian Universal).
- **Sasaran Pelayar Web:** Disahkan berfungsi pada Android 5.0+, Chrome 50+, iOS Safari, tablet POS restoran, dan pelayar desktop.
- **Ketahanan Luar Talian (Offline Resilience):** Service Worker v8 (Network-First) + Web App Manifest PWA untuk kestabilan talian internet di kawasan perindustrian Pulau Indah.
- **Kawalan Versi & CI/CD:** Repositori GitHub `aku18xy/nipah-satay` pada cawangan `main` dengan auto-deployment ke Vercel pada setiap push.

---

## 4. Tindakan Seterusnya (Next Steps)

1. **Ujian Lapangan di Premis Laguna Park:** Menguji kelancaran aliran kerja pesanan menggunakan tablet kaunter dan telefon pintar staf pelayan secara langsung dengan Neon PostgreSQL.
2. **Penyambungan Pencetak Terma (Thermal Printer):** Mengintegrasikan cetakan tiket pesanan dapur 80mm ESC/POS melalui Bluetooth atau Web Print API.
3. **Penyegerakan Webhook / SMS / WhatsApp Notifikasi:** Notifikasi automatik kepada pelanggan apabila pesanan sate siap dibakar di pit arang.
