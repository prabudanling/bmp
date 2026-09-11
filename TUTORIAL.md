# 📘 TUTORIAL LENGKAP — Website Berkat Mandiri Pendingin

Panduan bahasa Indonesia untuk menjalankan, mengelola, dan meng-upload website
kompresor & sparepart AC **Berkat Mandiri Pendingin**.

---

## Daftar Isi

1. [Ringkasan Fitur](#1-ringkasan-fitur)
2. [Menjalankan di Komputer (Lokal)](#2-menjalankan-di-komputer-lokal)
3. [Cara Pakai Dashboard Admin](#3-cara-pakai-dashboard-admin)
4. [Panduan Deploy ke Shared Hosting (cPanel)](#4-panduan-deploy-ke-shared-hosting-cpanel)
5. [Alternatif: Deploy ke VPS](#5-alternatif-deploy-ke-vps)
6. [Struktur Proyek](#6-struktur-proyek)
7. [Pertanyaan yang Sering Ditanyakan (FAQ)](#7-pertanyaan-yang-sering-ditanyakan-faq)

---

## 1. Ringkasan Fitur

### 🌐 Website Publik (dilihat pelanggan)
- **Beranda** — banner besar, kategori produk, produk unggulan, keunggulan toko,
  tentang kami, merek yang dilayani, dan form kontak.
- **Katalog** — pencarian, filter kategori, urutkan (terbaru/terpopuler/harga),
  dan paginasi.
- **Detail Produk** — galeri foto, harga, status stok, spesifikasi teknis,
  tombol **Pesan via WhatsApp** (pesan otomatis terisi), dan produk terkait.
- **Kontak** — form pesan yang masuk langsung ke dashboard admin + tombol chat
  WhatsApp mengambang di semua halaman.

### 🔐 Dashboard Admin (khusus pemilik toko)
- **Login aman** dengan password ter-enkripsi (bcrypt) + sesi JWT httpOnly cookie.
- **Ringkasan** — statistik produk, pesan belum dibaca, stok menipis, produk terbaru.
- **Kelola Produk** — tambah/edit/hapus, upload foto (maks 3MB), spesifikasi
  teknis, atur stok, harga, tampilkan/sembunyikan produk, tandai unggulan.
- **Kelola Kategori** — buat/edit/hapus kategori + pilih ikon.
- **Kotak Pesan** — baca pesan pelanggan dari form kontak, balas via
  WhatsApp/Email 1 klik.
- **Pengaturan** — ubah nama toko, nomor WhatsApp, alamat, jam buka, teks
  banner, dll. **Semua tombol WhatsApp di website otomatis mengikuti nomor di sini.**
- **Panduan** — tutorial singkat di dalam dashboard.

---

## 2. Menjalankan di Komputer (Lokal)

### Prasyarat
- **Node.js 18+** (disarankan 20) atau **Bun**
- Terminal / command prompt

### Langkah

```bash
# 1. Masuk ke folder proyek
cd berkat-mandiri-pendingin

# 2. Install dependensi
npm install          # jika pakai npm
# atau
bun install          # jika pakai bun

# 3. Siapkan database (SQLite — tidak perlu install apapun)
npm run db:push      # membuat struktur database
bun scripts/seed.ts  # mengisi data awal: admin, kategori, 14 produk contoh

# 4. Jalankan website
npm run dev
```

Buka **http://localhost:3000** 🎉

### Login admin default

| Username | Password   |
|----------|------------|
| `admin`  | `admin123` |

> ⚠️ **PENTING:** Segera ganti password setelah login pertama kali
> (menu **Pengaturan → Ubah Password Admin**).

---

## 3. Cara Pakai Dashboard Admin

### A. Menambah Produk (upload barang + deskripsi lengkap)

1. Login → menu **Produk** → tombol **Tambah**.
2. Isi data:
   - **Nama Produk** (wajib) — tulis lengkap dengan tipe/kode part,
     contoh: *Kompresor Rotary Daikin 1 PK (JT125BAY1L)*.
   - **Merek & SKU** — memudahkan pencarian.
   - **Kategori** — pilih yang sudah ada, atau buat dulu di menu Kategori.
   - **Deskripsi Singkat** (maks 160 karakter) — tampil di kartu produk.
   - **Deskripsi Lengkap** — tampil di halaman detail. Tekan Enter 2x untuk
     paragraf baru.
   - **Harga (Rp)** — tulis angka saja (contoh: `1850000`).
     **Kosongkan** jika ingin menampilkan "Hubungi Kami".
   - **Stok** — jika `0`, produk otomatis diberi label **Stok Habis**.
3. **Upload foto** — klik area putus-putus, pilih 1 foto atau banyak sekaligus.
   - Format: JPG / PNG / WEBP / GIF, maksimal **3MB per foto**.
   - Foto **pertama** otomatis jadi foto utama.
4. Tambahkan **Spesifikasi Teknis** (misal Voltase, Refrigerant, Garansi).
5. Klik **Simpan Produk**. Selesai! Produk langsung tampil di katalog.

### B. Mengatur Produk Unggulan & Status
- Di tabel daftar produk:
  - **Switch "Aktif"** → tampilkan/sembunyikan produk di katalog.
  - **Ikon ⭐** → jadikan Produk Unggulan (tampil di beranda).
  - **Menu ⋮** → Edit, Lihat di Website, atau Hapus.

### C. Mengelola Kategori
- Menu **Kategori** → **Tambah Kategori** → beri nama + pilih ikon.
- Kategori yang masih berisi produk **tidak bisa dihapus** (pindahkan dulu
  produknya).

### D. Membalas Pesan Pelanggan
- Menu **Pesan** → pesan dari form kontak tampil di sini.
- Klik **"Balas via WhatsApp"** → chat terbuka dengan nomor pelanggan.
- Klik ikon **amplop terbuka** untuk menandai sudah dibaca.

### E. Mengubah Info Toko (WA, alamat, dll)
- Menu **Pengaturan** → ubah **Nomor WhatsApp**, alamat, jam buka,
  judul banner, teks "Tentang Kami" → **Simpan Pengaturan**.
- Perubahan langsung tampil di seluruh website.

---

## 4. Panduan Deploy ke Shared Hosting (cPanel)

> ### ⚠️ Baca dulu: Syarat Hosting
> Website ini dibangun dengan **Next.js (Node.js)** + **SQLite**.
> Ia **TIDAK bisa** berjalan di shared hosting khusus PHP saja.
> Hosting Anda harus punya fitur **"Setup Node.js App"** (tersedia di cPanel
> dengan CloudLinux/Node.js Selector — banyak hosting Indonesia seperti Niagahoster
> Hostinger, dan DomaiNesia paket tertentu sudah mendukung).
>
> Jika hosting Anda hanya PHP, gunakan **VPS** (lihat Bagian 5) atau upgrade
> paket hosting ke yang mendukung Node.js.

### Langkah Deploy (cPanel + Node.js App)

#### Langkah 1 — Build di komputer lokal
```bash
# di komputer Anda
npm install
npm run build
```

#### Langkah 2 — Siapkan folder upload
Buat file `server.js` di root proyek (sejajar `package.json`):

```js
const { createServer } = require('http')
const next = require('next')

const port = process.env.PORT || 3000
const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port)
})
```

#### Langkah 3 — Set environment untuk produksi
Buat file `.env`:
```env
DATABASE_URL=file:/home/USERNAME-BHPPANEL/app/berkat/db/custom.db
AUTH_SECRET=ganti-dengan-teks-acak-panjang-minimal-32-karakter
NODE_ENV=production
```
> - Ganti `USERNAME-BHPPANEL` dan path sesuai struktur hosting Anda.
> - `AUTH_SECRET` wajib diganti! Isi dengan huruf acak, contoh:
>   `bmp-rahasia-2024-x7k9p2m5q8w3e6r1t4y7u0i9o`

#### Langkah 4 — Upload ke hosting
Upload seluruh isi proyek (kecuali `node_modules` dan `.next` **tidak perlu
di-zip ulang** — cukup zip semua lalu extract di File Manager cPanel) ke
folder misalnya: `/home/user/app/berkat/`.

Yang paling penting ter-upload:
- `.next/` (hasil build), `public/`, `prisma/`, `db/`, `src/`, `scripts/`
- `package.json`, `next.config.ts`, `server.js`, `.env`

#### Langkah 5 — Daftarkan aplikasi Node.js di cPanel
1. cPanel → **Setup Node.js App** → **Create Application**.
2. Isi:
   - **Node.js version**: 18 atau 20
   - **Application mode**: Production
   - **Application root**: `app/berkat`
   - **Application URL**: domain Anda
   - **Application startup file**: `server.js`
3. Klik **Create**.
4. Buka aplikasi → klik **Run NPM Install**.
5. Jalankan perintah berikut lewat tombol **Run JS script** atau SSH:
   ```bash
   npx prisma generate
   npx prisma db push
   node scripts/seed.js   # lihat catatan di bawah
   ```
   > Catatan: hosting biasanya tidak bisa menjalankan TypeScript langsung.
   > Ubah bagian atas `scripts/seed.ts` dari
   > `import { PrismaClient } ...` tetap sama, lalu compile dengan
   > `npx tsc scripts/seed.ts --outDir scripts-dist` atau lebih mudah:
   > jalankan seed **di komputer lokal** sebelum upload (database `db/custom.db`
   > ikut ter-upload beserta isinya). **Cara ini paling praktis.**
6. Klik **Restart** aplikasi.

#### Langkah 6 — Penting: folder `public/uploads` & database
- Foto produk tersimpan di `public/uploads/` dan database di `db/custom.db`.
- **Backup rutin** kedua lokasi ini lewat File Manager (download zip).
- Saat update website (re-deploy), **jangan sampai menimpa** folder
  `public/uploads` dan file `db/custom.db` lama.

#### Langkah 7 — Setelah online, langsung lakukan
1. Login admin → **Pengaturan** → isi nomor WhatsApp, alamat, jam buka asli.
2. **Ubah password** admin.
3. Hapus produk contoh (atau edit jadi produk Anda sendiri).
4. Tambah produk asli Anda + foto.

---

## 5. Alternatif: Deploy ke VPS

VPS memberi kontrol penuh dan performa lebih baik (VPS Ubuntu 20.04+, 1GB RAM cukup).

```bash
# 1. Install Node.js 20 & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2

# 2. Upload proyek (git clone atau scp), lalu:
npm install
npm run build
cp .env.example .env && nano .env   # isi DATABASE_URL & AUTH_SECRET

# 3. Jalankan dengan PM2 (auto-restart)
pm2 start npm --name "berkat-bmp" -- start
pm2 startup && pm2 save

# 4. (Opsional) Nginx reverse proxy port 3000 → port 80 domain Anda
```

---

## 6. Struktur Proyek

```
├── prisma/schema.prisma      # struktur database (Admin, Product, Category,
│                             #   Message, Setting)
├── db/custom.db              # file database SQLite
├── public/uploads/           # foto produk (backup folder ini!)
├── scripts/seed.ts           # data awal (admin, kategori, produk contoh)
├── src/
│   ├── app/page.tsx          # halaman utama (SPA + hash routing)
│   ├── app/api/
│   │   ├── auth/             # login, logout, me, ganti password
│   │   ├── products/         # CRUD produk
│   │   ├── categories/       # CRUD kategori
│   │   ├── messages/         # pesan kontak
│   │   ├── settings/         # pengaturan toko
│   │   ├── upload/           # upload foto
│   │   └── stats/            # ringkasan dashboard
│   ├── components/site/      # tampilan publik (beranda, katalog, detail...)
│   ├── components/admin/     # dashboard admin
│   └── lib/                  # helper (auth JWT, format rupiah, dll)
└── TUTORIAL.md               # file yang sedang Anda baca
```

---

## 7. Pertanyaan yang Sering Ditanyakan (FAQ)

**Q: Kenapa harga produk ada yang tulisannya "Hubungi Kami"?**
A: Karena kolom harga dikosongkan saat membuat produk. Isi harga lewat menu
Edit jika ingin menampilkannya.

**Q: Foto produk saya gagal upload?**
A: Pastikan format JPG/PNG/WEBP/GIF dan ukuran maksimal 3MB. Kompres dulu di
https://tinypng.com jika kebesaran.

**Q: Bagaimana mengubah nama toko di header/footer?**
A: Menu **Pengaturan** → kolom *Nama Toko* → Simpan.

**Q: Apakah bisa banyak admin?**
A: Saat ini satu akun admin. Tabel `Admin` di database mendukung banyak akun —
bisa dikembangkan dengan menambah form registrasi admin baru.

**Q: Bagaimana reset password jika lupa?**
A: Jalankan di komputer/server:
```bash
node -e "const b=require('bcryptjs');console.log(b.hashSync('passwordbaru123',10))"
```
lalu update kolom `password` di tabel `Admin` pada `db/custom.db`
(dengan tool seperti DB Browser for SQLite), atau hubungi developer.

**Q: Apakah data pelanggan aman?**
A: Password admin dienkripsi bcrypt, login memakai JWT httpOnly cookie, dan
semua API admin dilindungi autentikasi. Pastikan `AUTH_SECRET` diganti dan
hosting memakai HTTPS.

---

🎉 **Selamat berjualan!** Semoga **Berkat Mandiri Pendingin** makin berkembang.
