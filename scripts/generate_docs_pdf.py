#!/usr/bin/env python3
"""
Nipah Satay™ PDF Document Generator
Generates:
1. Software Requirements Specification (SRS)
2. Implementation Roadmap
3. Project Progress Update Report
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# --- Numbered Canvas for "Page X of Y" and Running Header ---
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#78716c"))

        # Skip running header/footer on cover/first page
        if self._pageNumber > 1:
            # Header
            self.drawString(54, 800, "Nipah Satay™ Business Management System (BMS) — Pulau Indah, Klang")
            self.setStrokeColor(colors.HexColor("#e7e5e4"))
            self.setLineWidth(0.5)
            self.line(54, 794, 541, 794)

            # Footer
            self.line(54, 45, 541, 45)
            self.drawString(54, 32, "Confidential & Proprietary • Nipah Satay Enterprise (Since 1990)")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(541, 32, page_text)
        self.restoreState()


def get_custom_styles():
    base = getSampleStyleSheet()
    
    # Custom Brand Colors
    c_primary = colors.HexColor("#c2410c")      # Deep Ember Orange
    c_dark = colors.HexColor("#1c1917")         # Charcoal Dark
    c_muted = colors.HexColor("#57534e")        # Stone Muted Text
    c_accent = colors.HexColor("#b45309")       # Amber Gold

    styles = {
        'DocTitle': ParagraphStyle(
            'DocTitle',
            parent=base['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=c_dark,
            spaceAfter=6,
        ),
        'DocSubtitle': ParagraphStyle(
            'DocSubtitle',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            textColor=c_primary,
            spaceAfter=14,
        ),
        'MetaBox': ParagraphStyle(
            'MetaBox',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=c_muted,
        ),
        'H1': ParagraphStyle(
            'H1',
            parent=base['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=19,
            textColor=c_primary,
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True,
        ),
        'H2': ParagraphStyle(
            'H2',
            parent=base['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=15,
            textColor=c_dark,
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True,
        ),
        'H3': ParagraphStyle(
            'H3',
            parent=base['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=c_accent,
            spaceBefore=6,
            spaceAfter=2,
            keepWithNext=True,
        ),
        'Body': ParagraphStyle(
            'Body',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=c_dark,
            spaceAfter=6,
        ),
        'BodyBold': ParagraphStyle(
            'BodyBold',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13.5,
            textColor=c_dark,
            spaceAfter=6,
        ),
        'Bullet': ParagraphStyle(
            'Bullet',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=c_dark,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=3,
        ),
        'CalloutText': ParagraphStyle(
            'CalloutText',
            parent=base['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#7c2d12"),
        ),
        'TableHeader': ParagraphStyle(
            'TableHeader',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.white,
            alignment=0,
        ),
        'TableCell': ParagraphStyle(
            'TableCell',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=c_dark,
        ),
        'TableCellBold': ParagraphStyle(
            'TableCellBold',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=c_dark,
        ),
        'Badge': ParagraphStyle(
            'Badge',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.5,
            leading=9,
            textColor=colors.HexColor("#15803d"),
        )
    }
    return styles


def create_callout(text, styles):
    p = Paragraph(text, styles['CalloutText'])
    t = Table([[p]], colWidths=[487])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fff7ed")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#fdba74")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    return t


def build_srs_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_custom_styles()
    story = []

    # Title & Metadata Block
    story.append(Paragraph("NIPAH SATAY™ BUSINESS MANAGEMENT SYSTEM", styles['DocTitle']))
    story.append(Paragraph("Software Requirements Specification (SRS) • Versi 1.0.0", styles['DocSubtitle']))
    
    meta_data = [
        [
            Paragraph("<b>Organisasi:</b> Nipah Satay (Pulau Indah, Klang)", styles['MetaBox']),
            Paragraph("<b>Sistem:</b> Next.js + PWA Dual-Operation BMS", styles['MetaBox']),
        ],
        [
            Paragraph("<b>Penulis / Pasukan:</b> Advanced Systems Engineering", styles['MetaBox']),
            Paragraph("<b>Status:</b> Diluluskan / Aktif di Pengeluaran", styles['MetaBox']),
        ],
        [
            Paragraph("<b>URL Pengeluaran:</b> https://nipah-satay-bms.vercel.app", styles['MetaBox']),
            Paragraph("<b>Repositori:</b> github.com/aku18xy/nipah-satay", styles['MetaBox']),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[243, 244])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fafaf9")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e7e5e4")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f5f5f4")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 1. Pengenalan
    story.append(Paragraph("1. Pengenalan & Latar Belakang Perniagaan", styles['H1']))
    story.append(Paragraph(
        "Nipah Satay™ merupakan perniagaan warisan keluarga sejak tahun 1990 yang berpangkalan di Laguna Park, Pulau Indah, Klang. "
        "Operasi perniagaan ini memiliki keunikan model hibrid: <b>Restoran Terbuka F&B</b> (menjual sate bakar arang, soto asli, mee/bihun goreng, "
        "nasi lemak daun pisang dan minuman) berserta <b>Barisan Kilang Pemprosesan Sate</b> di sebelah premis yang mengendalikan penerimaan "
        "daging pukal, formulasi perapan herba serai kunyit, pencucukan lidi buluh, dan pembekalan bilik sejuk (chiller/freezer).",
        styles['Body']
    ))
    story.append(create_callout(
        "<b>Matlamat Utama SRS:</b> Menghapuskan pembaziran daging melalui pengesanan kadar hasil (yield %), "
        "mempercepatkan giliran bakaran pitmaster melalui KDS live, mengautomasikan upah pencucuk 'piece-rate', dan menjamin "
        "operasi tanpa henti di Pulau Indah walaupun sambungan internet terputus.",
        styles
    ))
    story.append(Spacer(1, 10))

    # 2. Skop Produk & Pengguna Sasaran
    story.append(Paragraph("2. Skop Produk & Pengguna Sasaran (User Roles)", styles['H1']))
    roles_data = [
        [Paragraph("Peranan (Role)", styles['TableHeader']), Paragraph("Akses & Tanggungjawab Utama", styles['TableHeader']), Paragraph("Modul Terlibat", styles['TableHeader'])],
        [Paragraph("Juruwang / Floor Staff", styles['TableCellBold']), Paragraph("Mengambil pesanan meja (M-01–M-16), bungkus, mengutip bayaran DuitNow/Tunai, kiraan kuah percuma.", styles['TableCell']), Paragraph("POS Kaunter (/pos)", styles['TableCell'])],
        [Paragraph("Pitmaster (Bakar Sate)", styles['TableCellBold']), Paragraph("Melihat penjumlahan cucuk aktif di atas bara arang secara masa nyata, menukar status siap bakar.", styles['TableCell']), Paragraph("KDS Grill (/kitchen)", styles['TableCell'])],
        [Paragraph("Tukang Masak Wok/Soto", styles['TableCellBold']), Paragraph("Menyediakan hidangan panas (soto, mee goreng, bihun goreng) mengikut nota khas pesanan.", styles['TableCell']), Paragraph("KDS Wok (/kitchen)", styles['TableCell'])],
        [Paragraph("Pengurus Kilang Sate", styles['TableCellBold']), Paragraph("Merekod timbangan daging kasar vs susut urat (yield %), menguruskan formula perap & stok chiller.", styles['TableCell']), Paragraph("Kilang Sate (/production)", styles['TableCell'])],
        [Paragraph("Pekerja Mencucuk", styles['TableCellBold']), Paragraph("Mencatat output cucuk sate harian untuk pengiraan gaji 'piece-rate' (RM 0.08 / cucuk).", styles['TableCell']), Paragraph("Kilang Sate (/production)", styles['TableCell'])],
        [Paragraph("Pemilik / Pengurusan", styles['TableCellBold']), Paragraph("Memantau penyata Z-Report harian, audit varians stok chiller vs duit jualan, simulasi kos se-cucuk.", styles['TableCell']), Paragraph("Laporan & Kos (/reports)", styles['TableCell'])],
    ]
    t_roles = Table(roles_data, colWidths=[110, 267, 110])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#c2410c")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#d6d3d1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f5f5f4")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#fafaf9")]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_roles)
    story.append(Spacer(1, 12))

    # 3. Keperluan Fungsi (Functional Requirements)
    story.append(Paragraph("3. Keperluan Fungsian Sistem (Functional Requirements)", styles['H1']))
    
    fr_items = [
        ("FR-1: Barisan Pengeluaran Sate & Hasil Timbangan Daging",
         "Sistem mestilah membenarkan input berat kasar (kg) daging ayam/lembu/kambing, merekod susut potongan lemak/tulang (trim loss), "
         "dan mengira kadar hasil bersih (Yield %) secara automatik. Sistem wajib mengira anggaran bilangan cucuk (25g/lidi) dan menjana kod perap kelompok."),
        ("FR-2: Pengurusan Upah Mencucuk Sate (Piece-Rate Wage)",
         "Sistem wajib merekod output cucuk setiap pekerja mengikut syif (pagi/petang) dan mengira bayaran upah secara automatik pada kadar standard "
         "(cth. RM 0.08 / cucuk sate ayam; RM 0.09 / cucuk daging), serta mengemaskini baki stok sedia ada di bilik sejuk."),
        ("FR-3: Pemindahan Stok Chiller ke Dapur Bakar",
         "Sistem mesti menyediakan fungsi 'Internal Requisition' untuk memindahkan stok sate siap dari Chiller Kilang ke Stesen Dapur Bakar "
         "dengan sekali klik, memastikan audit varians harian tepat."),
        ("FR-4: POS Kaunter Sentuh Laju & Meja Makan",
         "Antara muka POS mesti mesra tablet dengan butang sentuh bersaiz minimum 48px, menyokong pemilihan meja (M-01 s/d M-16) dan pesanan Bungkus. "
         "Sistem wajib mengira kuah kacang & timun percuma secara automatik (1 set bagi setiap gandaan 10 cucuk)."),
        ("FR-5: Pemisahan Tiket Automatik Dapur Pintar (Multi-Station KDS)",
         "Pesanan yang dibayar mesti dipecahkan secara automatik ke stesen berkaitan: Stesen Sate Arang (mengagregatkan jumlah cucuk aktif), "
         "Stesen Wok & Soto (hidangan goreng kuali dan sup), dan Bar Minuman/Kuah."),
        ("FR-6: Modul Borong Sate Beku (B2B) & Katering Acara",
         "Menguruskan inventori sate beku pek vakum (20s & 50s) untuk kantin kilang Pelabuhan Klang dan merekod jadual katering pitmaster bakar live di majlis kenduri."),
        ("FR-7: Penyata Tutup Kaunter (Z-Report) & Kos Se-Cucuk",
         "Menyediakan laporan rekonsiliasi tunai laci vs DuitNow QR vs Kad, perbandingan stok keluar vs jualan duit (varians audit), "
         "dan simulasi kos sebenar se-cucuk sate (daging mentah + yield + lidi + rempah + upah + arang).")
    ]
    for code_title, desc in fr_items:
        story.append(Paragraph(f"<b>{code_title}</b>", styles['H2']))
        story.append(Paragraph(desc, styles['Body']))

    story.append(Spacer(1, 10))

    # 4. Keperluan Bukan Fungsian (Non-Functional Requirements)
    story.append(Paragraph("4. Keperluan Bukan Fungsian (Non-Functional Requirements)", styles['H1']))
    nfr_data = [
        [Paragraph("Kategori NFR", styles['TableHeader']), Paragraph("Spesifikasi & Standard Pelaksanaan", styles['TableHeader'])],
        [Paragraph("Ketahanan Luar Talian (Offline)", styles['TableCellBold']), Paragraph("Sistem dilengkapi PWA Service Worker (/sw.js) dan cache IndexedDB tempatan bagi membolehkan staf kaunter meneruskan pesanan semasa talian telekomunikasi Pulau Indah terputus.", styles['TableCell'])],
        [Paragraph("Prestasi & Latensi", styles['TableCellBold']), Paragraph("Masa muat turun muka surat < 1.0 saat, dihoskan di nod pinggir Vercel rantau Singapura (sin1) untuk latensi < 25ms di Semenanjung Malaysia.", styles['TableCell'])],
        [Paragraph("Kebolehsambungan Peranti", styles['TableCellBold']), Paragraph("Responsif pada pelbagai peranti: Tablet Android 10 inci di dapur, iPad kaunter, dan telefon pintar pemilik.", styles['TableCell'])],
        [Paragraph("Ketahanan Persekitaran Dapur", styles['TableCellBold']), Paragraph("Paparan kontras tinggi (Dark Theme) dengan zon sentuh besar untuk memudahkan staf dengan sarung tangan atau tangan berkuah/minyak.", styles['TableCell'])],
    ]
    t_nfr = Table(nfr_data, colWidths=[140, 347])
    t_nfr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1c1917")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#d6d3d1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f5f5f4")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#fafaf9")]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_nfr)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"SRS PDF successfully generated: {filename}")


def build_roadmap_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_custom_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("NIPAH SATAY™ BUSINESS MANAGEMENT SYSTEM", styles['DocTitle']))
    story.append(Paragraph("Pelan Hala Tuju Pelaksanaan (Implementation Roadmap) • 2026-2027", styles['DocSubtitle']))
    
    story.append(create_callout(
        "<b>Ringkasan Pelaksanaan:</b> Dokumen ini menggariskan fasa pelancaran berperingkat bagi mentransformasikan "
        "operasi restoran dan kilang sate Nipah Satay @ Pulau Indah daripada sistem manual kepada platform pintar bersepadu.",
        styles
    ))
    story.append(Spacer(1, 14))

    # Phase Breakdown
    phases = [
        {
            "num": "FASA 1: Teras POS, KDS & Penyahpepijatan Cloud",
            "status": "SELESAI & AKTIF (LIVE)",
            "timeline": "Nov 2026",
            "items": [
                "Pembangunan seni bina Next.js 16 (App Router) & Tailwind CSS v3.",
                "Konsep POS Dinamik: Aliran kerja 'Makan Dulu, Bayar Kemudian' (Table Tab).",
                "Susunan Meja Konsisten: Grid 4 sebaris segi empat sama (aspect-square) & indikator.",
                "Drawer Kategori Vertikal Kiosk (KFC Style) dengan fungsi auto-hide.",
                "Antaramuka POS Minimalis: Penjimatan ruang skrin & pengurangan perkataan.",
                "Pemisahan tiket KDS: Stesen Arang Pitmaster vs Wok Soto vs Bar Minuman.",
                "Integrasi Pangkalan Data Awan: Neon PostgreSQL serverless di Vercel Storage.",
                "Penerbitan ke Vercel Edge Serverless (https://nipah-satay.vercel.app).",
                "Integrasi Web App Manifest & Service Worker untuk PWA Pulau Indah."
            ]
        },
        {
            "num": "FASA 2: Barisan Pengeluaran Kilang & Timbangan Daging",
            "status": "SEDANG BERJALAN (IN PROGRESS)",
            "timeline": "Dis 2026",
            "items": [
                "Pelaksanaan penuh log kadar hasil trimming daging lembu, ayam dan kambing.",
                "Kiraan automatik upah pekerja mencucuk 'piece-rate' (RM 0.08 / cucuk).",
                "Penyegerakan pemindahan stok chiller kilang ke dapur bakar.",
                "Ujian rintis tablet tahan lasak di bilik pemprosesan sate."
            ]
        },
        {
            "num": "FASA 3: Integrasi Pencetak Resit & Pangkalan Data Realtime",
            "status": "DIRANCANG (Q1 2027)",
            "timeline": "Jan - Feb 2027",
            "items": [
                "Penyambungan pencetak terma ESC/POS LAN/Bluetooth di kaunter & pit sate.",
                "Penyambungan pangkalan data Supabase (PostgreSQL) zon Singapura (sin1).",
                "Penyegerakan pesanan dua hala luar talian (Dexie.js / IndexedDB) ke cloud.",
                "Sistem penjejakan suhu bilik sejuk automatik (IoT Thermometer Alert)."
            ]
        },
        {
            "num": "FASA 4: Hab Borong B2B & Tempahan Katering Pitmaster",
            "status": "DIRANCANG (Q2 2027)",
            "timeline": "Mac - Mei 2027",
            "items": [
                "Portal tempahan ejen untuk pek vakum sate beku (20s & 50s).",
                "Sistem sebut harga katering kenduri & kutipan deposit automatik via FPX.",
                "Jadual pembakar sate bergerak (mobile live pitmaster roster)."
            ]
        },
        {
            "num": "FASA 5: Analisis AI & Pembekalan Berpusat (Central Kitchen)",
            "status": "DIRANCANG (H2 2027)",
            "timeline": "Jun - Dis 2027",
            "items": [
                "Ramalan pintar keperluan cucukan sate harian berasaskan cuaca & cuti umum.",
                "Sokongan multi-cawangan jika membuka kios/cawangan baru di Shah Alam/Klang.",
                "Integrasi inventori pembekal arang kayu bakau dan lidi buluh secara automatik."
            ]
        }
    ]

    for p in phases:
        story.append(Paragraph(f"<b>{p['num']}</b> — <font color='#c2410c'><b>{p['status']}</b></font> ({p['timeline']})", styles['H2']))
        for it in p['items']:
            story.append(Paragraph(f"• {it}", styles['Bullet']))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Jadual Matriks Keutamaan & Sasaran KPI", styles['H1']))
    
    matrix_data = [
        [Paragraph("Pencapaian (Milestone)", styles['TableHeader']), Paragraph("Sasaran Masa", styles['TableHeader']), Paragraph("KPI Utama", styles['TableHeader']), Paragraph("Status", styles['TableHeader'])],
        [Paragraph("M1: POS & KDS Dapur", styles['TableCellBold']), Paragraph("Nov 2026", styles['TableCell']), Paragraph("Pesanan dihantar ke pitmaster < 2 saat", styles['TableCell']), Paragraph("<font color='#15803d'><b>100% Siap</b></font>", styles['TableCell'])],
        [Paragraph("M2: Hasil Kilang Daging", styles['TableCellBold']), Paragraph("Dis 2026", styles['TableCell']), Paragraph("Kadar susut daging dikesan < 10%", styles['TableCell']), Paragraph("<font color='#b45309'><b>75% Siap</b></font>", styles['TableCell'])],
        [Paragraph("M3: ESC/POS Thermal Print", styles['TableCellBold']), Paragraph("Feb 2027", styles['TableCell']), Paragraph("Cetak tiket dapur tanpa kabel", styles['TableCell']), Paragraph("Dirancang", styles['TableCell'])],
        [Paragraph("M4: B2B Sate Beku", styles['TableCellBold']), Paragraph("Apr 2027", styles['TableCell']), Paragraph("Jualan 5,000 cucuk sate beku sebulan", styles['TableCell']), Paragraph("Dirancang", styles['TableCell'])],
        [Paragraph("M5: Multi-Branch Ready", styles['TableCellBold']), Paragraph("Dis 2027", styles['TableCell']), Paragraph("Sistem sedia untuk cawangan kedua", styles['TableCell']), Paragraph("Dirancang", styles['TableCell'])],
    ]
    t_mat = Table(matrix_data, colWidths=[130, 80, 207, 70])
    t_mat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#c2410c")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#d6d3d1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f5f5f4")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#fafaf9")]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_mat)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Roadmap PDF successfully generated: {filename}")


def build_progress_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_custom_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("NIPAH SATAY™ BUSINESS MANAGEMENT SYSTEM", styles['DocTitle']))
    story.append(Paragraph("Laporan Kemajuan Projek (Progress Update Report) • 21 November 2026", styles['DocSubtitle']))

    story.append(create_callout(
        "<b>Ringkasan Eksekutif Terkini:</b> Sistem Pengurusan Operasi Bersepadu Nipah Satay™ telah dinaik taraf sepenuhnya kepada status pengeluaran berskala komersial dengan integrasi 68 menu fizikal rasmi, antaramuka 'Mobile-First' mesra ibu jari, mod warga emas (A+), dan keserasian universal tablet lama menggunakan Tailwind CSS v3.",
        styles
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("1. Status Penyiapan Modul Perisian & Operasi", styles['H1']))
    prog_data = [
        [Paragraph("Modul Sistem", styles['TableHeader']), Paragraph("Laluan", styles['TableHeader']), Paragraph("Ciri Utama & Status Terkini", styles['TableHeader']), Paragraph("Status", styles['TableHeader'])],
        [
            Paragraph("Pusat Kawalan", styles['TableCellBold']),
            Paragraph("/", styles['TableCell']),
            Paragraph("Snapshot dua operasi (Restoran vs Kilang), metrik giliran sate api, status chiller, waktu operasi (3PM–11PM, Ahad Cuti), dan hotline 017-365 9302.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Siap (Live)</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("POS Kaunter & Meja", styles['TableCellBold']),
            Paragraph("/pos", styles['TableCell']),
            Paragraph("Katalog 68 menu rasmi, kad anti-mampat min-h-[185px], bar troli pesanan terapung di atas navigasi bawah, modal DuitNow QR & tunai.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Siap (Live)</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Dapur Pintar (KDS Live)", styles['TableCellBold']),
            Paragraph("/kitchen", styles['TableCell']),
            Paragraph("Penjumlahan cucuk sate api arang masa nyata (Pitmaster queue), stesen kuali soto/mee sup/mee rebus, stesen minuman, kawalan status penyediaan.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Siap (Live)</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Kilang Pemprosesan Sate", styles['TableCellBold']),
            Paragraph("/production", styles['TableCell']),
            Paragraph("Kalkulator yield daging (kasar vs trim), upah mengikut jenis sate (Ayam RM0.08, Lembu RM0.09, Kambing RM0.10, Babat RM0.09), borang cucuk order-1 di telefon.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Siap (Live)</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Borong & Katering Acara", styles['TableCellBold']),
            Paragraph("/wholesale", styles['TableCell']),
            Paragraph("Stok sate beku vakum (20s & 50s), penambahan Karipap Frozen (Kentang RM8, Sardin/Ayam RM10), rekod tempahan katering live kenduri.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Siap (Live)</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Laporan Z-Report & Kos", styles['TableCellBold']),
            Paragraph("/reports", styles['TableCell']),
            Paragraph("Penyata tutup kaunter harian, audit varians stok chiller vs duit jualan POS, simulator kos se-cucuk sate.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Siap (Live)</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Menu Awam Pelanggan", styles['TableCellBold']),
            Paragraph("/menu", styles['TableCell']),
            Paragraph("Portal menu awam digital responsif dengan penjana pesanan WhatsApp terus ke nombor rasmi 017 365 9302 (wa.me/60173659302).", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Siap (Live)</b></font>", styles['TableCell'])
        ],
    ]
    t_prog = Table(prog_data, colWidths=[105, 50, 262, 70])
    t_prog.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#c2410c")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#d6d3d1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f5f5f4")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#fafaf9")]),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(t_prog)
    story.append(Spacer(1, 10))

    story.append(Paragraph("2. Kemajuan Ciri Kritikal & Penambahbaikan UX Terkini", styles['H1']))
    enhancements_data = [
        [Paragraph("Peningkatan Sistem", styles['TableHeader']), Paragraph("Huraian Teknikal & Operasi", styles['TableHeader']), Paragraph("Status Impak", styles['TableHeader'])],
        [
            Paragraph("Keserasian Universal Tablet", styles['TableCellBold']),
            Paragraph("Beralih ke Tailwind CSS v3 (v3.4.19) dan browserslist (Android >= 5, Chrome >= 50) bagi membolehkan tablet POS lama di restoran memproses CSS penuh tanpa ralat @layer.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Disahkan 100%</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Navigasi Mobile-First (BottomNav)", styles['TableCellBold']),
            Paragraph("Bar navigasi 5-tab tetap di dasar telefon (Utama, POS, Dapur, Kilang, Laporan) yang mesra ibu jari, melancarkan mobiliti pelayan dan staf kilang.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Disahkan 100%</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Mod Mesra Warga Emas (👓 A+)", styles['TableCellBold']),
            Paragraph("Suis kontras tinggi, butang stepper gergasi (-50 / +50), butang preset (200, 300, 500, 600, 800, 1000) dan sasaran sentuhan minimum 48px–56px untuk staf senior.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Disahkan 100%</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("Bar Terapung Troli POS", styles['TableCellBold']),
            Paragraph("Bar ringkasan pesanan terapung dinaikkan ke kedudukan bottom-[5.25rem] (84px) terapung kemas di atas bar tab, memudahkan semakan bakul sekali tekan.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Disahkan 100%</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("PWA Network-First (v8)", styles['TableCellBold']),
            Paragraph("Service worker v8 dengan dasar Network-First bagi memastikan peranti sentiasa mengambil kod UI terkini secara automatik tanpa tersangkut memori cache lama.", styles['TableCell']),
            Paragraph("<font color='#15803d'><b>Disahkan 100%</b></font>", styles['TableCell'])
        ],
    ]
    t_enh = Table(enhancements_data, colWidths=[130, 287, 70])
    t_enh.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1c1917")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#d6d3d1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f5f5f4")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#fafaf9")]),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(t_enh)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3. Metrik Infrastruktur & Pengesahan Binaan", styles['H1']))
    infra_data = [
        [Paragraph("Parameter", styles['TableHeader']), Paragraph("Nilai / Keputusan", styles['TableHeader']), Paragraph("Nota Teknikal", styles['TableHeader'])],
        [Paragraph("Penyedia Cloud", styles['TableCellBold']), Paragraph("Vercel Production (Edge Serverless)", styles['TableCell']), Paragraph("Nod rantau Singapura (sin1)", styles['TableCell'])],
        [Paragraph("Domain Pengeluaran", styles['TableCellBold']), Paragraph("nipah-satay.vercel.app", styles['TableCell']), Paragraph("Disahkan status HTTP 200 OK, SSL Aktif", styles['TableCell'])],
        [Paragraph("Rangka Kerja", styles['TableCellBold']), Paragraph("Next.js 16.4.6 + React 19 + Tailwind v3", styles['TableCell']), Paragraph("Zero compile error, Webpack build 2.3s", styles['TableCell'])],
        [Paragraph("Penyusunan Laluan", styles['TableCellBold']), Paragraph("9 Laluan Dipra-jana (Static Prerender)", styles['TableCell']), Paragraph("Semua modul dipra-jana sepenuhnya", styles['TableCell'])],
        [Paragraph("Kawalan Versi & CI/CD", styles['TableCellBold']), Paragraph("GitHub (aku18xy/nipah-satay)", styles['TableCell']), Paragraph("Cawangan 'main' auto-deploy ke Vercel", styles['TableCell'])],
    ]
    t_infra = Table(infra_data, colWidths=[120, 197, 170])
    t_infra.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1c1917")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#d6d3d1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f5f5f4")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#fafaf9")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_infra)
    story.append(Spacer(1, 10))

    story.append(Paragraph("4. Tindakan Seterusnya (Next Steps)", styles['H1']))
    story.append(Paragraph("1. <b>Ujian Lapangan di Laguna Park:</b> Ujian aliran kerja pesanan menggunakan tablet kaunter dan telefon pintar staf.", styles['Bullet']))
    story.append(Paragraph("2. <b>Integrasi Pencetak Terma ESC/POS:</b> Pengujian modul pencetak resit terma 80mm untuk tiket pesanan dapur sate.", styles['Bullet']))
    story.append(Paragraph("3. <b>Penyegerakan Pangkalan Data Awan:</b> Penghijrahan storan setempat ke pangkalan data awan Supabase bagi penyegerakan serentak.", styles['Bullet']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Progress PDF successfully generated: {filename}")


if __name__ == '__main__':
    os.makedirs('docs', exist_ok=True)
    build_srs_pdf('docs/Nipah_Satay_Software_Requirements_Specification_SRS.pdf')
    build_roadmap_pdf('docs/Nipah_Satay_Implementation_Roadmap.pdf')
    build_progress_pdf('docs/Nipah_Satay_Project_Progress_Update.pdf')
