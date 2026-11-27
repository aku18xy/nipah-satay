# Nipah Satay™ Business Management System (BMS)
## Software Requirements Specification (SRS) • Versi 2.0.0
### Dokumen Spesifikasi Keperluan Perisian & Perincian Modul Sistem

- **Organisasi:** Nipah Satay, Laguna Park, Pulau Indah, Klang, Selangor
- **Sistem:** Next.js 16 (App Router) + Tailwind CSS v3 + PWA + Neon PostgreSQL Serverless
- **Status:** Diluluskan & Aktif di Pengeluaran (Live Production)
- **URL Pengeluaran:** [https://nipah-satay.vercel.app](https://nipah-satay.vercel.app)
- **Cawangan Git:** `main` (GitHub: `aku18xy/nipah-satay`)
- **Talian Hotline Rasmi:** 017 365 9302 (WhatsApp & Panggilan)
- **Waktu Operasi:** 3.00 PM – 11.00 PM (Ahad Cuti)
- **Dokumen PDF Rasmi:** [Nipah_Satay_Software_Requirements_Specification_SRS.pdf](./Nipah_Satay_Software_Requirements_Specification_SRS.pdf)

---

## 1. Pengenalan & Latar Belakang Perniagaan

Nipah Satay™ merupakan perniagaan warisan keluarga sejak tahun 1990 yang beroperasi di Laguna Park, Pulau Indah, Klang. Perniagaan ini beroperasi berasaskan model hibrid dwi-sayap yang unik:
1. **Restoran Terbuka F&B:** Menyajikan sate bakar arang asli (Ayam, Daging Lembu, Kambing, Perut), hidangan kuali panas (Soto herba, Mee Rebus, Mee Goreng, Bihun Goreng), Nasi Lemak daun pisang, Karipap buatan tangan, dan aneka minuman segar.
2. **Barisan Kilang Pemprosesan Sate:** Bersebelahan premis restoran, mengendalikan penerimaan daging pukal, pemotongan dan pembuangan lemak keras (*trimming*), formulasi rempah perapan serai kunyit hidup, pencucukan lidi buluh berkadar upah harian (*piece-rate*), serta pengurusan inventori bilik sejuk (*chiller* dan *freezer*).

### Matlamat Utama Sistem
- Menghapuskan pembaziran dan ketirisan bahan mentah melalui pemantauan kadar hasil daging (*trimming yield %*).
- Mempercepatkan aliran pesanan restoran melalui konsep aliran kerja **"Makan Dulu, Bayar Kemudian"** (*Table Tab Management*).
- Mengagregatkan giliran cucuk sate di atas bara arang secara masa nyata (*real-time*) untuk Pitmaster melalui Skrin KDS.
- Mengautomasikan pengiraan upah harian pekerja mencucuk berasaskan output (*piece-rate*).
- Menjamin kerahsiaan kewangan dan kos sulit unit melalui sistem kawalan keselamatan berasaskan peranan (*Role-Based Access Control*).
- Menjamin kesinambungan operasi tanpa henti di Pulau Indah melalui mod *PWA Offline-First*.

---

## 2. Model Keselamatan & Pengesahan Peranan (Role-Based Access Control - RBAC)

Sistem menguatkuasakan kawalan capaian berasaskan peranan secara automatik sejak peringkat pemulaan sistem (*initialization*):

| Peranan (Role) | Kod Peranan | Akses Tab Bawah & Menu | Kawalan Keselamatan | Modul Terlibat |
| :--- | :--- | :--- | :--- | :--- |
| **Pengurus / Eksekutif** | `executive` | **Semua 5 Tab & Halaman:** Utama, POS, Dapur, Kilang, Laporan | **Satu-satunya akses ke Halaman Utama & Laporan (PIN: `1990` / `1234`)** | Semua Modul (`/`, `/pos`, `/kitchen`, `/production`, `/wholesale`, `/reports`) |
| **Juruwang & Kaunter** | `cashier` | **2 Tab Sahaja:** POS Kaunter, Dapur KDS | Dihadkan; disekat daripada Utama (`/`), Laporan Eksekutif & Kilang | `/pos`, `/kitchen`, `/wholesale`, `/menu` |
| **Pitmaster & Dapur KDS** | `kitchen` | **1 Tab Sahaja:** Dapur KDS | Dihadkan; disekat daripada Utama (`/`), POS, Kilang, dan Laporan | `/kitchen`, `/menu` |
| **Pekerja Kilang Sate** | `production` | **1 Tab Sahaja:** Kilang Sate | Dihadkan; disekat daripada Utama (`/`), POS, Dapur, dan Laporan | `/production`, `/wholesale`, `/menu` |

### Ciri Keselamatan RBAC:
1. **Modal Pemulaan (Initialization Modal):** Ditampilkan secara automatik jika peranti belum menetapkan peranan staf atau apabila staf menekan butang lencana peranan untuk bertukar syif.
2. **Eksklusiviti Halaman Utama (`/`):** Halaman Utama (Pusat Kawalan Operasi) hanya boleh diakses oleh Eksekutif. Petugas juruwang, dapur, dan kilang akan dihalakan (*auto-redirect*) terus ke modul kerja masing-masing (/pos, /kitchen, /production).
3. **Penapisan Tab Dinamik (Dynamic BottomNav & Header):** Bar navigasi bawah telefon pintar dan pautan menu atas menyembunyikan sepenuhnya tab yang tidak dibenarkan bagi peranan tersebut.
4. **Pengawal Laluan URL (Security Route Guard):** Percubaan membuka halaman terhad (`/` dan `/reports`) oleh staf bukan Eksekutif akan memaparkan skrin sekatan berserta butang log masuk PIN Eksekutif.
3. **Pengawal Laluan URL (Security Route Guard):** Percubaan membuka halaman terhad (cth: `/reports`) oleh staf bukan Eksekutif akan memaparkan skrin sekatan **"Laporan Eksekutif Terhad"** berserta butang log masuk PIN Eksekutif.

---

## 3. Spesifikasi Terperinci Setiap Modul Sistem

### Modul 1: Pusat Kawalan Eksekutif & Ringkasan Operasi (`/`)
* **Tujuan:** Menyediakan pandangan menyeluruh 360° operasi restoran dan kilang dalam satu papan pemuka eksekutif.
* **Ciri-Ciri Utama:**
  - **Status Operasi Semasa:** Menampilkan penunjuk waktu operasi rasmi (3.00 PM – 11.00 PM, Ahad Cuti) dan talian sokongan (017 365 9302).
  - **Metrik Jualan Masa Nyata:** Jumlah kutipan jualan POS hari ini, perbandingan peratusan dengan hari sebelumnya (+18.4%), dan status transaksi.
  - **Giliran Api Sate Semasa:** Menunjukkan baki cucuk sate yang sedang dibakar di atas arang oleh Pitmaster daripada pesanan aktif.
  - **Inventori Siap Bilik Sejuk (Chiller):** Jumlah baki cucuk sate sedia bakar (Ayam: 1,850 cucuk, Lembu: 940 cucuk, Kambing, Perut).
  - **Kadar Hasil Trimming Daging Semasa:** Peratusan hasil daging bersih (cth: 91.6%) dan rekod sisa susut (*waste kg*).
  - **Log Operasi Meja & Bil Terkini:** Menampilkan status meja sedang makan, masa pesanan, dan jumlah bil terkini.
  - **Pautan Pantas:** Akses terus satu-klik ke `POS Pesanan Baru` dan `Skrin KDS Dapur`.

---

### Modul 2: POS Kaunter & Pengurusan Meja Dinamik (`/pos`)
* **Tujuan:** Membolehkan juruwang dan pelayan menguruskan pesanan meja (*Dine-In*) dan bungkus (*Takeaway*) secara pantas, padat dan minimalis.
* **Aliran Kerja: "Makan Dulu, Bayar Kemudian" (*Table Tab Management*):**
  Pelanggan masuk dan duduk di meja ➔ Pelayan mengambil pesanan pada tablet ➔ Pesanan dihantar ke dapur tanpa bayaran ➔ Pelanggan boleh menambah pesanan (*repeat order*) pada bila-bila masa ➔ Juruwang mengira bil dan menerima bayaran hanya apabila pelanggan selesai makan.
* **Skrin 1 — Pilihan Meja & Bungkus (Minimalis & Jimat Ruang):**
  - **Header Padat:** Menampilkan penunjuk ringkas `🔥 POS`, status meja aktif (`🟢 X Kosong`, `🟡 Y Makan`), dan butang pesanan bungkus `[+ Bungkus]`.
  - **Jalur Pesanan Bungkus Aktif:** Hanya dipaparkan apabila wujud pesanan bungkus yang belum selesai. Menampilkan nombor tiket, nama pelanggan, jumlah bil, status bayaran (*Belum Bayar / Lunas*), butang pantas `[Bayar]`, `[Selesai]`, dan `[+]` untuk tambah menu.
  - **Grid Meja 4-Sebaris Melintang Segi Empat Sama (`aspect-square`):**
    - Menyusun meja Meja M1 hingga M12 dan VIP dalam nisbah 1:1 segi empat sama yang seragam merentasi semua peranti.
    - **Meja Kosong:** Memaparkan kod meja (`M1`) dan lampu penunjuk bulat hijau (🟢).
    - **Meja Diduduki:** Memaparkan kod meja (`M4`), lampu penunjuk bulat oren/kuning (🟡), jumlah harga semasa (`RM 32`), dan bilangan item (`20 item`).
    - **Klik Terus ke Menu:** Menekan mana-mana kotak meja (sama ada kosong atau diduduki) terus menavigasi ke paparan katalog menu (Skrin 2).
* **Skrin 2 — Katalog Menu, Penambahan Item & Kira Bil:**
  - **Header Navigasi Sebaris:** Menggabungkan butang kembali `[← Meja]`, label meja (`M4`), butang pantas kira bil `[Bil RM 32]`, kotak carian pantas `[Cari...]`, butang togol kategori `[ 📂 Sate ▾ ]`, dan butang tetapan susunan grid (3/4 sebaris, saiz ikon kecil/sedang/besar).
  - **Drawer Kategori Vertikal Kiosk (*KFC Kiosk Style Auto-Hide*):** Panel menu vertikal langsing sebelah kiri (`w-60`) yang memaparkan 6 kategori utama (`🔥 Semua`, `🍢 Sate`, `🍲 Sup/Mee`, `🍙 Nasi`, `🥟 Karipap`, `🥤 Air`) berserta jumlah hidangan. Mempunyai ciri *auto-hide* di mana panel ditutup secara automatik sebaik sahaja kategori dipilih.
  - **Kad Menu 4-Sebaris Melintang Mengikut Lakaran:**
    - Kotak segi empat berbingkai dengan ikon emoji sajian di bahagian atas.
    - Label nama hidangan di bawah (`Satay ayam`).
    - Harga ringkas di bahagian bawah (`RM 1.20`).
    - Stepper kuantiti padat `[-] qty [+]` apabila item dipilih.
  - **Bar Tindakan Bawah Terapung (Floating Action Bar):**
    - Memaparkan ringkasan troli `🛒 {jumlah} item • RM {subtotal}`.
    - **Jika Meja Sedang Makan (Troli Kosong):** Menampilkan butang hijau besar **`[Kira Bil RM XX]`** untuk terus membuka modal bayaran.
    - **Jika Menambah Makanan Baru:** Menampilkan butang **`[➔ Hantar Tambahan]`** ke dapur.
    - **Bagi Pesanan Bungkus:** Menyediakan pilihan **`[Hantar (Bayar Nanti)]`** atau **`[Bayar Terus 💳]`**.
* **Modal Bayaran Berbilang Kaedah:**
  - Menyokong Tunai (dengan cadangan amaun pantas dan kiraan baki pulangan automatik), DuitNow QR Pay, dan Kad Bank.
  - Selepas bayaran disahkan, resit direkodkan dan meja dikosongkan secara automatik.

---

### Modul 3: Dapur Pintar (Kitchen Display System - KDS Live `/kitchen`)
* **Tujuan:** Mengagregatkan dan menyelaraskan penyediaan hidangan di dapur secara masa nyata tanpa pesanan kertas yang mudah hilang.
* **Pemisahan Tiket Stesen Dapur Automatik:**
  1. 🔥 **Stesen Bakar Sate (Pitmaster Charcoal Grill):** Mengagregatkan kuantiti cucuk sate aktif di atas bara arang kayu bakau mengikut jenis daging: Sate Ayam, Sate Daging Lembu, Sate Kambing, dan Sate Perut.
  2. 🍳 **Stesen Wok & Soto (Kuali Panas):** Memaparkan pesanan Soto Ayam, Mee Rebus, Mee Goreng, Bihun Goreng, Ketupat, dan Kuah Kacang tambahan berserta nota khas pelanggan (cth: *kuah asing, pedas*).
  3. 🥤 **Bar Minuman & Karipap:** Memaparkan pesanan air sejuk/panas (Teh Tarik, Kopi O, Sirap Bandung, Lai Chee Kang) dan Karipap Panas.
* **Ciri-Ciri KDS:**
  - **Penjejak Masa Pesanan:** Memaparkan jangka masa menunggu pelanggan dengan kod warna amaran (Hijau: < 10 min, Kuning: 10–20 min, Merah Berkelip: > 20 min).
  - **Kawalan Status Aliran Kerja:** Butang peralihan status: `Mula Masak` ➔ `Siap Dibakar/Dimasak` ➔ `Selesai Dihidang`.
  - **Penyegerakan Automatik:** Melakukan auto-polling setiap 4 saat ke pangkalan data awam Neon PostgreSQL.

---

### Modul 4: Kilang Pemprosesan Sate & Bilik Sejuk (`/production`)
* **Tujuan:** Mengawal kualiti bahan mentah daging, mengira kadar susut trimming, merekod output cucukan pekerja harian, dan mengurus stok bilik sejuk.
* **Ciri-Ciri Utama:**
  1. **Kalkulator Kadar Hasil Timbangan Daging (Trimming Yield %):**
     - Merekod berat timbangan kasar daging (ayam segar, daging pejal, kambing import, perut) dalam kg.
     - Merekod berat susut potongan urat, lemak tebal dan tulang (*trim waste kg*).
     - Mengira berat daging bersih sedia perap dan kadar hasil (*Yield %*).
     - Mengira anggaran output bilangan cucuk standard (25 gram daging se-lidi).
     - Amaran automatik sekiranya kadar susut melebihi penanda aras piawai 10%.
  2. **Log Upah Pekerja Mencucuk Sate (*Piece-Rate Wages*):**
     - Antaramuka sentuhan pantas berserta butang gergasi stepper `-50` / `+50` untuk kegunaan pekerja di bilik cucuk sate.
     - Mengira upah harian secara automatik mengikut kadar rasmi:
       - Sate Ayam: RM 0.08 / cucuk
       - Sate Daging Lembu: RM 0.09 / cucuk
       - Sate Kambing: RM 0.10 / cucuk
       - Sate Perut: RM 0.10 / cucuk
     - Mengunci rekod mengikut tarikh dan nama pekerja bagi tujuan pembayaran gaji mingguan.
  3. **Pengurusan Stok Bilik Sejuk (*Chiller & Freezer Management*):**
     - Memantau baki semasa stok sate cucuk segar di dalam Chiller Kilang (suhu 0°C–4°C).
     - **Fungsi Pemindahan Dalaman (*Internal Requisition*):** Membolehkan pemindahan stok sate dari Chiller Kilang ke Stesen Dapur Bakar dengan satu klik bagi tujuan audit harian.

---

### Modul 5: Borong B2B & Tempahan Katering Pitmaster (`/wholesale`)
* **Tujuan:** Menguruskan jualan borong sate beku pek vakum kepada kantin/ejen serta tempahan katering majlis kenduri dan korporat.
* **Ciri-Ciri Utama:**
  1. **Pengurusan Produk Sate Beku & Karipap Frozen:**
     - Sate Beku Pek Vakum (Pek 20 cucuk & 50 cucuk berserta pek kuah kacang sejuk beku).
     - Karipap Frozen (Karipap Kentang RM 8.00/pek 10 biji; Karipap Sardin & Ayam RM 10.00/pek 10 biji).
     - Pengesanan baki stok paket dan status pesanan ejen.
  2. **Kalkulator & Sebut Harga Katering Acara (Live Pitmaster Catering):**
     - Pilihan pakej katering (Mini 300 cucuk, Standard 800 cucuk, Perdana 1,500+ cucuk).
     - Pilihan khidmat kru Pitmaster bakar panas di lokasi (*Live Charcoal Grill*).
     - Penambahan Nasi Impit, kuah kacang kawah, set pinggan dan bekas hidang.
     - Pengiraan jumlah sebut harga, deposit 50%, baki bayaran, dan penjanaan teks tempahan WhatsApp automatik untuk dihantar kepada pelanggan.

---

### Modul 6: Laporan Eksekutif, Z-Report & Analisis Kos (`/reports`)
* **Tujuan:** Menyediakan laporan kewangan sulit, rekonsiliasi penutupan kaunter harian, dan analisis kos terperinci se-cucuk sate.
* **Kawalan Akses:** Dilindungi sepenuhnya oleh pengesahan PIN Eksekutif (`1990`). Petugas biasa disekat daripada melihat data ini.
* **Ciri-Ciri Utama:**
  1. **Penyata Penutupan Kaunter Harian (*Z-Report*):**
     - Ringkasan jualan kasar, potongan harga, dan jualan bersih.
     - Pecahan mengikut mod bayaran: Tunai (*Cash in Drawer*), DuitNow QR Pay, dan Kad Bank.
     - Pengiraan varians tunai laci (jangkaan sistem vs kiraan tunai fizikal juruwang).
  2. **Simulasi Kos Se-Cucuk Interaktif (*Cost Per Stick Breakdown*):**
     - Parameter kos dinamik:
       - Harga daging mentah per kg (RM)
       - Peratusan kadar hasil (*Yield %*)
       - Kos rempah perapan herba serai & kunyit se-cucuk
       - Kos lidi buluh bergred
       - Upah mencucuk *piece-rate* pekerja
       - Kos arang kayu bakau se-cucuk
     - Kiraan automatik: Jumlah kos bersih se-cucuk, harga jualan rasmi, untung kasar se-cucuk (RM), dan margin keuntungan (%).
  3. **Audit Varians Stok Chiller vs Jualan POS:**
     - Membandingkan jumlah cucuk fizikal yang dikeluarkan daripada bilik sejuk dengan jumlah cucuk yang direkod dalam sistem POS bagi mengesan kehilangan sate atau pemberian tanpa rekod.

---

### Modul 7: Menu Awam Pelanggan & Pesanan WhatsApp (`/menu`)
* **Tujuan:** Menyediakan katalog menu digital moden yang boleh diakses oleh pelanggan melalui imbasan kod QR di atas meja atau media sosial.
* **Ciri-Ciri Utama:**
  - Paparan penuh 68 hidangan rasmi restoran berserta harga terkini.
  - Antaramuka mesra telefon pintar dengan visual gambar dan huraian ringkas.
  - Bakul pesanan pelanggan interaktif dengan butang penjana pesanan WhatsApp terus ke nombor hotline rasmi restoran (`017 365 9302`).

---

### Modul 8: Seni Bina Data & API REST (`/api/*` & Neon PostgreSQL)
* **Tujuan:** Menyimpan data operasi secara kekal di awan dengan sandaran tempatan bagi memastikan ketahanan sistem.
* **Struktur Pangkalan Data (Neon PostgreSQL Serverless):**
  - `orders`: Menyimpan rekod pesanan, jenis (*dine_in / takeaway*), nombor meja, senarai item hidangan, jumlah bil, status penyediaan dapur (*pending / preparing / ready / completed*), dan status bayaran (*paid / unpaid*).
  - `meat_intake`: Menyimpan rekod timbangan daging mentah, susut urat, berat bersih, peratusan hasil, dan tarikh pemprosesan kilang.
  - `worker_skewer_logs`: Menyimpan rekod output cucukan sate harian pekerja mengikut jenis daging dan jumlah upah terkumpul.
  - `chiller_inventory`: Menyimpan baki stok fizikal sate siap cucuk di dalam bilik sejuk kilang.
* **Laluan API Utama:**
  - `GET /api/orders` & `POST /api/orders` — Membaca dan mencipta pesanan POS baharu.
  - `GET /api/orders/[id]` & `PATCH /api/orders/[id]` — Mengemaskini status penyediaan atau pembayaran bil.
  - `GET /api/production` & `POST /api/production` — Mengurus rekod kilang dan upah mencucuk.
  - `GET /api/db/status` — Memeriksa status sambungan pangkalan data PostgreSQL secara langsung.
* **Sandaran Luar Talian (*Offline-First Graceful Fallback*):** Jika talian internet terputus di Pulau Indah, sistem beroperasi menggunakan memori tempatan (*Local Cache / Storage*) dan menyegerakkan data sebaik talian kembali pulih.

---

### Modul 9: Antaramuka Mesra Warga Emas & Keserasian PWA
* **Tujuan:** Memastikan perisian boleh digunakan dengan mudah oleh pekerja senior dan serasi dengan tablet generasi lama di restoran.
* **Ciri-Ciri Utama:**
  - **Suis Mod Warga Emas (`👓 A++`):** Butang togol pada bar tajuk atas yang membesarkan saiz teks dan meningkatkan ketajaman kontras warna untuk staf yang memerlukan bantuan penglihatan.
  - **Keserasian Pelayar Legasi (Legacy Browser Support):** Menggunakan Tailwind CSS v3 (`v3.4.19`) dan konfigurasi `browserslist` (Android >= 5, Chrome >= 50) bagi membolehkan aplikasi dipaparkan dengan sempurna pada tablet Android lama di restoran.
  - **Progressive Web App (PWA):** Dilengkapi Web App Manifest, ikon standard PNG WebAPK (192x192, 512x512, maskable), dan Service Worker Network-First untuk keupayaan pasang terus (*Add to Home Screen*) seperti aplikasi natif.

---

## 4. Keperluan Bukan Fungsian (Non-Functional Requirements)

1. **Kebolehpercayaan & Ketersediaan (Availability):**
   Sistem dihoskan pada seni bina *serverless* Vercel nod Singapura (`sin1`) dengan tahap ketersediaan sasaran 99.9% dan masa tindak balas pelayan < 50ms.
2. **Ketahanan Persekitaran Dapur & Minyak (Ergonomics):**
   Antaramuka menggunakan tema gelap kontras tinggi (*Dark Charcoal & Ember Orange Theme*) dengan sasaran sentuhan minimum 48px–56px bagi memudahkan staf mengendalikan skrin walaupun memakai sarung tangan atau jari berminyak.
3. **Integriti & Keselamatan Data (Data Security):**
   Semua transaksi disulitkan melalui HTTPS / TLS 1.3. Laporan eksekutif dilindungi oleh PIN staf, dan maklumat pangkalan data awan dilindungi oleh rentetan sambungan rahsia (*Environment Variables*).
4. **Kepantasan Penyegerakan Dapur (KDS Latency):**
   Masa penghantaran pesanan dari tablet pelayan di kaunter ke skrin pitmaster dapur adalah di bawah 2 saat.

---

*Dokumen ini merupakan spesifikasi rasmi keperluan perisian bagi Nipah Satay™ Business Management System (BMS), Pulau Indah, Klang, Selangor.*
