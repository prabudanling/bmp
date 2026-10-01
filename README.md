<div align="center">

<img src="public/images/logo.svg" width="96" alt="Logo Berkat Mandiri Pendingin" />

# 🧊 BERKAT MANDIRI PENDINGIN

### *Pusat AC, Kompresor, Refrigerant & Spare Part Terlengkap di Indonesia*

**Website Company Profile + Katalog Produk B2B — Cepat, Elegan, dan Dicintai Google** 💚

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Static Export](https://img.shields.io/badge/Deploy-Hosting_Apa_Saja-22C55E?style=for-the-badge&logo=apache&logoColor=white)
![SEO Ready](https://img.shields.io/badge/SEO-JSON--LD_+_Sitemap-F59E0B?style=for-the-badge&logo=google&logoColor=white)

**Bahasa:** 🇮🇩 Indonesia · [🇬🇧 English](#-english-documentation)

</div>

---

## 📖 Daftar Isi

- [✨ Tentang Proyek Ini](#-tentang-proyek-ini)
- [🛡️ Jaminan Totalitas Gambar — 100%](#️-jaminan-totalitas-gambar--100)
- [🚀 Mulai Cepat (3 Perintah)](#-mulai-cepat-3-perintah)
- [📜 Semua Perintah](#-semua-perintah)
- [🏗️ Arsitektur](#️-arsitektur)
- [📂 Struktur Proyek](#-struktur-proyek)
- [🌍 Upload / Deploy — Panduan Anti-Gagal](#-upload--deploy--panduan-anti-gagal)
- [💚 Fitur SEO (Dicintai Google)](#-fitur-seo-dicintai-google)
- [🌐 Fitur Dwi-Bahasa (ID/EN)](#-fitur-dwi-bahasa-iden)
- [🆘 Troubleshooting](#-troubleshooting)
- [🏛️ Kredit & Penghargaan](#️-kredit--penghargaan)
- [📄 Lisensi](#-lisensi)

---

## ✨ Tentang Proyek Ini

Website resmi **PT Berkat Mandiri Pendingin** — distributor HVAC resmi sejak **2010** di Kawasan Industri MM2100, Bekasi. Dibangun untuk **tampil kelas dunia** dan **merajai halaman pencarian Google**.

| 💪 Kemampuan | Keterangan |
|---|---|
| 🛒 **Katalog 120 Produk** | 10 kategori — AC Split, Kompresor, Refrigerant, Spare Part, Chiller/VRV, Mesin Pendingin, Pipa & Fitting, Oli & Cairan, Aksesoris, Evaporator & Kondensor |
| 🔎 **Filter & Pencarian Instan** | Filter kategori, merek, harga, stok — semuanya berjalan di browser, nol jeda |
| 🛍️ **Keranjang + WhatsApp Order** | Pelanggan memesan lewat klik — pesan otomatis terformat rapi ke WhatsApp sales |
| 🌏 **Dwi-Bahasa ID/EN** | Satu klik, seluruh website berganti bahasa — preferensi tersimpan permanen |
| 💚 **SEO Total** | JSON-LD (Organization + LocalBusiness + WebSite), sitemap.xml, robots.txt, OpenGraph, meta 25 kata kunci |
| 📱 **Mobile-First** | Sempurna dari layar 320px sampai ultrawide |
| ⚡ **100% Statis** | `output: 'export'` — hasilnya file HTML murni, hosting seadanya pun kencang |
| 🖼️ **Nol Gambar Rusak** | Dijamin oleh tool audit `check:assets` — lihat bagian di bawah |

---

## 🛡️ Jaminan Totalitas Gambar — 100%

> **Masalah lama:** pernah upload lalu gambar tampil kosong semua? 😢
> **Solusi permanen:** di repo ini, *tidak mungkin lagi*. Berikut buktinya.

### ✅ Hasil Audit Terbaru — `bun run check:assets`

```text
🔍 BERKAT MANDIRI PENDINGIN — AUDIT TOTALITAS ASET
════════════════════════════════════════════════════════════════

📂 KATEGORI (10)          → ✅ 10/10 file ada
📦 PRODUK (120 produk)    → ✅ 10/10 path gambar ada
💻 REFERENSI DI KODE      → ✅ semua path /images/ ada
⭐ ASET WAJIB BRAND       → ✅ logo.svg + hero-1.png + favicon ada

🟢 SEMPURNA — TOTALITAS 100%! AMAN UPLOAD/DEPLOY.
```

### 📦 Inventaris Lengkap Aset (semua **ter-track di git** — ikut ter-upload)

| Aset | Jumlah | Lokasi | Status |
|---|---:|---|:-:|
| Gambar Kategori | 10 | `public/images/categories/` | ✅ |
| Gambar Produk | 10 | `public/images/products/` | ✅ |
| Gambar Hero + OG Image | 1 | `public/images/hero/` | ✅ |
| Logo (SVG vektor + favicon) | 2 | `public/images/logo.svg` · `src/app/icon.svg` | ✅ |
| Database berisi data (120 produk, 10 kategori, 7 testimoni) | 1 | `db/custom.db` | ✅ |

### 🧯 Tiga Penyebab "Gambar Kosong" — dan Bagaimana Repo Ini Membunuhnya

| # | Penyebab di masa lalu | Solusi permanen di repo ini |
|:-:|---|---|
| 1 | **`DATABASE_URL` path absolut** (`file:/home/z/...`) — di komputer/hosting lain path itu tidak ada → database kosong → katalog kosong | ✅ Diganti path **relatif portabel** `file:../db/custom.db` — jalan di mesin ** mana pun** |
| 2 | Database tidak ikut ter-upload / kosong saat deploy | ✅ `db/custom.db` **ter-track git** + seed lengkap siap pakai: `bun run db:seed` |
| 3 | Gambar direferensikan tapi filenya lupa di-upload | ✅ **Mustahil terlewat** — `bun run check:assets` memblokir upload jika ada 1 file pun hilang (exit code ≠ 0) |

---

## 🚀 Mulai Cepat (3 Perintah)

```bash
# 1. Install + generate Prisma client + audit aset (sekali jalan)
bun run setup

# 2. Jalankan mode pengembangan
bun run dev          # → http://localhost:3000

# 3. Sebelum upload ke hosting — audit totalitas + lint
bun run predeploy    # 🟢 lolos = aman upload
```

> **Tanpa Bun?** Bisa pakai Node.js 20+: `npm install` → `npm run db:generate` → `npm run dev`. Tapi Bun jauh lebih cepat: [bun.sh](https://bun.sh)

---

## 📜 Semua Perintah

| Perintah | Fungsi |
|---|---|
| `bun run dev` | 🔥 Mode pengembangan di port 3000 |
| `bun run build` | 📦 Build produksi **statis** → hasil di folder **`out/`** |
| `bun run start` | 🌐 Preview hasil build (`serve out/`) |
| `bun run predeploy` | 🛡️ **WAJIB sebelum upload** — audit totalitas gambar + lint |
| `bun run check:assets` | 🔍 Audit semua gambar (DB + kode) vs file fisik |
| `bun run db:seed` | 🌱 Isi ulang database (10 kategori, 120 produk, 7 testimoni) |
| `bun run db:push` | 📐 Terapkan skema Prisma ke database |
| `bun run db:generate` | ⚙️ Generate Prisma Client |
| `bun run lint` | 🧹 Cek kualitas kode (ESLint) |
| `bun run setup` | 🎬 Instalasi awal lengkap untuk komputer baru |

---

## 🏗️ Arsitektur

```text
┌────────────────────────────────────────────────────────────┐
│                     SAAT BUILD (sekali)                     │
│                                                             │
│   db/custom.db ──▶ Prisma ──▶ page.tsx (Server Component)   │
│   120 produk                  membaca SEMUA data            │
│   10 kategori                       │                       │
│   7 testimoni                       ▼                       │
│                        HTML + CSS + JS murni (folder out/)  │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼  upload folder out/
┌────────────────────────────────────────────────────────────┐
│                 SAAT DIKUNJUNGI PENGUNJUNG                  │
│                                                             │
│   Hosting apa saja (Apache/Nginx/cPanel) — TANPA Node.js!   │
│   Filter, pencarian, keranjang, dwi-bahasa:                 │
│   semuanya berjalan instan di browser pengunjung ⚡          │
└────────────────────────────────────────────────────────────┘
```

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Prisma 6 + SQLite · Framer Motion · Zustand · Lucide Icons

---

## 📂 Struktur Proyek

```text
berkat-mandiri-pendingin/
├── 📁 public/
│   └── 📁 images/
│       ├── 📁 categories/     # 10 gambar kategori
│       ├── 📁 products/       # 10 gambar produk
│       ├── 📁 hero/           # hero + OpenGraph image
│       └── 📄 logo.svg        # logo vektor (JSON-LD + favicon)
├── 📁 db/
│   └── 📄 custom.db           # database SQLite — DATA LENGKAP, ikut ter-upload
├── 📁 prisma/
│   ├── 📄 schema.prisma       # skema: Category, Product, Testimonial, Order…
│   └── 📄 seed.ts             # seed lengkap 3.256 baris — data tak pernah hilang
├── 📁 scripts/
│   └── 📄 check-assets.ts     # 🛡️ auditor totalitas gambar
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📄 layout.tsx      # metadata SEO lengkap + dwi-bahasa
│   │   ├── 📄 page.tsx        # server component + JSON-LD @graph
│   │   ├── 📄 icon.svg        # favicon
│   │   └── 📄 sitemap.ts      # sitemap.xml otomatis
│   ├── 📁 components/berkat/  # 20+ komponen (Header, Hero, Catalog, Footer…)
│   └── 📁 lib/
│       ├── 📄 db.ts           # Prisma client singleton
│       └── 📄 i18n.ts         # kamus dwi-bahasa 320+ kunci
└── 📄 .env                    # DATABASE_URL relatif — portabel ke mesin mana pun
```

---

## 🌍 Upload / Deploy — Panduan Anti-Gagal

### 🅰️ Shared Hosting / cPanel (paling umum)

```bash
bun run predeploy        # 🛡️ pastikan 🟢 TOTALITAS 100%
bun run build            # → menghasilkan folder out/
```
1. Buka **File Manager** cPanel → `public_html`
2. Upload **SELURUH ISI folder `out/`** (bukan foldernya)
3. Selesai! ✅ Website hidup — tanpa Node.js, tanpa database server

### 🅱️ VPS (Nginx)

```bash
bun run predeploy && bun run build
# arahkan root nginx ke folder out/
sudo cp -r out/* /var/www/berkatmandiripendingin/
```
```nginx
server {
    server_name berkatmandiripendingin.com www.berkatmandiripendingin.com;
    root /var/www/berkatmandiripendingin;
    index index.html;
    location / { try_files $uri $uri/ $uri/index.html =404; }
}
```

### 🅲 Vercel / Netlify

Framework preset **Next.js**, build `bun run build`, output directory **`out/`**.
> ⚠️ Catatan: Vercel menambahkan satu lapis abstraksi — untuk website statis murni ini, shared hosting/VPS sudah lebih dari cukup dan lebih hemat.

### 🔁 Update Data Produk di Masa Depan

1. Ubah data di database (atau edit `prisma/seed.ts` lalu `bun run db:seed`)
2. `bun run check:assets` 🟢 → `bun run build` → upload ulang `out/`

---

## 💚 Fitur SEO (Dicintai Google)

| Fitur | Status |
|---|:-:|
| JSON-LD `@graph`: Organization + LocalBusiness + WebSite | ✅ |
| `metadataBase` + canonical URL | ✅ |
| OpenGraph lengkap (`id_ID`) + Twitter Card `summary_large_image` | ✅ |
| `robots.txt` dengan direktif eksplisit per-bot + lokasi sitemap | ✅ |
| `sitemap.xml` otomatis (`force-static`) | ✅ |
| Template judul + 25 kata kunci industri HVAC | ✅ |
| `alt` deskriptif untuk semua gambar + heading semantik h1→h3 | ✅ |
| Favicon + logo vektor terdaftar di JSON-LD | ✅ |

**Setelah live:** daftarkan ke [Google Search Console](https://search.google.com/search-console) → submit `https://www.berkatmandiripendingin.com/sitemap.xml` → peringkat mulai dirayapi. 🚀

---

## 🌐 Fitur Dwi-Bahasa (ID/EN)

- Tombol **ID | EN** di header (desktop & mobile)
- 320+ kunci terjemahan — **seluruh** antarmuka ikut berganti
- Preferensi tersimpan permanen di browser (Zustand + persist)
- Konten database (nama produk) tetap sesuai data asli distributor

---

## 🆘 Troubleshooting

<details>
<summary><b>😭 "Gambar produk kosong semua!"</b></summary>

Jalankan `bun run check:assets`. Jika 🟢: berarti masalahnya database — pastikan `db/custom.db` ikut ada di server/build dan `.env` memakai path relatif `file:../db/custom.db` (bukan absolut!). Jika perlu isi ulang data: `bun run db:seed`.
</details>

<details>
<summary><b>🔌 <code>Error: error validating datasource</code> / database not found</b></summary>

`.env` harus berisi: `DATABASE_URL=file:../db/custom.db` — lalu `bun run db:generate`. Path dihitung relatif terhadap folder `prisma/`, jadi file database berada di `<proyek>/db/custom.db`.
</details>

<details>
<summary><b>🖼️ Gambar 404 setelah upload</b></summary>

Pastikan meng-upload **isi** folder `out/` (yang sudah termasuk `images/`), bukan folder proyek mentah. Verifikasi lokal: `bun run build && bun run start`.
</details>

<details>
<summary><b>🌐 Bahasa berubah sendiri di komputer lain?</b></summary>

Itu fitur — preferensi bahasa tersimpan per-browser. Tekan tombol ID/EN untuk berganti kapan saja.
</details>

---

## 🏛️ Kredit & Penghargaan

<div align="center">

| | |
|:-:|:-:|
| 🎯 **STRATEGIC CONSULTING** | 💻 **DIGITAL PLATFORM & SYSTEM** |
| **PT Top Konsultan Internasional** | **PT Digital Bisnis Manajemen** — [digiman.id](https://digiman.id) |

*Dirancang dengan standar konsultan kelas dunia. Dibangun dengan presisi kelas engineer.*

</div>

**PT Berkat Mandiri Pendingin** — Distributor HVAC resmi sejak 2010
📧 info@berkatmandiripendingin.com · ☎️ +62 813-5000-3423 · 📍 Kawasan Industri MM2100, Bekasi

---

## 📄 Lisensi

Hak cipta © 2010–2025 **PT Berkat Mandiri Pendingin**. Seluruh hak cipta dilindungi.
Kode & desain: lisensi MIT.

<div align="center">
<sub>Dibangun dengan ❤️, teh ☕, dan determinasi 🔥 — supaya tidak pernah lagi ada gambar yang kosong.</sub>
</div>

---

<div align="center">

---

## 🇬🇧 English Documentation

### The Complete, Image-Guaranteed, SEO-Loving Corporate Website

**PT Berkat Mandiri Pendingin** — Indonesia's HVAC distributor since 2010. A fully static Next.js 16 corporate site with a 120-product B2B catalog, WhatsApp ordering, ID/EN bilingual UI, and complete structured-data SEO.

#### Quick Start
```bash
bun run setup      # install + prisma generate + asset audit
bun run dev        # develop at localhost:3000
bun run predeploy  # MANDATORY before upload — image totality + lint
bun run build      # static export → ./out
```

#### Why images can NEVER go blank again
1. **Portable relative `DATABASE_URL`** (`file:../db/custom.db`) — works on any machine, no more empty-database builds.
2. **`db/custom.db` is git-tracked** — full data ships with the repo; `bun run db:seed` can always restore it.
3. **`bun run check:assets`** audits every image referenced by the database *and* the source code against the filesystem, and **fails the build with exit code 1** if a single file is missing.

#### Deployment
Static export (`output: 'export'`) produces pure HTML/CSS/JS in **`out/`** — upload its *contents* to any shared hosting (cPanel), Nginx/Apache VPS, or set output dir `out/` on Vercel/Netlify. No Node.js server required in production.

#### Credits
- 🎯 **Strategic Consulting** — PT Top Konsultan Internasional
- 💻 **Digital Platform & System** — PT Digital Bisnis Manajemen ([digiman.id](https://digiman.id))

---

<sub>© 2010–2025 PT Berkat Mandiri Pendingin · Code: MIT</sub>

</div>
