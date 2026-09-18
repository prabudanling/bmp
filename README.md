<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      ███╗   ███╗ █████╗ ███╗   ██╗ ██████╗ ██╗  ██╗ █████╗       ║
║      ████╗ ████║██╔══██╗████╗  ██║██╔════╝ ██║  ██║██╔══██╗      ║
║      ██╔████╔██║███████║██╔██╗ ██║██║  ███╗███████║███████║      ║
║      ██║╚██╔╝██║██╔══██║██║╚██╗██║██║   ██║██╔══██║██╔══██║      ║
║      ██║ ╚═╝ ██║██║  ██║██║ ╚████║╚██████╔╝██║  ██║██║  ██║      ║
║      ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝      ║
║                                                                  ║
║          B E R K A T   M A N D I R I   P E N D I N G I N         ║
║                                                                  ║
║        ❄️  Kompresor & Sparepart AC — Toko Digital Terlengkap ❄️  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

# 🧊 Berkat Mandiri Pendingin

**Website toko online kompresor & sparepart AC lengkap dengan Dashboard Admin —
dari katalog produk, upload barang, sampai pesanan WhatsApp, semua dalam satu aplikasi.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Status](https://img.shields.io/badge/Status-Terverifikasi_E2E-brightgreen?style=for-the-badge)

**Bahasa Antarmuka:** 🇮🇩 Indonesia 100% — setiap tombol, menu, dan pesan.

---

📖 **Dokumentasi Lain:** [Tutorial Upload Produk (TUTORIAL-UPLOAD-PRODUK.md)](./TUTORIAL-UPLOAD-PRODUK.md) · [Tutorial Lengkap (TUTORIAL.md)](./TUTORIAL.md) ·
Panduan admin & deploy langkah-demi-langkah tersedia di dalam dashboard (menu *Panduan*).

</div>

---

## 📑 Daftar Isi

| # | Bagian | # | Bagian |
|---|--------|---|--------|
| 1 | [✨ Tentang Proyek](#-tentang-proyek) | 9 | [🗄️ Skema Database](#️-skema-database) |
| 2 | [🚀 Fitur Lengkap](#-fitur-lengkap) | 10 | [🔌 Dokumentasi API](#-dokumentasi-api) |
| 3 | [🔑 Akses Cepat & Login Default](#-akses-cepat--login-default) | 11 | [🧭 Panduan Admin Kilat](#-panduan-admin-kilat) |
| 4 | [🛠️ Teknologi yang Digunakan](#️-teknologi-yang-digunakan) | 12 | [🌐 Cara Deploy](#-cara-deploy) |
| 5 | [🏗️ Arsitektur Aplikasi](#️-arsitektur-aplikasi) | 13 | [🔐 Keamanan](#-keamanan) |
| 6 | [📂 Struktur Folder](#-struktur-folder) | 14 | [🧯 Troubleshooting](#-troubleshooting) |
| 7 | [⚡ Instalasi 5 Langkah](#-instalasi-5-langkah) | 15 | [❓ FAQ](#-faq) |
| 8 | [📜 Perintah Tersedia](#-perintah-tersedia) | 16 | [🗺️ Roadmap & Kontak](#️-roadmap--kontak) |

---

## ✨ Tentang Proyek

**Berkat Mandiri Pendingin** adalah aplikasi web fullstack untuk bisnis jual-beli
**kompresor AC** dan **sparepart AC** (kapasitor, motor fan, termostat, freon,
fitting, dan lainnya). Dirancang agar pemilik toko **tanpa keahlian coding** bisa:

- 🛍️ Menampilkan katalog produk yang **rapi, cepat, dan responsif** ke pelanggan
- 📤 **Upload barang sendiri** (nama, foto, harga, stok, deskripsi lengkap, spesifikasi teknis)
- 📨 Menerima **pesan pelanggan** langsung ke dashboard, balas 1-klik via WhatsApp/Email
- ⚙️ Mengatur identitas toko (nama, nomor WA, alamat, jam buka) **tanpa menyentuh kode**

> 💡 **Kenapa aplikasi ini spesial?**
> Semua data tersimpan di **SQLite** — satu file saja. Tidak perlu install MySQL,
> tidak perlu konfigurasi server database rumit. Upload ke hosting, langsung jalan.

---

## 🚀 Fitur Lengkap

### 🌐 Website Publik (untuk pelanggan)

| Fitur | Detail |
|-------|--------|
| 🏠 **Beranda** | Hero banner besar, grid kategori, produk unggulan, keunggulan toko, tentang kami, strip merek (Daikin, Panasonic, LG, Gree, Sharp, Mitsubishi), CTA & kontak |
| 🔍 **Katalog Pintar** | Pencarian real-time, filter kategori, urutkan (terbaru / terpopuler / harga naik-turun), paginasi |
| 📄 **Detail Produk** | Galeri multi-foto, harga + status stok, spesifikasi teknis, penghitung *views*, tombol **Pesan via WhatsApp** (pesan otomatis terisi nama produk), produk terkait |
| 💬 **Form Kontak** | Dengan perlindungan **honeypot anti-spam** — pesan masuk langsung ke dashboard admin |
| 📱 **Tombol WA Mengambang** | Chat WhatsApp melayang di semua halaman, otomatis mengikuti nomor di Pengaturan |
| 🌙 **Dark Mode** | Terang/gelap otomatis mengikuti preferensi pengunjung |
| 📐 **Responsif Penuh** | Sempurna di HP (390px), tablet, dan desktop |

### 🔐 Dashboard Admin (untuk pemilik toko)

| Fitur | Detail |
|-------|--------|
| 🔑 **Login Aman** | Password ter-hash **bcrypt** + sesi **JWT** di cookie `httpOnly` |
| 📊 **Ringkasan** | 4 kartu statistik, pesan terbaru, peringatan stok menipis, produk terbaru |
| 📦 **Kelola Produk** | Tambah / edit / hapus, **upload multi-foto** (maks 3MB per file), editor spesifikasi dinamis, SKU, merek, harga (atau *"Hubungi Kami"*), stok, satuan |
| 👁️ **Sembunyikan / Tampilkan** | Switch aktif per produk + tandai **Unggulan** untuk beranda |
| 🗂️ **Kelola Kategori** | CRUD kategori + pilih ikon (terlindungi dari hapus jika masih ada produk) |
| 📨 **Kotak Pesan** | Filter belum-dibaca, tandai dibaca, hapus, **balas 1-klik** via WhatsApp/Email |
| 📄 **Halaman CMS** | **Editor WYSIWYG ala WordPress**: buat halaman bebas (Tentang, FAQ, kebijakan), tayangkan di menu "Informasi" & footer, mode draf/terbit, mode HTML |
| 🖼️ **Perpustakaan Media** | Grid semua gambar terunggah: cari, unggah, **salin URL 1-klik**, hapus; ikon media sosial (Instagram/Facebook/TikTok/YouTube) di footer |
| ⚙️ **Pengaturan Toko** | Nama toko, nomor WA, alamat, jam buka, teks hero, **logo perusahaan**, **logo mitra**, **favicon dinamis** — **live update tanpa deploy ulang** + ubah password admin |
| 📚 **Panduan Terpasang** | Tutorial 8 topik berbentuk accordion di dalam dashboard |
| 🛡️ **Notifikasi Stok Menipis** | Produk dengan stok ≤ 5 otomatis muncul di dashboard |

---

## 🔑 Akses Cepat & Login Default

Setelah instalasi selesai ([lihat di bawah](#-instalasi-5-langkah)), buka `http://localhost:3000`:

| Halaman | URL / Cara Akses |
|---------|------------------|
| 🌐 Website publik | `http://localhost:3000` |
| 🔐 Login admin | Website → menu **Login** (atau tombol di footer) |
| 📊 Dashboard admin | Otomatis setelah login |

| Kredensial Default | Nilai |
|--------------------|-------|
| 👤 Username | `admin` |
| 🔑 Password | `admin123` |

> ⚠️ **WAJIB BACA:** Segera ganti password di **Pengaturan → Ubah Password Admin**
> setelah login pertama. Password default hanya untuk pengembangan!

---

## 🛠️ Teknologi yang Digunakan

| Lapisan | Teknologi | Fungsi |
|---------|-----------|--------|
| ⚙️ Framework | **Next.js 16** (App Router) | Fullstack — frontend & API dalam satu aplikasi |
| 🧠 Bahasa | **TypeScript 5** | Kode aman, bebas bug tipe data |
| 🎨 UI | **React 19 + shadcn/ui** (Radix) | Komponen modern & aksesibel |
| 💅 Styling | **Tailwind CSS 4** | Desain cepat & konsisten, tema teal ❄️ |
| 🗄️ Database | **Prisma 6 + SQLite** | ORM tipe-aman, database cukup 1 file |
| 🔐 Auth | **jose (JWT) + bcryptjs** | Login aman tanpa dependensi eksternal |
| 🖼️ Ikon | **Lucide React** | Ribuan ikon vektor elegan |
| ✨ Animasi | **Framer Motion** | Transisi halus & modern |
| 🔔 Notifikasi | **Sonner** | Toast notifikasi yang cantik |
| 🌓 Tema | **next-themes** | Dark mode otomatis |

**Prasyarat:** Node.js **18+** (disarankan 20+) atau **Bun**. Itu saja — SQLite sudah bawaan!

---

## 🏗️ Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PENGGUNA                                  │
│         🛒 Pelanggan (publik)          👨‍💼 Admin (pemilik toko)      │
└───────────────┬─────────────────────────────┬───────────────────────┘
                │                             │
                ▼                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 — SATU APLIKASI (:3000)               │
│                                                                     │
│  ┌────────────────────────────┐   ┌──────────────────────────────┐  │
│  │   FRONTEND (React SPA)     │   │      BACKEND (API Routes)    │  │
│  │                            │   │                              │  │
│  │  publik-site.tsx           │   │  /api/auth/*     🔐 login    │  │
│  │  ├─ home-view (beranda)    │   │  /api/products   📦 produk   │  │
│  │  ├─ catalog-view (katalog) │──▶│  /api/categories 🗂️ kategori │  │
│  │  ├─ product-detail         │   │  /api/messages   📨 pesan    │  │
│  │  └─ contact-section        │   │  /api/settings   ⚙️ setting  │  │
│  │                            │   │  /api/upload     🖼️ gambar   │  │
│  │  admin-app.tsx             │   │  /api/stats      📊 statistik│  │
│  │  ├─ dashboard              │   │                              │  │
│  │  ├─ products-manager       │   │  🛡️ Middleware: JWT cookie   │  │
│  │  ├─ messages-manager       │   │     httpOnly + bcrypt        │  │
│  │  └─ settings-manager       │   │                              │  │
│  └────────────────────────────┘   └──────────────┬───────────────┘  │
│                                                  │                  │
│         📁 public/uploads/ ◀── file foto produk  │                  │
└──────────────────────────────────────────────────┼──────────────────┘
                                                   ▼
                                    ┌──────────────────────────┐
                                    │   PRISMA ORM             │
                                    │   ┌──────────────────┐   │
                                    │   │  SQLite (1 file) │   │
                                    │   │  db/custom.db    │   │
                                    │   └──────────────────┘   │
                                    │   5 tabel: Admin,        │
                                    │   Category, Product,     │
                                    │   Message, Setting       │
                                    └──────────────────────────┘
```

> 📌 **Catatan arsitektur:** Routing halaman memakai **hash-router SPA** (`/#/katalog`,
> `/#/admin`) di atas satu route Next.js — sehingga deploy jauh lebih sederhana.

---

## 📂 Struktur Folder

```
berkat-mandiri-pendingin/
├── 📄 README.md                  ← File yang sedang Anda baca
├── 📘 TUTORIAL.md                ← Tutorial lengkap & deploy langkah demi langkah
├── 📦 TUTORIAL-UPLOAD-PRODUK.md  ← Tutorial lengkap mengupload barang (pemula)
├── 📦 package.json               ← Daftar dependensi & skrip npm
│
├── 🗄️ prisma/
│   └── schema.prisma             ← Definisi 5 tabel database
│
├── 🗃️ db/
│   └── custom.db                 ← File database SQLite (dibuat otomatis)
│
├── 🖼️ public/
│   └── uploads/                  ← Foto produk & gambar website (WAJIB di-backup!)
│
├── 🌱 scripts/
│   └── seed.ts                   ← Isi data awal: admin, 6 kategori, 14 produk
│
├── ⚙️ src/
│   ├── app/
│   │   ├── layout.tsx            ← Layout global + tema + font
│   │   ├── page.tsx              ← Titik masuk SPA (public + admin)
│   │   └── api/                  ← 🌐 BACKEND — 14 route API
│   │       ├── auth/             ← login, logout, me, change-password
│   │       ├── products/         ← CRUD produk + filter & paginasi
│   │       ├── categories/       ← CRUD kategori
│   │       ├── messages/         ← Pesan pelanggan
│   │       ├── settings/         ← Pengaturan toko (key-value)
│   │       ├── stats/            ← Statistik dashboard
│   │       └── upload/           ← Upload foto (validasi 3MB)
│   │
│   ├── components/
│   │   ├── site/                 ← 🛒 Halaman publik
│   │   │   ├── public-site.tsx   ← Router SPA publik
│   │   │   ├── home-view.tsx     ← Beranda
│   │   │   ├── catalog-view.tsx  ← Katalog + filter + paginasi
│   │   │   ├── product-detail.tsx← Detail produk + tombol WA
│   │   │   ├── product-card.tsx  ← Kartu produk
│   │   │   ├── contact-section.tsx
│   │   │   ├── site-header.tsx   ← Header sticky + navigasi
│   │   │   ├── footer.tsx        ← Footer 4 kolom
│   │   │   ├── login-view.tsx    ← Form login admin
│   │   │   └── whatsapp-float.tsx← Tombol WA mengambang
│   │   │
│   │   ├── admin/                ← 🔐 Dashboard admin
│   │   │   ├── admin-app.tsx     ← Kerangka admin + guard login
│   │   │   ├── dashboard.tsx     ← Ringkasan & statistik
│   │   │   ├── products-manager.tsx  ← Tabel produk (cari, filter, sort)
│   │   │   ├── product-form.tsx  ← Form tambah/edit + upload foto
│   │   │   ├── categories-manager.tsx
│   │   │   ├── messages-manager.tsx
│   │   │   ├── settings-manager.tsx
│   │   │   └── panduan.tsx       ← Tutorial di dalam dashboard
│   │   │
│   │   └── ui/                   ← Komponen shadcn/ui (button, dialog, dll)
│   │
│   └── lib/                      ← 🧰 Utilitas
│       ├── db.ts                 ← Klien Prisma
│       ├── auth.ts               ← JWT, hash password, guard
│       ├── format.ts             ← Format Rupiah, tanggal
│       ├── slug.ts               ← Generator slug URL
│       └── ...
│
└── 🧪 tests/                     ← Folder pengujian
```

---

## ⚡ Instalasi 5 Langkah

> 🎯 **Total waktu: ±3 menit.** Tidak perlu MySQL, tidak perlu Docker.

```bash
# 1️⃣ Masuk folder proyek
cd berkat-mandiri-pendingin

# 2️⃣ Install semua dependensi
npm install                 # atau: bun install

# 3️⃣ Buat struktur database SQLite
npm run db:push

# 4️⃣ Isi data awal (admin + 6 kategori + 14 produk contoh)
bun scripts/seed.ts         # atau: npx tsx scripts/seed.ts

# 5️⃣ Jalankan website 🚀
npm run dev
```

Buka **http://localhost:3000** → login sebagai `admin` / `admin123` → selesai! 🎉

<details>
<summary>🔧 <b>Butuh variabel lingkungan?</b> (klik untuk buka)</summary>

Buat file `.env` di root proyek (sudah otomatis tersedia di kebanyakan kasus):

```env
# Lokasi file database SQLite
DATABASE_URL="file:../db/custom.db"

# Kunci rahasia untuk token JWT login admin
# GANTI dengan string acak panjang saat produksi!
JWT_SECRET="ubah-ini-dengan-string-acak-yang-panjang-dan-unik"
```

💡 Tips membuat string acak: jalankan `openssl rand -hex 32`
</details>

---

## 📜 Perintah Tersedia

Jalankan dengan `npm run <perintah>` (atau `bun run <perintah>`):

| Perintah | Fungsi |
|----------|--------|
| `dev` | 🚀 Jalankan server pengembangan di port **3000** (hot reload) |
| `build` | 🏗️ Build versi produksi (standalone, siap deploy) |
| `start` | ▶️ Jalankan server produksi hasil build |
| `lint` | 🧹 Cek kualitas kode dengan ESLint |
| `db:push` | 🗄️ Terapkan schema Prisma ke database SQLite |
| `db:generate` | ⚙️ Generate klien Prisma (setelah ubah schema) |
| `db:migrate` | 📝 Buat migrasi database (mode pengembangan) |
| `db:reset` | 🔄 **⚠️ Hapus semua data** & buat ulang database dari nol |

---

## 🗄️ Skema Database

Database SQLite berisi **5 tabel** (dikelola oleh Prisma):

### 👤 `Admin` — Akun pemilik toko
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | String (cuid) | ID unik |
| `username` | String **unique** | Nama untuk login |
| `password` | String | Hash **bcrypt** (tidak pernah plain-text!) |
| `name` | String | Nama tampil di dashboard |

### 🗂️ `Category` — Kategori produk
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `name` | String **unique** | Misal: "Kompresor AC" |
| `slug` | String **unique** | `kompresor-ac` (untuk URL) |
| `icon` | String | Nama ikon Lucide (default: `package`) |

### 📦 `Product` — Produk toko (tabel utama)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `name` / `slug` | String | Nama produk & slug unik URL |
| `sku` | String? | Kode stok barang (opsional) |
| `brand` | String? | Merek: Daikin, Panasonic, dll |
| `categoryId` | String? | Relasi ke Category (*SetNull* saat kategori dihapus) |
| `price` | Int? | Dalam **Rupiah**; kosong = *"Hubungi Kami"* |
| `unit` / `stock` | String / Int | Satuan (`pcs`, `unit`) & jumlah stok |
| `shortDesc` / `description` | String | Deskripsi singkat & **deskripsi lengkap** |
| `specs` | String (JSON) | Array spesifikasi: `[{"k":"Merek","v":"Daikin"}]` |
| `images` | String (JSON) | Array URL foto (multi-foto) |
| `isFeatured` / `isActive` | Boolean | Tampilkan di beranda / sembunyikan dari katalog |
| `views` | Int | Penghitung kunjungan detail produk |

### 📨 `Message` — Pesan dari form kontak
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `name` / `phone` / `email` | String | Identitas pengirim (email opsional) |
| `message` | String | Isi pesan |
| `isRead` | Boolean | Status dibaca admin (untuk badge notifikasi) |

### ⚙️ `Setting` — Pengaturan toko (key-value)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `key` / `value` | String | Contoh: `storeName`, `whatsapp`, `heroTitle`, `logoUrl`, `partnerLogos` (JSON), `faviconUrl` |

### 📄 `Page` — Halaman konten CMS
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `title` / `slug` | String | Judul + alamat (`/p/slug`, unik) |
| `content` | String | HTML dari editor WYSIWYG |
| `excerpt` | String | Ringkasan singkat (opsional) |
| `isPublished` | Boolean | `false` = draf, belum tampil di publik |
| `showInMenu` | Boolean | Masuk menu "Informasi" & footer |
| `sortOrder` / `views` | Int | Urutan menu / counter pembaca |

> 🌱 **Data awal dari seed:** 1 admin, 6 kategori (Kompresor AC, Motor & Fan,
> Kapasitor, Termostat & Sensor, Freon & Gas, Fitting & Aksesoris),
> 14 produk contoh lengkap dengan spesifikasi & deskripsi, 2 pesan contoh.
> Seed **idempotent** — aman dijalankan berulang, tidak akan menduplikasi data.

---

## 🔌 Dokumentasi API

Semua endpoint berawalan `/api`. Respon berformat JSON.

### 🔐 Autentikasi

| Metode | Endpoint | Auth | Fungsi |
|--------|----------|:----:|--------|
| `POST` | `/api/auth/login` | — | Login → set cookie JWT `httpOnly` |
| `POST` | `/api/auth/logout` | — | Hapus cookie sesi |
| `GET` | `/api/auth/me` | 🔒 | Data admin yang sedang login |
| `PUT` | `/api/auth/change-password` | 🔒 | Ganti password admin |

**Contoh login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookie.txt
# → {"ok":true,"admin":{"username":"admin","name":"Administrator"}}
```

### 📦 Produk

| Metode | Endpoint | Auth | Fungsi |
|--------|----------|:----:|--------|
| `GET` | `/api/products` | — | Daftar produk + **filter**: `q` (cari), `category`, `status`, `sort` (`newest`/`popular`/`price-asc`/`price-desc`), `featured`, `page`, `limit` |
| `GET` | `/api/products/:id` | — | Detail produk (via `id` **atau** `slug`) + menambah `views` |
| `POST` | `/api/products` | 🔒 | Buat produk baru |
| `PUT` | `/api/products/:id` | 🔒 | Update produk |
| `DELETE` | `/api/products/:id` | 🔒 | Hapus produk |

**Contoh ambil katalog + filter:**

```bash
curl "http://localhost:3000/api/products?q=kompresor&sort=price-asc&page=1&limit=12"
# → {"items":[...],"total":4,"page":1,"totalPages":1}
```

### 🗂️ Kategori · 📨 Pesan · ⚙️ Pengaturan · 📊 Lainnya

| Metode | Endpoint | Auth | Fungsi |
|--------|----------|:----:|--------|
| `GET` | `/api/categories` | — | Semua kategori (beserta jumlah produk) |
| `POST` | `/api/categories` | 🔒 | Buat kategori |
| `PUT` | `/api/categories/:id` | 🔒 | Update kategori |
| `DELETE` | `/api/categories/:id` | 🔒 | Hapus (❌ ditolak jika masih ada produk) |
| `GET` | `/api/messages` | 🔒 | Daftar pesan (filter `unread=true`) |
| `POST` | `/api/messages` | — | Kirim pesan dari form kontak (honeypot anti-spam) |
| `PUT` | `/api/messages/:id` | 🔒 | Tandai sudah dibaca |
| `DELETE` | `/api/messages/:id` | 🔒 | Hapus pesan |
| `GET` | `/api/settings` | — | Pengaturan toko (merge nilai default) |
| `PUT` | `/api/settings` | 🔒 | Simpan pengaturan (batch key-value) |
| `GET` | `/api/stats` | 🔒 | Statistik dashboard (jumlah produk, pesan belum dibaca, stok menipis, produk terbaru) |
| `POST` | `/api/upload` | 🔒 | Upload foto (maks **3MB**, validasi tipe file) → `{"url":"/uploads/..."}` |
| `GET` | `/api/pages` | — | Daftar halaman CMS terbit (`?menu=1` khusus menu, `?all=1` 🔒 termasuk draf) |
| `POST` | `/api/pages` | 🔒 | Buat halaman (slug otomatis dari judul) |
| `GET/PUT/DELETE` | `/api/pages/:id` | 🔒 | Detail / ubah / hapus halaman |
| `GET` | `/api/pages/slug/:slug` | — | Halaman per slug (counter views naik otomatis) |
| `GET` | `/api/media` | 🔒 | Daftar semua file di folder uploads (nama, ukuran, tanggal) |
| `DELETE` | `/api/media?url=` | 🔒 | Hapus file media (proteksi path traversal) |
| `GET` | `/api` | — | Cek status API (health check) |

> 🔒 = butuh login admin (cookie JWT dikirim otomatis oleh browser setelah login)

---

## 🧭 Panduan Admin Kilat

```
📊 RINGKASAN      Lihat statistik, pesan baru & produk stok menipis
📦 PRODUK         [+ Produk Baru] → isi nama, kategori, harga, stok
                  → upload foto (bisa banyak) → tulis deskripsi & spesifikasi
                  → [Simpan]. Switch 👁️ = tampilkan/sembunyikan, ⭐ = unggulan
🗂️ KATEGORI       Tambah/edit/hapus kategori + pilih ikon
📨 PESAN          Pesan pelanggan masuk di sini → [Balas WA] 1 klik
⚙️ PENGATURAN     Ubah nama toko, nomor WA (semua tombol WA ikut berubah!),
                  alamat, jam buka, teks banner → [Simpan]
🔐 GANTI SANDI    Pengaturan → Ubah Password Admin (LAKUKAN SEGERA!)
```

> 📚 Panduan lengkap dengan gambar: **[TUTORIAL.md](./TUTORIAL.md)** — termasuk
> cara deploy ke cPanel & VPS.

---

## 🌐 Cara Deploy

### Ringkasan Opsi

| Opsi | Cocok Untuk | Admin Dashboard | Kesulitan | Panduan |
|------|-------------|:---------------:|:---------:|---------|
| 🟢 **PHP Shared Hosting** ⭐ | cPanel hosting biasa (juraganwebsite, dll) — **TANPA Node.js!** | ✅ Penuh | ⭐ | [PANDUAN-DEPLOY-SHARED-HOSTING.md](./PANDUAN-DEPLOY-SHARED-HOSTING.md) |
| 🟦 **cPanel + Node.js App** | Shared hosting berfitur Node.js (Hostinger, Niagahoster, dll) | ✅ Penuh | ⭐⭐ | [TUTORIAL.md §4](./TUTORIAL.md#4-panduan-deploy-ke-shared-hosting-cpanel) |
| 🖥️ **VPS + PM2** | VPS sendiri (DigitalOcean, Vultr, dll) | ✅ Penuh | ⭐⭐⭐ | [TUTORIAL.md §5](./TUTORIAL.md#5-alternatif-deploy-ke-vps) |

### ⚡ Inti Deploy PHP Shared Hosting (TL;DR) — REKOMENDASI

```bash
# Di komputer: bangun paket lengkap (statis + PHP API bridge)
bun run build:deploy
# → build/berkat-mandiri-website.zip
```

1. 📤 cPanel → File Manager → `public_html` → upload ZIP → **Extract**
2. ✅ Selesai! Website langsung tampil — admin `/#/admin` berfungsi penuh
3. 🔐 Segera ganti password admin (Pengaturan → Akun)
4. 🚨 **Website tidak muncul?** Buka `domainanda.com/cek.php` — diagnosis
   otomatis berbahasa Indonesia + solusinya (6 penyebab paling umum dibahas di
   [PANDUAN-DEPLOY-SHARED-HOSTING.md §Website Tidak Muncul](./PANDUAN-DEPLOY-SHARED-HOSTING.md))

> 💡 **Inovasi PHP API Bridge:** shared hosting biasa (PHP-only) tidak bisa
> menjalankan Node.js — maka dibuat `php-api/`, sebuah jembatan PHP yang
> meniru **100% REST API Next.js** (produk, kategori, settings, upload,
> media, halaman CMS, pesan, stats, auth) dengan penyimpanan file JSON.
> Frontend statis hasil `next build` tetap identik; dashboard admin tetap
> bisa menambah/mengubah produk, upload gambar, dan mengelola CMS langsung
> dari website yang online. Terverifikasi **70/70 pengujian otomatis**.
> Panduan lengkap: [PANDUAN-DEPLOY-SHARED-HOSTING.md](./PANDUAN-DEPLOY-SHARED-HOSTING.md)
>
> 🛟 **Mode Darurat anti-website-kosong:** paket berisi `api-cache/` — bila
> PHP di hosting bermasalah, halaman toko tetap tampil (baca-saja: beranda,
> katalog 1000 produk, detail, CMS) sampai PHP diperbaiki. Semua referensi
> aset relatif sehingga paket juga jalan bila dipasang di subfolder.
>
> 💾 **Backup rutin 2 hal ini di hosting:** folder `uploads/` + folder `api/data/`.

### ⚡ Inti Deploy cPanel Node.js (TL;DR)

```bash
# Di komputer: build produksi
npm run build
```

1. 📤 Upload seluruh folder proyek ke cPanel (File Manager / ZIP)
2. 🟦 cPanel → **Setup Node.js App** → arahkan ke proyek, startup file: `.next/standalone/server.js`
3. 📦 Install dependensi → 🗄️ jalankan `db:push` + seed → ▶️ Restart aplikasi
4. ✅ Selesai!

> ⚠️ **Penting:** Opsi Node.js menuntut hosting yang mendukung **Node.js App**
> (bukan PHP-only). Untuk hosting PHP-only biasa, gunakan opsi 🟢 di atas.
>
> 💾 **Backup rutin 2 hal ini:** folder `public/uploads/` + file `db/custom.db`.

---

## 🔐 Keamanan

- ✅ Password di-hash **bcrypt** (10 rounds) — tidak pernah tersimpan polos
- ✅ Sesi memakai **JWT** dalam cookie `httpOnly` (tahan serangan XSS)
- ✅ Semua endpoint admin **terlindungi middleware** autentikasi
- ✅ Upload file **divalidasi** (tipe & ukuran maks 3MB)
- ✅ Form kontak dilengkapi **honeypot** anti-bot spam
- ✅ Prisma ORM = terlindungi dari **SQL Injection** secara bawaan

**Checklist sebelum produksi:**

- [ ] Ganti password admin default (`admin123`)
- [ ] Ganti `JWT_SECRET` dengan string acak unik
- [ ] Aktifkan HTTPS di hosting (SSL/TLS gratis via cPanel — Let's Encrypt)
- [ ] Backup rutin `public/uploads/` + `db/custom.db`

---

## 🧯 Troubleshooting

| ❌ Masalah | 💡 Solusi |
|-----------|----------|
| `P1003: database tidak ada` | Jalankan `npm run db:push`, lalu seed ulang |
| Login ditolak padahal password benar | Pastikan sudah seed (`bun scripts/seed.ts`) & cookie browser tidak diblokir |
| Foto tidak muncul | Cek file ada di `public/uploads/`; pastikan folder ikut ter-upload saat deploy |
| Upload foto gagal "terlalu besar" | Maks **3MB** per file — kompres dulu fotonya |
| Port 3000 dipakai aplikasi lain | `npm run dev -- -p 3001` lalu buka `:3001` |
| Hapus kategori ditolak | Kategori masih berisi produk — pindahkan/hapus produknya dulu (ini fitur pengaman!) |
| Website blank putih setelah deploy | Jalankan `npm run build` ulang; pastikan startup file benar (`.next/standalone/server.js`) |
| Perubahan pengaturan tidak muncul | Klik **Simpan** di Pengaturan, lalu refresh halaman (Ctrl+F5) |

---

## ❓ FAQ

<details>
<summary><b>Apakah bisa jalan di shared hosting PHP biasa (cPanel tanpa Node.js)?</b></summary>

Tidak. Aplikasi ini dibangun di **Next.js (Node.js)** — bukan PHP. Anda butuh hosting
dengan fitur **Setup Node.js App** (tersedia di Hostinger, Niagahoster, dsb pada paket
tertentu) atau VPS. Panduan lengkap di [TUTORIAL.md](./TUTORIAL.md).
</details>

<details>
<summary><b>Apakah harus install MySQL?</b></summary>

**Tidak perlu!** Database memakai **SQLite** — cukup satu file (`db/custom.db`).
Tidak ada instalasi, tidak ada konfigurasi server database. Backup = copy file-nya saja.
</details>

<details>
<summary><b>Lupa password admin, bagaimana?</b></summary>

Jalankan ulang seed admin: hapus row Admin di database (bisa via script Prisma Studio
`npx prisma studio`), lalu `bun scripts/seed.ts` — login kembali dengan
`admin/admin123` dan segera ganti password.
</details>

<details>
<summary><b>Bisa menambah kategori baru? (misal: "Blower")</b></summary>

Bisa, dari dashboard: **Kategori → + Kategori Baru**. Isi nama, slug otomatis,
pilih ikon. Kategori baru langsung muncul di katalog & form produk.
</details>

<details>
<summary><b>Bagaimana cara membuat produk "harga hubungi kami"?</b></summary>

Kosongkan kolom harga saat membuat produk — katalog otomatis menampilkan
**"Hubungi Kami"** dan tombol WhatsApp tetap berfungsi.
</details>

<details>
<summary><b>Apakah data produk contoh bisa dihapus?</b></summary>

Bisa. Hapus satu per satu dari dashboard (📦 Produk → 🗑️), atau mulai dari database
kosong: `npm run db:reset` lalu seed ulang **hanya admin & kategori** (edit seed bila perlu).
</details>

---

## 🗺️ Roadmap

- [ ] Keranjang belanja & pemesanan langsung (checkout)
- [ ] Ekspor laporan produk ke Excel/PDF
- [ ] Notifikasi pesan baru via WhatsApp API
- [ ] Multi-gambar drag & drop dengan urutan
- [ ] Statistik kunjungan grafik (recharts)

> 💡 Punya ide fitur? Silakan ajukan lewat kontak di bawah!

---

## 🤝 Kontribusi

Kontribusi sangat diterima! 🎉

1. 🍴 Fork repositori ini
2. 🌿 Buat branch fitur: `git checkout -b fitur/KeunikanBaru`
3. 💾 Commit: `git commit -m "Tambah: fitur keunikan baru"`
4. 📤 Push: `git push origin fitur/KeunikanBaru`
5. 🔃 Buka Pull Request

---

## 📄 Lisensi

Proyek ini dibuat untuk kebutuhan bisnis **Berkat Mandiri Pendingin**.
Bebas digunakan dan dimodifikasi untuk kepentingan pemilik toko. 🧊

---

## 🏆 Kredit

Karya ini lahir dari kolaborasi para ahli:

| Peran | Pelaku |
|-------|--------|
| 💻 **Pengembangan Aplikasi** | **PT Digital Bisnis Manajemen (Digiman)** |
| 🌐 **Hosting & Domain** | [**juraganwebsite.web.id**](https://juraganwebsite.web.id) |

> Kredit ini juga tampil elegan di **footer website**, **halaman login admin**,
> dan **sidebar dashboard** — menghormati siapa pun yang berada di balik layar. 🙏

---

## 📞 Kontak

<div align="center">

**❄️ Berkat Mandiri Pendingin** — *Solusi Kompresor & Sparepart AC Terpercaya*

🏪 Alamat & 📱 Nomor WhatsApp dapat dilihat di bagian **Kontak** website,
atau diatur sendiri lewat **Dashboard → Pengaturan**.

| Kebutuhan | Ke Mana |
|-----------|---------|
| 🛒 Order & tanya stok | Tombol WhatsApp mengambang di website |
| 📨 Pesan tertulis | Form kontak di website |
| 🛠️ Kendala aplikasi | Lihat [TUTORIAL.md](./TUTORIAL.md) & menu **Panduan** di dashboard |

---

<div>

![Fitur](https://img.shields.io/badge/Fitur-21%2B-14b8a6?style=flat-square)
![Endpoint API](https://img.shields.io/badge/Endpoint_API-20-0ea5e9?style=flat-square)
![Tabel DB](https://img.shields.io/badge/Tabel_Database-5-a855f7?style=flat-square)
![Bahasa](https://img.shields.io/badge/Bahasa-Indonesia%20🇮🇩-ef4444?style=flat-square)

**Dibuat dengan ❄️ & ☕ — Terima kasih telah menggunakan Berkat Mandiri Pendingin!**

</div>

</div>
