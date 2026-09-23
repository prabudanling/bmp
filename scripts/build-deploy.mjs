/**
 * build-deploy.mjs — Membangun paket deploy shared hosting
 * =========================================================
 * Hasil: build/deploy/ (siap di-zip & upload ke public_html)
 *   ├─ index.html + _next/ + uploads/ + favicon*   (situs statis)
 *   ├─ api-cache/*.json                            (MODE DARURAT: situs tetap
 *   │                                               tampil walau PHP mati)
 *   ├─ cek.php                                     (halaman diagnosis)
 *   ├─ .htaccess                                   (rewrite /api → PHP)
 *   └─ api/                                        (PHP API bridge)
 *      ├─ index.php, lib/, .htaccess
 *      └─ data/*.json                              (database awal)
 * Zip: build/berkat-mandiri-website.zip
 *
 * Semua referensi aset dibuat RELATIF sehingga paket bekerja di
 * domain root MAUPUN di subfolder (mis. domain.com/toko/).
 *
 * Pemakaian:
 *   bun scripts/build-deploy.mjs
 */
import { execSync, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dir, '..')
const DEPLOY = path.join(ROOT, 'build', 'deploy')
const API_BACKUP = path.join(ROOT, '.api-src-backup')
const API_SRC = path.join(ROOT, 'src', 'app', 'api')
const OUT = path.join(ROOT, 'out')
// Next 16 menulis hasil export ke dalam distDir kustom (.next-export)
const EXPORT_DIR = fs.existsSync(path.join(ROOT, '.next-export', 'index.html'))
  ? path.join(ROOT, '.next-export')
  : OUT

function log(step, msg) {
  console.log(`\x1b[36m[${step}]\x1b[0m ${msg}`)
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true })
}

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true })
}

/** Kumpulkan seluruh file di dalam folder secara rekursif. */
function walk(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, base, acc)
    else acc.push(path.relative(base, full))
  }
  return acc
}

/**
 * Pasca-export: ubah referensi absolut menjadi relatif agar paket
 * jalan di root maupun subfolder.
 *  - HTML/JS/TXT : "/_next/..."  → "_next/..."   (relatif thd dokumen)
 *  - CSS         : "/_next/..."  → "../../../_next/..." (relatif thd file CSS)
 *  - HTML        : "/uploads/...","/favicon.svg","/logo.svg" → relatif
 */
function rewriteAssets() {
  const exts = new Set(['.html', '.js', '.css', '.txt'])
  let changed = 0
  for (const rel of walk(DEPLOY)) {
    const ext = path.extname(rel).toLowerCase()
    if (!exts.has(ext)) continue
    const abs = path.join(DEPLOY, rel)
    let text = fs.readFileSync(abs, 'utf-8')
    const before = text
    if (ext === '.css') {
      // CSS dir: _next/static/css/ → naik 3 tingkat ke akar install
      text = text.replace(/\/_next\//g, '../../../_next/')
    } else {
      text = text.replace(/\/_next\//g, '_next/')
    }
    if (ext === '.html') {
      text = text
        .replace(/([\("'`\s])\/uploads\//g, '$1uploads/')
        .replace(/(["'])\/favicon\.svg/g, '$1favicon.svg')
        .replace(/(["'])\/logo\.svg/g, '$1logo.svg')
    }
    if (text !== before) {
      fs.writeFileSync(abs, text, 'utf-8')
      changed++
    }
  }
  log('5b', `Referensi aset dibuat relatif (${changed} file disentuh).`)
}

/* ── 0. Bersihkan area build ─────────────────────────────────────────── */
log('0/9', 'Membersihkan area build...')
rmrf(DEPLOY)
rmrf(OUT)
rmrf(path.join(ROOT, '.next-export'))
fs.mkdirSync(DEPLOY, { recursive: true })

/* ── 1. Salin PHP API bridge ─────────────────────────────────────────── */
log('1/9', 'Menyalin PHP API bridge → deploy/api ...')
copyDir(path.join(ROOT, 'php-api'), path.join(DEPLOY, 'api'))
rmrf(path.join(DEPLOY, 'api', 'data')) // akan diisi ulang oleh export

// Halaman diagnosis diletakkan di akar paket agar mudah diakses
if (fs.existsSync(path.join(ROOT, 'php-api', 'cek.php'))) {
  fs.copyFileSync(path.join(ROOT, 'php-api', 'cek.php'), path.join(DEPLOY, 'cek.php'))
}

/* ── 2. Ekspor data SQLite → JSON (+ snapshot mode darurat) ─────────── */
log('2/9', 'Mengekspor data SQLite → JSON (seed PHP + api-cache)...')
const exportRes = spawnSync(
  process.execPath,
  [
    path.join(ROOT, 'scripts', 'export-data.mjs'),
    '--out', path.join(DEPLOY, 'api', 'data'),
    '--cache', path.join(DEPLOY, 'api-cache'),
  ],
  { stdio: 'inherit', cwd: ROOT }
)
if (exportRes.status !== 0) {
  console.error('❌ Export data gagal.')
  process.exit(1)
}

/* ── 3. Simpan sementara route API Next (tidak ikut static export) ───── */
log('3/9', 'Memindahkan sementara src/app/api (diakhiri dikembalikan)...')
const hadApi = fs.existsSync(API_SRC)
if (hadApi) {
  rmrf(API_BACKUP)
  fs.renameSync(API_SRC, API_BACKUP)
}

let buildOk = false
try {
  /* ── 4. Static export Next.js ──────────────────────────────────────── */
  log('4/9', 'Menjalankan next build (mode export, distDir terpisah)...')
  const build = spawnSync(
    process.execPath,
    [path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'],
    {
      stdio: 'inherit',
      cwd: ROOT,
      env: { ...process.env, BUILD_EXPORT: '1', NODE_ENV: 'production' },
    }
  )
  if (build.status !== 0) throw new Error('next build gagal — lihat log di atas.')
  buildOk = true

  /* ── 5. Salin hasil export ─────────────────────────────────────────── */
  log('5/9', `Menyalin hasil export (${path.relative(ROOT, EXPORT_DIR)}) → deploy/ ...`)
  copyDir(EXPORT_DIR, DEPLOY)

  /* ── 5b. Buat semua referensi aset relatif (root & subfolder) ─────── */
  log('5b/9', 'Menyedot referensi absolut (/_next/, /uploads/) → relatif...')
  rewriteAssets()
} finally {
  /* ── 6. Kembalikan route API Next ──────────────────────────────────── */
  if (hadApi && !fs.existsSync(API_SRC)) {
    fs.renameSync(API_BACKUP, API_SRC)
    log('6/9', 'src/app/api dikembalikan. ✔')
  } else {
    log('6/9', 'src/app/api sudah ada (tidak ada yang perlu dikembalikan).')
  }
}

if (!buildOk) process.exit(1)

// Jangan pernah membawa folder download (berisi ZIP itu sendiri) ke paket
rmrf(path.join(DEPLOY, 'download'))

/* ── 7. .htaccess root + proteksi uploads ────────────────────────────── */
log('7/9', 'Menulis .htaccess (rewrite API + proteksi)...')
fs.writeFileSync(
  path.join(DEPLOY, '.htaccess'),
  `# ============================================================
# Berkat Mandiri Pendingin — konfigurasi Apache/LiteSpeed
# Situs statis + PHP API bridge (dashboard admin tetap jalan).
# Bekerja di domain root maupun subfolder.
# ============================================================

DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Jalankan seluruh permintaan api/* melalui PHP bridge
  RewriteRule ^api/index\\.php$ - [L]
  RewriteRule ^api(/.*)?$ api/index.php [L,QSA]
</IfModule>

# Kompresi & cache aset statis (opsional tapi disarankan)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/gif "access plus 30 days"
  ExpiresByType text/css "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
`,
  'utf-8'
)

// Uploads: hanya izinkan gambar — blokir eksekusi skrip apa pun
fs.writeFileSync(
  path.join(DEPLOY, 'uploads', '.htaccess'),
  `# Hanya sajikan berkas gambar — blokir eksekusi skrip.
<FilesMatch "\\.(php|phtml|php[0-9]|pht|pl|py|cgi|sh|shtml)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>
`,
  'utf-8'
)

// Pastikan folder data ada (berisi JSON hasil export) + proteksi deny
if (!fs.existsSync(path.join(DEPLOY, 'api', 'data'))) {
  fs.mkdirSync(path.join(DEPLOY, 'api', 'data'), { recursive: true })
}
fs.writeFileSync(
  path.join(DEPLOY, 'api', 'data', '.htaccess'),
  `# Folder data berisi seluruh database JSON — TOLAK SEMUA AKSES LANGSUNG.
<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
  Order allow,deny
  Deny from all
</IfModule>
`,
  'utf-8'
)

/* ── 7b. BACA-SAYA-PENTING.txt di akar paket ─────────────────────────── */
fs.writeFileSync(
  path.join(DEPLOY, 'BACA-SAYA-PENTING.txt'),
  `============================================================
 BERKAT MANDIRI PENDINGIN — PANDUAN KILAT UPLOAD SHARED HOSTING
============================================================

CARA PASANG (3 LANGKAH, ±5 MENIT):
  1. Buka cPanel → File Manager → masuk ke folder public_html
  2. Upload file ZIP ini ke DALAM public_html, lalu klik kanan
     ZIP-nya → Extract  (pastikan index.html berada langsung di
     dalam public_html, BUKAN di dalam subfolder baru)
  3. Buka domain Anda di browser — website langsung tampil!

  Dashboard admin  : domain-anda.com/#/admin
  Login bawaan     : admin / admin123  (segera ganti!)

WEBSITE TIDAK MUNCUL / ADA MASALAH?
  Buka: domain-anda.com/cek.php
  Halaman diagnosis akan memeriksa PHP, izin folder, file data,
  dan memberi tahu PERSIS apa yang harus diperbaiki.

CATATAN PENTING:
  • Website ini butuh PHP versi 7.4 atau lebih baru (8.x disarankan).
    Cek/ubah: cPanel → "Select PHP Version" / "MultiPHP Manager".
  • Amang-aman: meski PHP bermasalah, halaman toko tetap tampil
    (mode darurat baca-saja) selama file api-cache/ ikut ter-upload.
  • Untuk fitur admin penuh (edit produk, upload foto): PHP harus
    aktif & folder api/data serta uploads/ harus bisa ditulis (755).
  • Backup rutin: folder uploads/ dan api/data/.

Dokumen lengkap: PANDUAN-DEPLOY-SHARED-HOSTING.md (di folder proyek)
Kredit: Developed by PT Digital Bisnis Manajemen (Digiman)
        Hosting & Domain by juraganwebsite.web.id
`,
  'utf-8'
)

/* ── 8. Zip paket ────────────────────────────────────────────────────── */
log('8/9', 'Membuat file ZIP ...')
const zipPath = path.join(ROOT, 'build', 'berkat-mandiri-website.zip')
rmrf(zipPath)
let zipOk = false
try {
  execSync(`cd "${DEPLOY}" && zip -rq "${zipPath}" .`, { stdio: 'pipe' })
  zipOk = true
} catch {
  // Fallback: python3 zipfile
  execSync(
    `python3 -c "import shutil; shutil.make_archive('${zipPath.replace(/\.zip$/, '')}', 'zip', '${DEPLOY}')"`,
    { stdio: 'pipe' }
  )
  zipOk = fs.existsSync(zipPath)
}
if (!zipOk) {
  console.error('❌ Gagal membuat ZIP (zip/python3 tidak tersedia). Folder deploy/ tetap bisa dipakai manual.')
  process.exit(1)
}

const mb = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1)

console.log('\n══════════════════════════════════════════════════════════')
console.log('🎉 PAKET DEPLOY SIAP!')
console.log('══════════════════════════════════════════════════════════')
console.log(`  ZIP   : build/berkat-mandiri-website.zip  (${mb} MB)`)
console.log(`  Folder: build/deploy/`)
console.log('')
console.log('  Langkah upload (ringkas):')
console.log('  1. Buka cPanel → File Manager → public_html')
console.log('  2. Upload ZIP tadi → klik kanan → Extract')
console.log('  3. Selesai! Buka domain Anda — dashboard admin di /#/admin')
console.log('  Kalau ada masalah: buka /cek.php di browser Anda')
console.log('  Panduan lengkap: PANDUAN-DEPLOY-SHARED-HOSTING.md')
console.log('══════════════════════════════════════════════════════════\n')
