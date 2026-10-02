# Arsitektur CMS dan catatan pemulihan

**Status keputusan: 2 Oktober 2026.** Tahap darurat tetap memakai Vercel; migrasi ke Hostinger belum dilakukan.

## Peta komponen saat ini

- **Aplikasi:** Next.js 16 App Router di Vercel. Routing server-side dan halaman admin harus tetap berjalan sebagai aplikasi Node.js; jangan mengubahnya menjadi static export.
- **Database aktif:** Neon Postgres melalui `pg` dan Drizzle di `src/lib/cms-db.ts`. Skema Prisma/SQLite yang ada adalah sisa jalur lama dan bukan sumber data CMS yang digunakan halaman admin aktif. Jangan menjalankan `db:push` atau `db:reset` sebagai bagian dari backup.
- **Autentikasi admin:** Neon Auth; akses admin dibatasi `CMS_ADMIN_EMAIL`. Konektor Dropbox memakai ID stabil admin yang sudah login melalui Vercel Connect.
- **Foto sumber:** Dropbox melalui konektor user-scoped `dropbox/digiman`. Hak minimum yang diminta aplikasi sekarang mencakup baca metadata, baca konten, dan tulis konten.
- **Gambar turunan untuk website:** Vercel Blob. URL gambar disimpan di database; sumber foto pada folder Dropbox adalah jalur untuk membuat ulang gambar turunan yang diproses.
- **Domain:** belum dipindahkan atau diubah. Perpindahan domain dilakukan setelah host tujuan siap, dengan DNS dipisahkan dari migrasi database dan media.

## Backup Dropbox yang tersedia

Buka **Admin → Cadangan CMS** dan pilih **Buat backup sekarang** setelah Dropbox meminta persetujuan tambahan untuk izin unggah.

- File dibuat manual di `/Berkat-Mandiri-CMS-Backups` sebagai JSON gzip, dengan nama unik.
- Database diekspor dalam satu transaksi `REPEATABLE READ READ ONLY`; ekspor mencakup delapan tabel publik yang sudah diperiksa: `articles`, `categories`, `cms_articles`, `cms_settings`, `product_image_assets`, `products`, `site_settings`, dan `testimonials`.
- Tabel autentikasi `neon_auth` sengaja dikecualikan. Snapshot tidak menyalin sesi, akun, atau kredensial autentikasi.
- Ekspor menyimpan daftar kolom, primary key, jumlah baris, data, dan versi format. Jika ada tabel `public` baru atau tabel yang diharapkan hilang, proses berhenti agar tidak membuat backup yang diam-diam tidak lengkap.
- Setelah upload, ukuran dan Dropbox content hash dibandingkan dengan file hasil ekspor. Token Dropbox tidak dikirim ke browser atau disimpan pada database.
- Tidak ada cron/scheduler, retensi otomatis, layanan baru, atau biaya langganan tambahan yang dibuat.

### Batas yang belum tertutup

- Backup ini mencakup **database**, bukan isi biner Vercel Blob. Foto sumber yang sudah ada di Dropbox tidak disalin ulang. Gambar dari sumber eksternal atau Blob yang tidak dapat dibuat ulang dari Dropbox perlu dipindahkan terpisah sebelum migrasi host.
- Backup belum menyediakan tombol restore dan belum menjalani uji pemulihan pada database staging. Keberadaan file dan hash yang cocok belum membuktikan pemulihan berhasil.
- Backup masih manual dan riwayatnya mengikuti kuota Dropbox. Tetapkan jadwal manual dan hapus snapshot lama melalui Dropbox setelah kebijakan retensi disepakati.

## Runbook awal

1. Masuk sebagai admin, otorisasi ulang Dropbox bila diminta, lalu buat backup sebelum perubahan data atau deployment yang berisiko.
2. Pastikan file muncul pada riwayat admin dan ukurannya masuk akal. Simpan salinan file snapshot menggunakan Dropbox, bukan tautan sementara yang dibagikan.
3. Saat insiden, hentikan perubahan konten dan pertahankan database sumber. Jangan menimpa produksi dengan import spontan.
4. Pulihkan atau buat database terisolasi sesuai kemampuan branch/riwayat plan Neon. Unduh snapshot, validasi format/versi dan jumlah baris, lalu lakukan pemulihan di lingkungan terisolasi.
5. Bandingkan data dan jalankan smoke test CMS sebelum mengarahkan aplikasi ke database yang dipulihkan. Pemulihan produksi memerlukan prosedur import yang teruji; prosedur itu belum tersedia di aplikasi ini.
6. Jika gambar turunan hilang, pertahankan referensi sumber Dropbox dan rencanakan pemrosesan ulang. Jangan menghapus Blob lama sebelum URL pengganti diverifikasi.

## Jalur portabilitas ke Hostinger (belum dijalankan)

1. Pastikan paket Hostinger yang aktif memang menyediakan aplikasi Node.js/Next.js dengan versi Node yang dibutuhkan dan proses server persisten; ketersediaan fitur bergantung paket serta panel akun.
2. `package.json` saat ini memakai `bunx serve out` sebagai skrip `start`. Itu bukan server produksi Next.js untuk App Router dinamis. Sebelum Hostinger, ubah start/build sesuai mode deploy Node.js yang didukung paket dan uji build production.
3. CMS menggunakan PostgreSQL. Jangan mengasumsikan database MySQL pada shared hosting kompatibel. Opsi minim risiko adalah mempertahankan Neon Postgres sementara dan menguji akses jaringan keluar dari host; migrasi DB baru dilakukan dengan pemetaan tipe, relasi, dan data.
4. Siapkan environment server secara terpisah: URL database, autentikasi, Blob, dan connector/token tidak disalin ke browser atau file publik. Selesaikan otorisasi domain/callback sebelum mengganti DNS.
5. Migrasikan media yang perlu self-hosted ke penyimpanan tujuan, uji URL publik dan hak akses, lalu lakukan smoke test login admin, artikel, produk, gambar, sitemap, serta form sebelum perubahan DNS.
6. Siapkan rollback DNS dan pertahankan deployment/database lama sampai pengujian pemulihan serta periode stabilitas disepakati.

## Catatan kepatuhan Vercel Hobby

Vercel menyatakan Hobby untuk penggunaan personal/non-komersial. Website operasional bisnis perlu memeriksa ketentuan paket dan memilih paket yang sesuai; penggunaan Vercel di tahap darurat tidak mengubah batas lisensi tersebut. Tidak ada deployment atau perubahan paket yang dilakukan oleh catatan ini.

## Referensi teknis yang diterapkan

- Vercel Connect: gunakan subject `user` dari sesi server yang nyata; minimalkan scope; token tetap server-only.
- Database: snapshot baca-saja, konsisten satu transaksi, query tabel dibatasi allowlist, dan kegagalan skema bersifat fail-closed.
- Dropbox: gunakan content hash Dropbox untuk verifikasi upload, bukan menganggap HTTP sukses saja sebagai backup valid.
- UX admin: status belum terhubung, sedang memproses, sukses, gagal, riwayat kosong, dan koneksi gagal ditampilkan terpisah.
- Reliabilitas: backup belum disebut pulih sampai restore drill berhasil; caveat ini ditampilkan pada panel dan catatan.

Sumber kebijakan/fitur berubah dari waktu ke waktu. Verifikasi ulang dokumentasi resmi Vercel, Dropbox, Neon, dan paket Hostinger sebelum perubahan hosting atau retensi.
