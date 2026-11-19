# Nipah Satay™ Business Management System (BMS)
## Pelan Hala Tuju Pelaksanaan (Implementation Roadmap) • 2026-2027

- **Organisasi:** Nipah Satay, Pulau Indah, Klang, Selangor
- **Dokumen PDF:** [Muat Turun PDF (docs/Nipah_Satay_Implementation_Roadmap.pdf)](./Nipah_Satay_Implementation_Roadmap.pdf)
- **URL Pengeluaran:** [https://nipah-satay-bms.vercel.app](https://nipah-satay-bms.vercel.app)

---

## Fasa Pelaksanaan Berperingkat

### FASA 1: Teras POS, KDS & Penyahpepijatan Cloud
- **Status:** **SELESAI & AKTIF (LIVE)** • *Nov 2026*
- Pembangunan seni bina Next.js 16 (App Router) & Tailwind CSS.
- Penyediaan modul POS Meja Dinamik (M-01–M-16) & Pesanan Bungkus.
- Pemisahan tiket KDS: Stesen Arang Pitmaster vs Wok Soto vs Bar Minuman.
- Penerbitan ke Vercel Edge Serverless ([https://nipah-satay-bms.vercel.app](https://nipah-satay-bms.vercel.app)).
- Integrasi Web App Manifest & Service Worker untuk PWA Pulau Indah.

### FASA 2: Barisan Pengeluaran Kilang & Timbangan Daging
- **Status:** **SEDANG BERJALAN (IN PROGRESS)** • *Dis 2026*
- Pelaksanaan penuh log kadar hasil trimming daging lembu, ayam dan kambing.
- Kiraan automatik upah pekerja mencucuk 'piece-rate' (RM 0.08 / cucuk).
- Penyegerakan pemindahan stok chiller kilang ke dapur bakar.
- Ujian rintis tablet tahan lasak di bilik pemprosesan sate.

### FASA 3: Integrasi Pencetak Resit & Pangkalan Data Realtime
- **Status:** **DIRANCANG** • *Jan - Feb 2027*
- Penyambungan pencetak terma ESC/POS LAN/Bluetooth di kaunter & pit sate.
- Penyambungan pangkalan data Supabase (PostgreSQL) zon Singapura (`sin1`).
- Penyegerakan pesanan dua hala luar talian (Dexie.js / IndexedDB) ke cloud.
- Sistem penjejakan suhu bilik sejuk automatik (IoT Thermometer Alert).

### FASA 4: Hab Borong B2B & Tempahan Katering Pitmaster
- **Status:** **DIRANCANG** • *Mac - Mei 2027*
- Portal tempahan ejen untuk pek vakum sate beku (20s & 50s).
- Sistem sebut harga katering kenduri & kutipan deposit automatik via FPX.
- Jadual pembakar sate bergerak (*mobile live pitmaster roster*).

### FASA 5: Analisis AI & Pembekalan Berpusat (Central Kitchen)
- **Status:** **DIRANCANG** • *Jun - Dis 2027*
- Ramalan pintar keperluan cucukan sate harian berasaskan cuaca & cuti umum.
- Sokongan multi-cawangan jika membuka kios/cawangan baru di Shah Alam/Klang.
- Integrasi inventori pembekal arang kayu bakau dan lidi buluh secara automatik.

---

## Jadual Matriks Keutamaan & Sasaran KPI

| Pencapaian (Milestone) | Sasaran Masa | KPI Utama | Status Semasa |
| :--- | :--- | :--- | :--- |
| **M1: POS & KDS Dapur** | Nov 2026 | Pesanan dihantar ke pitmaster < 2 saat | **100% Siap (Live)** |
| **M2: Hasil Kilang Daging** | Dis 2026 | Kadar susut daging dikesan < 10% | **75% Siap** |
| **M3: ESC/POS Thermal Print** | Feb 2027 | Cetak tiket dapur tanpa kabel | Dirancang |
| **M4: B2B Sate Beku** | Apr 2027 | Jualan 5,000 cucuk sate beku sebulan | Dirancang |
| **M5: Multi-Branch Ready** | Dis 2027 | Sistem sedia untuk cawangan kedua | Dirancang |
