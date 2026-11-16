# Nipah Satay™ – Sistem Pengurusan Operasi & POS 🍢

> **Sistem Bersepadu Dapur Arang Warisan & Barisan Pengeluaran Sate (Pulau Indah, Klang)**

Aplikasi berasaskan **Next.js (App Router)**, **Tailwind CSS**, dan **PWA (Progressive Web App)** yang menghubungkan dua cabang perniagaan Nipah Satay:
1. **Restoran & Medan Makan:** Menjual sate bakar arang, soto asli, mee goreng panas, bihun goreng, nasi lemak daun pisang, kuih-muih & minuman.
2. **Kilang Pemprosesan Sate (Sebelah Restoran):** Menguruskan intake daging mentah, susut pemotongan (trimming yield), formula perapan serai kunyit, upah mencucuk pekerja (piece-rate), dan inventori bilik sejuk (chiller & freezer).

---

## 🌟 Modul Utama & Laluan (Routes)

| Laluan | Modul | Penerangan Utama |
| :--- | :--- | :--- |
| **`/`** | **Pusat Kawalan (Dashboard)** | Ringkasan KPI harian, giliran api sate, baki stok chiller, dan status dual-operasi. |
| **`/pos`** | **POS Kaunter & Meja** | Antara muka pesanan sentuh laju untuk *Dine-in* (Meja M-01 s/d M-16) & *Bungkus*, kiraan automatik kuah percuma, bayaran DuitNow QR / Tunai. |
| **`/kitchen`** | **Dapur Pintar (KDS Live)** | Pemisahan tiket automatik: 🔥 **Stesen Bakar Sate** (penjumlahan cucuk aktif untuk Pitmaster), 🍳 **Wok Soto & Goreng-Goreng**, dan 🥤 **Bar Minuman**. |
| **`/production`** | **Kilang Pemprosesan Sate** | Kalkulator kadar hasil daging (*Trimming Yield %*), sasaran cucuk (25g/lidi), log upah pekerja mencucuk (*RM 0.08/lidi*), dan pemindahan stok ke dapur restoran. |
| **`/wholesale`** | **Borong & Katering** | Pengurusan pek sate beku vakum (20s & 50s) untuk kantin kilang Pelabuhan Klang & slot tempahan katering bakar *live* kenduri. |
| **`/reports`** | **Kewangan & Z-Report** | Penyata tutup kaunter harian (Tunai, QR, Kad), audit varians sate keluar vs duit masuk, dan simulasi kos sebenar se-cucuk sate (*Cost Per Stick*). |
| **`/menu`** | **Menu Awam & Tempahan** | Katalog menu pelanggan untuk tempahan *Self-Pickup* atau *Delivery* dengan integrasi WhatsApp automatik. |

---

## 🚀 Ciri PWA (Progressive Web App) & Ketahanan Luar Talian

- **Installable PWA:** Boleh dipasang terus sebagai aplikasi pada tablet Android / iPad di kaunter bayaran atau stesen bakar tanpa perlu melalui App Store.
- **Offline Resilience:** Dilengkapi dengan *Service Worker* (`/sw.js`) dan pengesanan status sambungan (Online / Mod Luar Talian Pulau Indah) untuk memastikan operasi pesanan tidak tergendala jika internet terputus.

---

## 🛠️ Arahan Pembangunan Tempatan

```bash
# Pasang kebergantungan
npm install

# Jalankan pelayan pembangunan tempatan
npm run dev

# Uji binaan pengeluaran (Production Build)
npm run build
```

---

## 🌐 Penerbitan ke Vercel (Production)
Projek ini dikonfigurasikan untuk *Zero-Config Deployment* di **Vercel** melalui GitHub (`aku18xy/nipah-satay`). Setiap `git push` ke cawangan `main` akan memulakan proses binaan dan pengeluaran secara automatik di Vercel.
