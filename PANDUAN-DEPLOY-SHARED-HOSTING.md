# 🚀 Panduan Deploy ke Shared Hosting — Berkat Mandiri Pendingin

> Panduan lengkap memasang website ini di **shared hosting cPanel** (PHP) agar
> langsung tampil online — **tanpa VPS, tanpa Node.js, tanpa database server**.
> Dashboard admin tetap berfungsi 100%: kelola produk, kategori, halaman CMS,
> media, pesan, dan pengaturan langsung dari website yang sudah online.

---

## 📌 Ringkasan: 3 Cara Menuju Online

| Cara | Cocok untuk | Admin Dashboard | Kesulitan |
|------|-------------|-----------------|-----------|
| **A. PHP Shared Hosting** ⭐ | cPanel hosting biasa (juraganwebsite, dsb.) | ✅ Berfungsi penuh | Mudah — upload & extract |
| **B. cPanel "Setup Node.js App"** | Hosting yang mendukung Node.js (CloudLinux) | ✅ Berfungsi penuh | Sedang |
| **C. Netlify / Vercel Drop** | Tampilan cepat, tanpa admin | ❌ Hanya katalog statis | Termudah |

**Rekomendasi: Cara A** — dirancang khusus untuk shared hosting Indonesia.

---

## 🧠 Bagaimana Cara A Bekerja? (Arsitektur)

Website dipecah menjadi dua bagian yang bekerja sama:

```
┌────────────────────────────────────────────────────────────┐
|  public_html/  (folder domain di shared hosting)           |
|                                                            |
|  index.html  _next/  uploads/  logo.svg   ← SITUS STATIS   |
|  (hasil export Next.js — HTML/CSS/JS murni, super cepat)   |
|                                                            |
|  .htaccess       ← aturan Apache: /api/* diarahkan ke PHP  |
|  api/index.php   ← PHP API Bridge (pengganti server Node)  |
|  api/lib/        ← kode PHP (auth, store, handlers)        |
|  api/data/*.json ← "database" (produk, kategori, settings) |
|  uploads/        ← semua gambar produk & media             |
└────────────────────────────────────────────────────────────┘
```

- Pengunjung membuka website → menerima **HTML statis** (instan, hemat CPU).
- React mengambil data dari `/api/...` → `.htaccess` meneruskan ke **PHP Bridge**
  → PHP membaca/menulis file JSON di `api/data/`.
- Admin login → **session PHP** (cookie aman httpOnly, berlaku 7 hari).
- Hasilnya: tampilan & fitur **identik dengan versi aslinya**, karena PHP Bridge
  meniru 100% REST API Next.js (terverifikasi 70/70 pengujian otomatis ✅).

---

## 🛠️ Langkah 0 — Membangun Paket Deploy (di komputer lokal)

> **Lewati langkah ini jika sudah ada file `build/berkat-mandiri-website.zip`.**

Pastikan bisa menjalankan proyek (Bun terpasang), lalu:

```bash
bun install        # sekali saja, pasang dependensi
bun run build:deploy
```

Script akan:
1. Mengekspor seluruh data dari SQLite → `api/data/*.json`
2. Membangun situs statis Next.js (`BUILD_EXPORT=1`, terisolasi dari dev)
3. Menyalin PHP Bridge + menulis `.htaccess`
4. Mengemas semuanya → **`build/berkat-mandiri-website.zip`** (~50 MB)

> ⚠️ Jalankan ini setiap kali kode/data berubah & ingin di-upload ulang.

---

## 📤 Langkah 1 — Upload ke cPanel (±5 menit)

1. **Login cPanel** → buka **File Manager**.
2. Masuk ke folder **`public_html`**
   *(kalau memakai subdomain: `public_html/nama-subdomain` — folder itu pun harus kosong & menjadi root)*.
3. Klik **Upload** → pilih `build/berkat-mandiri-website.zip` → tunggu selesai.
4. Kembali ke File Manager → klik kanan ZIP → **Extract** → dialog muncul,
   isi path `public_html` → **Extract File(s)**.
5. Hapus file ZIP-nya (opsional, kerapian).
6. Pastikan struktur seperti ini:

```
public_html/
├── .htaccess          ← WAJIB ADA (tampil setelah "Show Hidden Files")
├── index.html
├── _next/
├── uploads/
├── logo.svg, favicon.svg, robots.txt
└── api/
    ├── index.php
    ├── .htaccess
    ├── lib/
    └── data/  (admins.json, products.json, settings.json, dst.)
```

> 💡 Di File Manager, aktifkan **Settings → Show Hidden Files (dotfiles)** agar
> `.htaccess` terlihat. Jika `.htaccess` tidak ikut terekstrak, upload manual
> dari `build/deploy/.htaccess`.

7. **Selesai!** Buka `https://domainanda.com` — website langsung tampil. 🎉

---

## ✅ Langkah 2 — Ceklis Setelah Online

| Cek | Cara |
|-----|------|
| Beranda tampil | Buka domain — hero, kategori, produk unggulan muncul |
| Katalog berisi 1000 produk | Menu **Katalog** → "Menampilkan 12 dari 1000 produk" |
| Dashboard admin | Buka `https://domainanda.com/#/admin` → login |
| Login berhasil | default `admin` / `admin123` |
| **Ganti password!** | Menu **Pengaturan → Akun** → ubah password segera |
| Upload gambar | Produk → Tambah → unggah foto → tersimpan & tampil |
| Halaman CMS | Menu **Informasi** di header → Tentang Kami, FAQ, dll. |

---

## 🔐 Cara Kerja Data & Backup

- Seluruh perubahan dari dashboard (produk baru, ubah harga, dll.) **langsung
  tersimpan** ke file JSON di `api/data/` di hosting — tidak perlu deploy ulang.
- **Backup**: File Manager → masuk `api/data/` → download 6 file JSON.
- **Restore**: upload kembali file JSON tersebut (menimpa).
- Gambar yang diunggah admin tersimpan di `uploads/` — backup folder ini juga.

### Menambah produk baru setelah online
1. Login `/#/admin` → **Produk → Tambah Produk** → isi & unggah foto → Simpan.
2. Selesai — langsung muncul di katalog pengunjung. ✨

---

## ⚙️ Pengaturan PHP yang Disarankan (cPanel)

- **PHP Version**: 7.4 atau lebih baru (8.1–8.3 ideal) — *MultiPHP Manager*.
- **Ukuran upload**: bila unggah foto > 2MB gagal, buka *Select PHP Version →
  Options* (atau *MultiPHP INI Editor*) dan setel:
  - `upload_max_filesize = 8M`
  - `post_max_size = 8M`
- **memory_limit** ≥ 128M (standar hosting sudah cukup).

## 🔒 Memaksa HTTPS (opsional tapi disarankan)

Setelah SSL aktif (AutoSSL/Let's Encrypt di cPanel), tambahkan di **baris
paling atas** `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ⚠️ Penting: Harus di Root Domain/Subdomain

Situs memakai URL absolut (`/api/...`, `/uploads/...`) sehingga **harus dipasang
di root** sebuah domain/subdomain (`public_html` untuk domain utama, atau
`public_html/nama-subdomain` untuk subdomain). **Jangan** dipasang di subfolder
domain utama (mis. `domain.com/toko/`) — gambar & API tidak akan ditemukan.

---

## 🚑 Troubleshooting

| Gejala | Penyebab & Solusi |
|--------|-------------------|
| Halaman putih / 404 saat buka domain | `index.html` tidak ada di root — extract ulang ZIP; pastikan tidak ada folder bersarang |
| Beranda tampil tapi produk kosong | `.htaccess` hilang/tak terbaca → pastikan ada & memuat rule `RewriteRule ^api(/.*)?$ api/index.php`; aktifkan *Show Hidden Files* |
| Klik login → "Terjadi kesalahan" | PHP terlalu lama (< 7.4)? Ganti versi PHP di MultiPHP Manager |
| Upload foto gagal > 2MB | Naikkan `upload_max_filesize` (lihat pengaturan PHP di atas) |
| Icon/aset 404 | `_next/` tidak lengkap — extract ulang, jangan pindah-pindah file |
| "Index of /" (daftar file) | Directory listing tampil karena `index.html` tak ada di root |
| Error 500 setelah edit .htaccess | Sintaks salah — pulihkan dari `build/deploy/.htaccess` |
| Data admin terkunci / lupa password | Upload ulang `api/data/admins.json` dari backup (hash password lama) |

**Uji cepat API**: buka `https://domainanda.com/api/products?limit=1` — jika
muncul teks JSON berisi produk, berarti bridge berjalan sempurna.

---

## 🅱️ Alternatif B — cPanel "Setup Node.js App"

Jika hosting menyediakan *Setup Node.js App* (CloudLinux Passenger):

1. Build standalone: `bun run build` (memakai config `output: "standalone"`).
2. Upload `.next/standalone/`, `.next/static/`, `public/`, `prisma/`, `db/`,
   `package.json`, `node_modules/.prisma` ke folder aplikasi.
3. cPanel → *Setup Node.js App* → Node 20+ → *Application root* = folder tadi,
   *Application startup file* = `server.js` → **Run NPM Install** → **Restart**.
4. Set environment: `DATABASE_URL=file:/absolut/path/db/custom.db`,
   `NODE_ENV=production`, `AUTH_SECRET=<string acak panjang>`.
5. Buat `.env` berisi `DATABASE_URL` yang sama di folder aplikasi.

> Catatan: versi Node ini memakai SQLite asli — backup file `db/custom.db`.

## 🅲 Alternatif C — Netlify / Vercel (statis saja)

1. `bun run build:deploy` → ambil folder `build/deploy` **tanpa** folder `api`.
2. Netlify: *Add new site → Deploy manually* → seret isinya. Selesai.
3. Kekurangan: tanpa PHP, `/api/*` tidak ada → katalog kosong & admin nonaktif.
   Gunakan hanya untuk pratinjau desain.

---

## 📦 Isi Teknis Paket

| Komponen | Sumber | Peran |
|----------|--------|-------|
| `index.html`, `_next/` | `next build` (export) | Antarmuka situs |
| `uploads/` | `public/uploads` | 191 gambar produk/media |
| `api/index.php` + `lib/` | `php-api/` | Mirror 100% REST API Next.js |
| `api/data/*.json` | `scripts/export-data.mjs` | Database awal (1000 produk, 13 kategori, 6 halaman, 3 pesan, 17 pengaturan, 1 admin) |
| `.htaccess` | `scripts/build-deploy.mjs` | Rewrite `/api` → PHP, kompresi, cache, proteksi |

Skrip terkait:

```bash
bun run export:data    # SQLite → JSON saja
bun run build:deploy   # paket lengkap + ZIP
bash tests/test-php-api.sh   # 70 pengujian otomatis PHP Bridge
```

---

*Dibangun dengan 💚 oleh PT Digital Bisnis Manajemen (Digiman) — Hosting & Domain by juraganwebsite.web.id*
