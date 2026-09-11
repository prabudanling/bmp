# Worklog — Proyek Berkat Mandiri Pendingin

---
Task ID: 1
Agent: Z.ai Code (main)
Task: Membangun website kompresor & sparepart AC "Berkat Mandiri Pendingin" lengkap dengan dashboard admin (frontend + backend) + tutorial bahasa Indonesia.

Work Log:
- Inspeksi struktur proyek Next.js 16 + shadcn/ui + Prisma; install `jose` & `bcryptjs`.
- Definisi Prisma schema: Admin, Category, Product, Message, Setting → `bun run db:push` (SQLite di db/custom.db).
- Generate 8 gambar AI (hero, kompresor, fan motor, kapasitor, termostat, freon, filter dryer, teknisi) via CLI z-ai ke public/uploads/ (ratelimit 429 diatasi dengan antrean berurutan; ukuran valid kelipatan 32px).
- Backend: 13 route API — auth (login/logout/me/change-password dengan JWT httpOnly + bcrypt), products CRUD + filter q/category/status/sort/paginasi (slug atau id), categories CRUD (blokir hapus jika ada produk), upload (validasi tipe & 3MB), messages (publik + honeypot; admin read/delete), settings (key-value merge default), stats (ringkasan dashboard).
- Seed scripts/seed.ts idempotent: admin (admin/admin123), 6 kategori, 14 produk berdeskripsi lengkap + spesifikasi, 2 pesan contoh.
- Frontend publik (SPA hash-router di satu route `/`): header sticky + topbar info, hero gelap berpola + foto, grid kategori, produk unggulan, keunggulan, tentang, strip merek, CTA, kontak (form + honeypot), footer 4 kolom mt-auto, tombol WhatsApp mengambang, dark mode (next-themes), font Plus Jakarta Sans, tema teal.
- Admin dashboard: guard login, sidebar gelap + badge pesan belum dibaca, Ringkasan (4 stat + pesan terbaru + stok menipis + produk terbaru), Produk (tabel: search/filter/sort, switch aktif, toggle unggulan, hapus via AlertDialog, paginasi), Form Produk (upload multi-foto + preview, editor spesifikasi dinamis, validasi), Kategori (dialog + icon picker), Pesan (filter belum dibaca, balas WA/email, tandai dibaca), Pengaturan (info toko live + ganti password), Panduan (accordion 8 topik).
- Perbaikan lint: react-hooks/set-state-in-effect (useSyncExternalStore untuk mounted, eslint-disable terkelola), unused directives, refactor reset page tanpa effect.
- Bugfix: 2 gambar seed tersimpan di root proyek (backgrounding shell) → dipindah ke public/uploads; refresh badge statistik via event `bmp:refresh-stats`; perbaikan kehilangan blok API call di submit form produk.
- Verifikasi E2E Agent Browser: beranda, katalog + filter + paginasi, detail produk (views counter naik), login admin, dashboard stats, tambah produk (POST 201), edit produk + kategori (PUT), halaman kategori/pesan/pengaturan, kirim pesan kontak (toast sukses + data masuk), upload API (200 dengan cookie, 401 tanpa), settings PUT tersimpan, logout + guard, responsivitas mobile 390px (hamburger menu OK).
- Menulis TUTORIAL.md (bahasa Indonesia): fitur, instalasi lokal, panduan admin, deploy shared hosting cPanel Node.js App + server.js, deploy VPS PM2, struktur, FAQ.

Stage Summary:
- Website lengkap & tervalidasi E2E: katalog publik + dashboard admin fungsional (produk CRUD, upload foto, kategori, pesan, pengaturan).
- Login default: admin / admin123 (diarahkan untuk segera diganti).
- Data & konfigurasi toko dapat diubah penuh dari dashboard (tanpa coding).
- Artefak utama: prisma/schema.prisma, src/app/api/**, src/components/site/**, src/components/admin/**, scripts/seed.ts, TUTORIAL.md.
- Catatan deploy: butuh hosting berfitur Node.js App (bukan PHP-only); backup rutin public/uploads + db/custom.db.

---
Task ID: 2
Agent: Z.ai Code (main)
Task: Membuat README.md terlengkap berbahasa Indonesia untuk website Berkat Mandiri Pendingin.

Work Log:
- Membaca worklog Task 1, package.json, prisma/schema.prisma, TUTORIAL.md, dan scripts/seed.ts untuk memastikan semua fakta README akurat.
- Inventarisasi 14 file route API + metode HTTP (GET/POST/PUT/DELETE) dari source code.
- Menulis README.md (624 baris, 22 bagian utama) berisi: banner ASCII + badge, daftar isi, tentang proyek, fitur lengkap (publik + admin), login default (admin/admin123), tabel teknologi (Next.js 16, TS 5, React 19, Tailwind 4, Prisma 6 + SQLite), diagram arsitektur ASCII, struktur folder lengkap, instalasi 5 langkah, tabel 8 perintah npm, skema 5 tabel database, dokumentasi API lengkap dengan contoh curl, panduan admin kilat, ringkasan deploy (cPanel Node.js App + VPS), checklist keamanan, tabel troubleshooting 8 kasus, FAQ 6 pertanyaan (details/summary), roadmap, kontribusi, lisensi, kontak.

Stage Summary:
- README.md jadi: 624 baris, seluruhnya berbahasa Indonesia, akurat terhadap codebase (endpoint, model DB, skrip, kredensial diverifikasi dari source).
- Melengkapi TUTORIAL.md (step-by-step operasional) dengan README (referensi teknis: API docs, schema DB, struktur folder, troubleshooting).
- Tidak ada perubahan kode aplikasi; situs tetap berjalan normal.
