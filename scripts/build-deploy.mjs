/**
 * build-deploy.mjs — Membangun paket deploy shared hosting
 * =========================================================
 * Hasil: build/deploy/ (siap di-zip & upload ke public_html)
 *   ├─ index.html + _next/ + uploads/ + favicon*   (situs statis)
 *   ├─ .htaccess                                   (rewrite /api → PHP)
 *   └─ api/                                        (PHP API bridge)
 *      ├─ index.php, lib/, .htaccess
 *      └─ data/*.json                              (database awal)
 * Zip: build/berkat-mandiri-website.zip
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

/* ── 0. Bersihkan area build ─────────────────────────────────────────── */
log('0/8', 'Membersihkan area build...')
rmrf(DEPLOY)
rmrf(OUT)
rmrf(path.join(ROOT, '.next-export'))
fs.mkdirSync(DEPLOY, { recursive: true })

/* ── 1. Salin PHP API bridge ─────────────────────────────────────────── */
log('1/8', 'Menyalin PHP API bridge → deploy/api ...')
copyDir(path.join(ROOT, 'php-api'), path.join(DEPLOY, 'api'))
rmrf(path.join(DEPLOY, 'api', 'data')) // akan diisi ulang oleh export

/* ── 2. Ekspor data SQLite → JSON ────────────────────────────────────── */
log('2/8', 'Mengekspor data SQLite → JSON (seed PHP backend)...')
const exportRes = spawnSync(
  process.execPath,
  [path.join(ROOT, 'scripts', 'export-data.mjs'), '--out', path.join(DEPLOY, 'api', 'data')],
  { stdio: 'inherit', cwd: ROOT }
)
if (exportRes.status !== 0) {
  console.error('❌ Export data gagal.')
  process.exit(1)
}

/* ── 3. Simpan sementara route API Next (tidak ikut static export) ───── */
log('3/8', 'Memindahkan sementara src/app/api (diakhiri dikembalikan)...')
const hadApi = fs.existsSync(API_SRC)
if (hadApi) {
  rmrf(API_BACKUP)
  fs.renameSync(API_SRC, API_BACKUP)
}

let buildOk = false
try {
  /* ── 4. Static export Next.js ──────────────────────────────────────── */
  log('4/8', 'Menjalankan next build (mode export, distDir terpisah)...')
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
  log('5/8', `Menyalin hasil export (${path.relative(ROOT, EXPORT_DIR)}) → deploy/ ...`)
  copyDir(EXPORT_DIR, DEPLOY)
} finally {
  /* ── 6. Kembalikan route API Next ──────────────────────────────────── */
  if (hadApi && !fs.existsSync(API_SRC)) {
    fs.renameSync(API_BACKUP, API_SRC)
    log('6/8', 'src/app/api dikembalikan. ✔')
  } else {
    log('6/8', 'src/app/api sudah ada (tidak ada yang perlu dikembalikan).')
  }
}

if (!buildOk) process.exit(1)

/* ── 7. .htaccess root + proteksi uploads ────────────────────────────── */
log('7/8', 'Menulis .htaccess (rewrite API + proteksi)...')
fs.writeFileSync(
  path.join(DEPLOY, '.htaccess'),
  `# ============================================================
# Berkat Mandiri Pendingin — konfigurasi Apache/LiteSpeed
# Situs statis + PHP API bridge (dashboard admin tetap jalan).
# ============================================================

Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Jalankan seluruh permintaan /api/* melalui PHP bridge
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

/* ── 8. Zip paket ────────────────────────────────────────────────────── */
log('8/8', 'Membuat file ZIP ...')
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
console.log('  Panduan lengkap: PANDUAN-DEPLOY-SHARED-HOSTING.md')
console.log('══════════════════════════════════════════════════════════\n')
