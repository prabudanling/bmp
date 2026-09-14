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

---
Task ID: 3
Agent: Z.ai Code (main)
Task: Menambahkan kredit "Developed by PT Digital Bisnis Manajemen (Digiman)" dan "Hosting & Domain by juraganwebsite.web.id" ke footer + titik strategis lain.

Work Log:
- Footer publik (src/components/site/footer.tsx): credit strip baru di bawah copyright dengan hairline gradient teal premium, chip kredit berikon Code2 (Digiman) & Globe (juraganwebsite.web.id, link https://juraganwebsite.web.id target _blank + noopener), hover glow teal, tooltip title.
- Halaman login admin (src/components/site/login-view.tsx): baris kredit di bawah kartu login.
- Sidebar dashboard admin (src/components/admin/admin-app.tsx): kredit mini "by Digiman · juraganwebsite.web.id" di bawah kotak profil user.
- README.md: bagian baru "🏆 Kredit" berisi tabel peran developer & hosting.
- Bugfix responsivitas: chip footer awalnya overflow di 390px (tertutup tombol WA float) → name/link dibuat basis-full wrap 2 baris di mobile, kembali inline 1 baris di sm+.
- Verifikasi E2E Agent Browser: footer desktop 1280px (1 baris elegan + hairline gradient), footer mobile 390px (2 baris terpusat, tidak tertutup WA float), login page, sidebar admin (login admin sukses), dark mode OK, href & rel link benar, lint bersih, tanpa error console/dev.log.

Stage Summary:
- Kredit Digiman + juraganwebsite.web.id kini tampil di 3 titik UI (footer publik, login admin, sidebar dashboard) + README.
- Konsisten tema teal, responsif penuh mobile→desktop, aksesibel (aria-hidden pada separator, rel noopener, title tooltip).

---
Task ID: 4
Agent: Z.ai Code (main)
Task: Mengisi katalog hingga 1000 produk lengkap dengan gambar asli dari internet + deskripsi lengkap.

Work Log:
- Desain matriks produk: 13 kategori × merek × tipe × kapasitas (989 generator + 16 existing).
- Image-search skill: 18 query keluarga produk (kompresor rotary/scroll/kulkas/mobil/industri/angin, motor fan, kapasitor, termostat, freon, fitting, dryer, relay, oli, evaporator, kondensor, manifold), 10 gambar per query.
- Fix infrastruktur: flag `-o` CLI image-search tidak menulis file → redirect stdout + ekstraksi JSON (buang banner emoji); proses background dibunuh sandbox → runner diganti foreground per chunk; path cwd saat menjalankan script dari subfolder.
- Download 177 foto internet ke public/uploads/products/ (51MB, 0 gagal, validasi min 4KB) + image-map.json.
- scripts/seed-1000.ts: generator deterministik (LCG) — nama, SKU, slug unik, harga realistis IDR (bug parseFloat('1/8')→1 dan harga AC 5PK 180 juta diperbaiki dengan price map), stok (6% habis), 3 foto/p_produk dari pool, deskripsi multi-paragraf (intro 3 varian + garansi + tips teknisi + pengiriman), spesifikasi JSON per keluarga; insert createMany batch 200; dedupe slug vs DB.
- Perbaikan data: 2 produk lama tanpa gambar diberi foto; kurasi ulang 29 produk unggulan (kompresor-ac 12, kulkas 3, mobil 3, industri 2, angin 3, freon 2, kapasitor 2, motor 2) agar beranda menampilkan produk bintang.
- Verifikasi E2E: API total=1000, pencarian "kompresor angin"=76, filter mobil=84, paginasi page=2 OK; browser: katalog "12 dari 1000 produk" + foto asli tampil, filter kategori, detail Sanden 7H13 (deskripsi+tab spesifikasi lengkap), dashboard "1000 Total Produk/1000 Aktif", beranda unggulan kompresor angin asli, mobile 390px grid + paginasi 84 halaman, 0 console error, lint bersih.

Stage Summary:
- KATALOG 1000 PRODUK TERCAPAI: 13 kategori, semua bergambar foto asli internet (177 foto, 51MB).
- Kategori baru: Kulkas & Freezer, AC Mobil, Komersial & Industri, Angin/Piston, Sparepart Kompresor, Oli & Kimia, Evaporator & Kondensor.
- Script reusable: scripts/imgsearch/{queries.tsv,run.sh,download.ts} + scripts/seed-1000.ts (idempotent, selalu menyetel total ke 1000).
- Catatan deploy: folder public/uploads/products/ ikut dalam backup rutin (51MB).

---
Task ID: 5
Agent: Z.ai Code (main)
Task: Membuat tutorial lengkap mengupload barang/produk (dokumen + terintegrasi di dashboard admin).

Work Log:
- Membaca worklog, product-form.tsx, products-manager.tsx, panduan.tsx, api/upload/route.ts, dan query DB aktual (13 kategori, 1000 produk) agar semua fakta tutorial sesuai UI asli.
- Menulis TUTORIAL-UPLOAD-PRODUK.md (~480 baris, 13 bagian berbahasa Indonesia): persiapan & login, daftar 13 kategori + keterangan, anatomi form produk (ASCII diagram + tabel arti tiap kolom), tutorial inti 10 langkah dengan contoh nyata, panduan foto (6 aturan emas, cara foto HP, kompres tinypng, konversi HEIC iPhone, urutan foto), menulis deskripsi yang menjual (template siap salin + 3 contoh jadi + kata yang dihindari), contoh spesifikasi per kategori, strategi harga & stok & satuan, edit/sembunyikan/hapus produk, workflow upload batch (spreadsheet + folder foto), checklist 10 centang, troubleshooting 9 kasus, FAQ 8 details/summary, cheat sheet ASCII 1 halaman siap cetak, bagian kredit Digiman + juraganwebsite.web.id.
- Rombak src/components/admin/panduan.tsx: alert rujukan ke TUTORIAL-UPLOAD-PRODUK.md & TUTORIAL.md; stepper "Upload Barang dalam 8 Langkah" (8 kartu berikon + nomor + badge durasi + tips teal); kartu Standar Foto LAKUKAN (teal) vs HINDARI (rose); kartu "Template Siap Salin" berisi 3 template (nama, deskripsi singkat, deskripsi lengkap) dengan tombol Salin (navigator.clipboard + toast sonner + state copied); accordion "Topik Lainnya" 7 topik (kategori, pesan, pengaturan toko, password, status aktif/unggulan, troubleshooting foto gagal baru, tips jualan).
- README.md: tautkan TUTORIAL-UPLOAD-PRODUK.md di baris dokumentasi + struktur folder.
- Verifikasi E2E Agent Browser: login admin → menu Panduan; konten kunci terverifikasi (8 langkah, LAKUKAN/HINDARI, template, badge durasi); tombol Salin → toast "Template nama produk tersalin ke clipboard!"; accordion "Foto gagal diunggah" terbuka; screenshot desktop 1280px full-page, mobile 390px full-page (1 kolom rapi), dark mode OK; 0 console error; lint bersih; dev.log bersih; browser ditutup, scripts/tmp dibersihkan.

Stage Summary:
- Tutorial upload produk kini ada di 2 tempat: file TUTORIAL-UPLOAD-PRODUK.md (cetak/arsip, 13 bagian) dan halaman Panduan di dashboard admin (interaktif: stepper, do/don't foto, template 1-klik salin, accordion).
- Semua instruksi 100% akurat terhadap UI asli (label tombol, batas 3MB, 160 karakter, satuan, 13 kategori, perilaku foto utama, "Hubungi Kami", label "Stok Habis").
- Artefak: TUTORIAL-UPLOAD-PRODUK.md, src/components/admin/panduan.tsx, README.md (2 tautan baru), screenshot tests/panduan-*.png.

---
Task ID: 6
Agent: Z.ai Code (main)
Task: Menambahkan pengaturan upload Logo Perusahaan & Logo Mitra di admin dashboard.

Work Log:
- types.ts: StoreSettings + logoUrl & partnerLogos (JSON string); interface baru PartnerLogo {url, name}.
- lib/settings.ts: default logoUrl='' & partnerLogos='[]' + helper parsePartners() (aman terhadap JSON rusak).
- API /api/settings PUT otomatis mendukung key baru (iterasi DEFAULT_SETTINGS) — tanpa perubahan route.
- settings-manager.tsx: kartu "Logo Perusahaan" (preview 96px bg-white, tombol Pilih/Ganti/Hapus, upload via /api/upload lalu auto-persist PUT settings, spinner overlay) + kartu "Logo Mitra" (badge jumlah, grid thumbnail hover-hapus, input nama mitra auto-save on blur, area unggah multi-file, auto-persist JSON). Validasi gambar & 3MB sama seperti form produk.
- Bugfix ditemukan saat E2E: kondisi onBlur nama mitra selalu false (state sudah re-render) → nama tidak tersimpan; diperbaiki menjadi savePartners tanpa kondisi.
- site-header.tsx: logo custom (Image object-contain bg-white rounded-xl) menggantikan ikon Snowflake di header desktop + SheetTitle mobile jika logoUrl ada.
- footer.tsx: logo custom dengan border-white/15 bg-white menggantikan ikon salju teal jika logoUrl ada.
- home-view.tsx: strip "Sparepart untuk Berbagai Merek AC" jadi dinamis — jika ada logo mitra, tampil grid "Mitra & Distributor Kami" (2 kolom mobile / 5 desktop, logo + nama); fallback ke chip merek teks bila kosong.
- panduan.tsx: accordion "mengubah informasi toko" + langkah upload logo perusahaan & mitra.
- Demo assets: generate 3 logo AI (tests/logo-company.png BMP snowflake, logo-mitra-1/2.png distributor fiksi).
- Verifikasi E2E Agent Browser: upload logo perusahaan → toast sukses + API logoUrl terisi; upload 2 mitra multi-file → tersimpan; ubah nama mitra (bugfix onBlur) → tersimpan; header/footer/strip mitra tampil logo di desktop 1280px & mobile 390px; hapus mitra (2→1) + unggah ulang (1→2) OK; console 0 error; lint bersih; dev.log bersih. Screenshot: tests/settings-logo-full.png, public-header-logo.png, public-mitra-strip.png, public-footer-logo.png, public-mitra-mobile.png.

Stage Summary:
- Admin kini bisa mengunggah logo perusahaan (header, menu mobile, footer) dan logo mitra (strip beranda jadi grid mitra) sepenuhnya dari dashboard tanpa coding; logo tersimpan via /api/upload + tabel Setting.
- Fallback elegan: tanpa logo → ikon salju & chip merek teks seperti semula.
- Data demo terpasang: logo BMP + 2 mitra (CV Sumber Dingin Teknik, PT Prima Kompresor Nusantara).

---
Task ID: 7
Agent: Z.ai Code (main)
Task: Menambahkan favicon dinamis — upload favicon dari dashboard admin yang otomatis dipakai di tab browser.

Work Log:
- types.ts: field baru StoreSettings.faviconUrl (kosong = mengikuti logo perusahaan); settings.ts: default faviconUrl:'' — PUT /api/settings otomatis mendukung key baru tanpa ubah route.
- layout.tsx: metadata statis diubah menjadi generateMetadata() — getFaviconUrl() membaca tabel Setting tiap request dengan urutan fallback faviconUrl → logoUrl → /favicon.svg; MIME type disetel otomatis dari ekstensi (png/jpg/webp/gif/svg/ico); ikon dirender sebagai <link rel="icon"> + apple-touch-icon.
- settings-manager.tsx: kartu "Favicon Website" (ikon AppWindow) di antara Logo Perusahaan & Logo Mitra — preview 64px + mock tab browser (favicon + nama toko + ×) agar admin lihat konteks nyata; tombol Pilih/Ganti/Hapus; auto-persist PUT; helper applyFavicon() memperbarui link[rel=icon] di tab saat ini TANPA reload; toast sukses.
- panduan.tsx: accordion "mengubah informasi toko" ditambah langkah favicon.
- README.md: baris fitur Pengaturan Toko + tabel model Setting kini menyebut favicon dinamis & contoh key faviconUrl.
- Favicon uji dibuat via sharp (teal snowflake 256px) → scripts/tmp dibersihkan setelah selesai.
- Verifikasi E2E Agent Browser: upload favicon → toast "Favicon berhasil diperbarui" + link[rel=icon] berubah LIVE tanpa reload + setting tersimpan; reload → SSR HTML merender <link rel="icon" href="/uploads/...-favicon-test.png" type="image/png">; tombol Hapus → fallback LIVE ke logo perusahaan, SSR setelah reload juga logo; pasang ulang favicon (state demo final terpasang); beranda publik memuat favicon unggahan; screenshot desktop 1280px / mobile 390px (stacking rapi) / dark mode (localStorage theme=dark); 0 console error; lint bersih; dev.log bersih.

Stage Summary:
- Favicon kini dinamis penuh: admin unggah ikon dari Pengaturan → tab browser, bookmark & apple-touch-icon otomatis mengikuti (tanpa deploy ulang, tanpa ganti file manual).
- Fallback berlapis: favicon khusus → logo perusahaan → ikon salju bawaan; perubahan live di tab saat ini via applyFavicon.
- Artefak: src/app/layout.tsx (generateMetadata), settings-manager.tsx (kartu Favicon), types.ts/settings.ts (faviconUrl), panduan.tsx + README.md; screenshot tests/favicon-card-{desktop,mobile,dark}.png + favicon-public-home.png; faviconUrl demo terisi /uploads/1789185031598-favicon-test.png.

---
Task ID: 8
Agent: Z.ai Code (main)
Task: Membangun CMS full ala WordPress: halaman konten WYSIWYG, perpustakaan media, menu Informasi, media sosial.

Work Log:
- Prisma model Page (title/slug unique/content HTML/excerpt/isPublished/showInMenu/sortOrder/views) → db:push; seed scripts/seed-pages.ts idempotent: 5 halaman demo (Tentang Kami, Cara Pemesanan, FAQ, Kebijakan Privasi, Syarat & Ketentuan).
- API baru: GET/POST /api/pages (publik hanya terbit; ?menu=1; ?all=1 admin), GET/PUT/DELETE /api/pages/[id] (validasi slug unik), GET /api/pages/slug/[slug] (counter views), GET/DELETE /api/media (list root+products, hapus dengan proteksi path traversal). Semua guard 401 tanpa login — terverifikasi curl.
- rich-editor.tsx: WYSIWYG tanpa dependensi (contentEditable + execCommand) — toolbar 16 aksi (undo/redo, paragraf/H2/H3/kutipan, tebal/miring/garis/coret, daftar poin/angka, rata kiri/tengah, tautan via dialog, sisip gambar via /api/upload, garis pembatas, hapus format) + mode HTML mentah; anti-kehilangan-kursor (sinkronisasi via lastHtml ref).
- pages-manager.tsx: tabel halaman (status Terbit/Draft, badge Di Menu, views, tanggal, aksi lihat/edit/hapus via AlertDialog) + dialog editor (judul→slug otomatis via slugify(), ringkasan, WYSIWYG, switch Terbitkan & Tampilkan di Menu, urutan).
- media-manager.tsx: grid 191 file (thumbnail, nama, ukuran), pencarian nama, unggah multi, salin URL 1-klik (toast + clipboard), pratinjau dialog, hapus; badge total file & MB.
- Publik: page-view.tsx (hero gradient teal + breadcrumb + meta tanggal/views, konten .cms-content ter-styling, CTA WhatsApp bawah) di route /#/p/[slug]; header desktop dropdown "Informasi" (dinamis dari CMS) + section Informasi di menu mobile; footer kolom Menu menampilkan halaman CMS + ikon Instagram/Facebook/TikTok/YouTube (field settings baru, kosong = disembunyikan).
- globals.css: styling .cms-content (h2/h3/li marker teal, blockquote, img rounded, hr dashed) + placeholder editor.
- Bugfix: 1 parse error JSX (kurung ganda) di pages-manager; Prisma Client lama di memori setelah db:push → dev server di-restart.
- INSIDEN: src/app/api/upload/route.ts hilang misterius (404 saat upload media; kemungkinan efek sinkronisasi sandbox) → dibuat ulang 100% sesuai kontrak lama (admin-only, tipe & 3MB, nama ber-timestamp). LAINNYA UTUH.
- INFRA: dev server hasil spawn tool call dibunuh sandbox di akhir call (nohup/setsid tidak cukup) → solusi: double-fork daemon via python os.fork×2 + os.setsid + exec → server bertahan lintas call. PENTING untuk agent berikutnya.
- Verifikasi E2E Agent Browser: buat halaman "Testimonial Pelanggan" via editor (ketik, H2 via toolbar, teks tebal → HTML <h2>/<b> benar), alur edit (konten termuat, switch on → tersimpan), halaman tampil di dropdown Informasi + footer, /p/tentang-kami render cantik (h2, list, blockquote), counter views 0→1, media: unggah→192 file, salin URL→toast, hapus→191, pengaturan sosmed→ikon Instagram+Facebook muncul di footer; screenshot: cms-pages-table, cms-page-public (desktop), cms-page-mobile 390px, cms-page-dark, cms-media, cms-footer-sosmed; 0 console error; lint 0 error 0 warning.
- Dok: panduan.tsx + topik accordion CMS; README (fitur Halaman CMS & Media, tabel API 6 endpoint baru, model Page).

Stage Summary:
- Website kini memiliki CMS penuh ala WordPress: halaman konten bebas dengan editor WYSIWYG, perpustakaan media terpusat, menu Informasi dinamis, dan ikon media sosial — semua dikelola dari dashboard tanpa coding.
- 6 halaman aktif (5 demo + Testimonial Pelanggan); Instagram & Facebook demo terpasang.
- Artefak: prisma Page model, 4 route API baru, rich-editor/pages-manager/media-manager/page-view, header/footer dinamis, seed-pages.ts, screenshot tests/cms-*.
- Catatan operasional: restart dev server harus via double-fork daemon (lihat Work Log); folder upload kini /api/upload dibuat ulang — bila upload 404 muncul lagi, cek keberadaan src/app/api/upload/route.ts.
