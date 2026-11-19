# Nipah Satay™ Business Management System (BMS)
## Laporan Kemajuan Projek (Progress Update Report) • November 2026

- **Organisasi:** Nipah Satay, Pulau Indah, Klang, Selangor
- **Dokumen PDF:** [Muat Turun PDF (docs/Nipah_Satay_Project_Progress_Update.pdf)](./Nipah_Satay_Project_Progress_Update.pdf)
- **URL Pengeluaran:** [https://nipah-satay-bms.vercel.app](https://nipah-satay-bms.vercel.app)
- **Cawangan Git:** `main` (GitHub: `aku18xy/nipah-satay`)

---

## 1. Status Penyiapan Modul Perisian

| Modul Sistem | Laluan (Route) | Ciri Utama Siap | Status |
| :--- | :--- | :--- | :--- |
| **Pusat Kawalan (Dashboard)** | `/` | Snapshot dua operasi (Restoran vs Kilang), metrik giliran sate api, stok chiller, dan hasil daging. | **Siap (Live)** |
| **POS Kaunter & Meja** | `/pos` | Katalog sate & hidangan panas, pilihan meja M-01 s/d M-16, bungkus, DuitNow QR modal, baki tunai. | **Siap (Live)** |
| **Dapur Pintar (KDS Live)** | `/kitchen` | Penjumlahan cucuk sate api arang (Pitmaster queue), stesen kuali soto/mee goreng, stesen minuman. | **Siap (Live)** |
| **Kilang Pemprosesan Sate** | `/production` | Kalkulator yield daging (kotor vs bersih), log upah pekerja (RM 0.08/lidi), butang pindah stok ke dapur. | **Siap (Live)** |
| **Borong & Katering Acara** | `/wholesale` | Stok sate beku vakum (20s & 50s), rekod tempahan katering live kenduri & integrasi WhatsApp. | **Siap (Live)** |
| **Laporan Z-Report & Kos** | `/reports` | Penyata tutup kaunter harian, audit varians stok chiller vs duit jualan, simulator untung se-cucuk. | **Siap (Live)** |
| **Menu Awam Pelanggan** | `/menu` | Katalog digital untuk pelanggan takeaway & tempahan kenduri dengan WhatsApp checkout. | **Siap (Live)** |

---

## 2. Metrik Infrastruktur & Pengesahan Binaan

- **Penyedia Cloud:** Vercel Production (Edge Serverless) di nod rantau Singapura (`sin1`).
- **Domain Pengeluaran:** `https://nipah-satay-bms.vercel.app` (Disahkan status HTTP 200 OK).
- **Rangka Kerja:** Next.js 16.4.6 (App Router) + React 19 + Tailwind CSS.
- **Penyusunan Laluan:** 7 laluan dipra-jana sepenuhnya (*Static Prerender*).
- **PWA & Ketahanan Luar Talian:** Dilengkapi `/manifest.json`, `/sw.js`, dan pengesan status online/offline untuk ketahanan di Pulau Indah.
- **Kawalan Versi:** GitHub repositori `aku18xy/nipah-satay`.

---

## 3. Tindakan Seterusnya (Next Steps)

1. **Ujian Lapangan di Restoran Pulau Indah:** Pemasangan PWA pada tablet kaunter dan skrin tablet stesen dapur sate.
2. **Integrasi Pencetak Terma:** Pengujian modul pencetak resit terma 80mm ESC/POS untuk pengeluaran tiket pesanan secara automatik.
3. **Latihan Staf Pemprosesan Sate:** Pengenalan antaramuka timbangan yield daging dan log upah mencucuk kepada Kak Linda & pekerja kilang.
