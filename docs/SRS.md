# Nipah Satay™ Business Management System (BMS)
## Software Requirements Specification (SRS) • Versi 1.0.0

- **Organisasi:** Nipah Satay, Laguna Park, Pulau Indah, Klang, Selangor
- **Sistem:** Next.js + PWA Dual-Operation BMS
- **Status:** Diluluskan & Aktif di Pengeluaran
- **Dokumen PDF:** [Muat Turun PDF (docs/Nipah_Satay_Software_Requirements_Specification_SRS.pdf)](./Nipah_Satay_Software_Requirements_Specification_SRS.pdf)
- **URL Pengeluaran:** [https://nipah-satay-bms.vercel.app](https://nipah-satay-bms.vercel.app)

---

## 1. Pengenalan & Latar Belakang Perniagaan

Nipah Satay™ merupakan perniagaan warisan keluarga sejak tahun 1990 yang berpangkalan di Laguna Park, Pulau Indah, Klang. Operasi perniagaan ini memiliki keunikan model hibrid:
1. **Restoran Terbuka F&B:** Menjual sate bakar arang asli, soto herba kuning, mee/bihun goreng kuali panas, nasi lemak daun pisang, kuih-muih dan minuman segar.
2. **Barisan Kilang Pemprosesan Sate:** Terletak bersebelahan restoran, mengendalikan penerimaan daging pukal, formulasi perapan herba serai kunyit hidup, pencucukan lidi buluh berkadar upah harian, dan pembekalan bilik sejuk (chiller & freezer).

### Matlamat Utama Sistem
- Menghapuskan pembaziran daging melalui pengesanan kadar hasil (*trimming yield %*).
- Mengagregatkan giliran bakar sate secara masa nyata untuk Pitmaster melalui KDS live.
- Mengautomasikan pengiraan upah pencucuk 'piece-rate' (*RM 0.08 / cucuk*).
- Menjamin operasi tanpa henti di Pulau Indah melalui mod *PWA Offline-First*.

---

## 2. Skop Produk & Pengguna Sasaran (User Roles)

| Peranan (Role) | Akses & Tanggungjawab Utama | Modul Terlibat |
| :--- | :--- | :--- |
| **Juruwang / Floor Staff** | Mengambil pesanan meja (M-01–M-16), bungkus, mengutip bayaran DuitNow/Tunai, kiraan kuah percuma. | `/pos` |
| **Pitmaster (Bakar Sate)** | Melihat penjumlahan cucuk aktif di atas bara arang secara masa nyata, menukar status siap bakar. | `/kitchen` |
| **Tukang Masak Wok/Soto** | Menyediakan hidangan panas (soto, mee goreng, bihun goreng) mengikut nota khas pesanan. | `/kitchen` |
| **Pengurus Kilang Sate** | Merekod timbangan daging kasar vs susut urat (yield %), menguruskan formula perap & stok chiller. | `/production` |
| **Pekerja Mencucuk** | Mencatat output cucuk sate harian untuk pengiraan gaji 'piece-rate' (RM 0.08 / cucuk). | `/production` |
| **Pemilik / Pengurusan** | Memantau penyata Z-Report harian, audit varians stok chiller vs duit jualan, simulasi kos se-cucuk. | `/reports` |

---

## 3. Keperluan Fungsian (Functional Requirements)

### FR-1: Barisan Pengeluaran Sate & Hasil Timbangan Daging
Sistem membenarkan input berat kasar (kg) daging ayam/lembu/kambing, merekod susut potongan lemak/tulang (trim loss), dan mengira kadar hasil bersih (Yield %) secara automatik. Sistem wajib mengira anggaran bilangan cucuk (standard 25g/lidi) dan menjana kod perap kelompok.

### FR-2: Pengurusan Upah Mencucuk Sate (Piece-Rate Wage)
Sistem merekod output cucuk setiap pekerja mengikut syif (pagi/petang) dan mengira bayaran upah secara automatik pada kadar standard (cth. RM 0.08 / cucuk sate ayam; RM 0.09 / cucuk daging), serta mengemaskini baki stok sedia ada di bilik sejuk.

### FR-3: Pemindahan Stok Chiller ke Dapur Bakar
Sistem menyediakan fungsi *Internal Requisition* untuk memindahkan stok sate siap dari Chiller Kilang ke Stesen Dapur Bakar dengan sekali klik, memastikan audit varians harian tepat.

### FR-4: POS Kaunter Sentuh Laju & Meja Makan
Antara muka POS mesra tablet dengan butang sentuh bersaiz minimum 48px, menyokong pemilihan meja (M-01 s/d M-16) dan pesanan Bungkus. Sistem mengira kuah kacang & timun percuma secara automatik (1 set bagi setiap gandaan 10 cucuk).

### FR-5: Pemisahan Tiket Automatik Dapur Pintar (Multi-Station KDS)
Pesanan yang dibayar dipecahkan secara automatik ke stesen berkaitan: Stesen Sate Arang (mengagregatkan jumlah cucuk aktif), Stesen Wok & Soto (hidangan goreng kuali dan sup), dan Bar Minuman/Kuah.

### FR-6: Modul Borong Sate Beku (B2B) & Katering Acara
Menguruskan inventori sate beku pek vakum (20s & 50s) untuk kantin kilang Pelabuhan Klang dan merekod jadual katering pitmaster bakar live di majlis kenduri.

### FR-7: Penyata Tutup Kaunter (Z-Report) & Kos Se-Cucuk
Menyediakan laporan rekonsiliasi tunai laci vs DuitNow QR vs Kad, perbandingan stok keluar vs jualan duit (varians audit), dan simulasi kos sebenar se-cucuk sate (daging mentah + yield + lidi + rempah + upah + arang).

---

## 4. Keperluan Bukan Fungsian (Non-Functional Requirements)

- **Ketahanan Luar Talian (Offline):** Dilengkapi PWA Service Worker (`/sw.js`) dan cache IndexedDB tempatan bagi membolehkan staf meneruskan pesanan semasa talian telekomunikasi Pulau Indah terputus.
- **Prestasi & Latensi:** Masa muat turun muka surat < 1.0 saat, dihoskan di nod pinggir Vercel rantau Singapura (`sin1`) untuk latensi < 25ms.
- **Kebolehsambungan Peranti:** Responsif pada pelbagai peranti: Tablet Android 10 inci di dapur, iPad kaunter, dan telefon pintar pemilik.
- **Ketahanan Persekitaran Dapur:** Paparan kontras tinggi (*Dark Theme*) dengan zon sentuh besar untuk memudahkan staf dengan sarung tangan atau tangan berkuah/minyak.
