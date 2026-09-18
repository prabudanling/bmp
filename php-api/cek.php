<?php
/**
 * cek.php — Halaman Diagnosis Website (Berkat Mandiri Pendingin)
 * ================================================================
 * Buka file ini di browser:  domain-anda.com/cek.php
 * Halaman ini memeriksa instalasi shared hosting Anda dan memberi
 * tahu PERSIS apa yang perlu diperbaiki — dengan bahasa sederhana.
 *
 * Aman dihapus kapan saja setelah website berjalan normal.
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');

$ROOT = __DIR__; // folder tempat cek.php berada (akar paket deploy)

/** Tambah hasil pemeriksaan: status = 'ok' | 'warn' | 'fail' | 'info' */
$CHECKS = array();
function add_check($status, $title, $detail, $fix = '')
{
    global $CHECKS;
    $CHECKS[] = array(
        'status' => $status,
        'title' => $title,
        'detail' => $detail,
        'fix' => $fix,
    );
}

/* ── 1. Lokasi instalasi & subfolder ───────────────────────────────── */
$scriptName = isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '/cek.php';
$baseDir = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'domain-anda.com';
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$siteUrl = $scheme . '://' . $host . ($baseDir !== '' ? $baseDir : '/');

if ($baseDir === '' || $baseDir === '/') {
    add_check('ok', 'Lokasi instalasi: akar domain (public_html)', 'Website terpasang di ' . $siteUrl . ' — posisi ini paling ideal.');
} else {
    add_check(
        'warn',
        'Website terpasang di SUBFOLDER: ' . $baseDir,
        'File website berada di dalam folder ' . $baseDir . ' sehingga alamatnya ' . $siteUrl . '. Jika Anda membuka ' . $scheme . '://' . $host . ' dan tidak muncul apa-apa, itu penyebabnya: beranda domain tidak menemukan index.html.',
        'Pindahkan seluruh isi folder ' . $baseDir . ' naik satu level ke public_html (File Manager → select all → Cut → masuk public_html → Paste), atau buka website lewat ' . $siteUrl . '.'
    );
}

/* ── 2. Versi PHP ──────────────────────────────────────────────────── */
$phpOk = version_compare(PHP_VERSION, '7.4.0', '>=');
if ($phpOk) {
    add_check('ok', 'Versi PHP ' . PHP_VERSION, 'Memenuhi syarat (butuh 7.4+, disarankan 8.x).');
} else {
    add_check(
        'fail',
        'Versi PHP ' . PHP_VERSION . ' TERLALU LAMA',
        'Website butuh PHP 7.4 atau lebih baru. Dengan PHP lama, dashboard admin tidak bisa jalan.',
        'cPanel → cari menu "Select PHP Version" atau "MultiPHP Manager" → pilih PHP 8.1 / 8.2 / 8.3 → Save. Lalu muat ulang halaman ini.'
    );
}

/* ── 3. Ekstensi PHP yang dibutuhkan ───────────────────────────────── */
$needExt = array('json', 'mbstring', 'session', 'fileinfo');
$missing = array();
foreach ($needExt as $ext) {
    if (!extension_loaded($ext)) $missing[] = $ext;
}
if (empty($missing)) {
    add_check('ok', 'Ekstensi PHP lengkap (json, mbstring, session, fileinfo)', 'Semua ekstensi yang dibutuhkan tersedia.');
} else {
    add_check(
        'fail',
        'Ekstensi PHP belum aktif: ' . implode(', ', $missing),
        'Fitur tertentu (upload gambar, login) bisa gagal tanpa ekstensi ini.',
        'cPanel → "Select PHP Version" → tab Extensions → centang ' . implode(', ', $missing) . ' → Save.'
    );
}

/* ── 4. File inti website ──────────────────────────────────────────── */
$coreFiles = array(
    'index.html' => 'Halaman utama website (hasil build Next.js)',
    'api/index.php' => 'Jembatan PHP untuk dashboard admin & data',
    'api/lib/handlers.php' => 'Logika backend (produk, pesanan, dll.)',
    '.htaccess' => 'Konfigurasi Apache (routing /api → PHP)',
);
foreach ($coreFiles as $f => $desc) {
    if (file_exists($ROOT . '/' . $f)) {
        add_check('ok', 'File ada: ' . $f, $desc . ' ditemukan.');
    } else {
        add_check(
            'fail',
            'File TIDAK ADA: ' . $f,
            $desc . ' tidak ditemukan di ' . $ROOT . '. Upload belum lengkap atau salah folder.',
            'Upload ulang ZIP dan Extract di lokasi yang benar (public_html), pastikan seluruh file ikut terekstrak.'
        );
    }
}

/* ── 5. Isi index.html benar-benar milik paket ini? ────────────────── */
$idx = @file_get_contents($ROOT . '/index.html');
if ($idx !== false && strpos($idx, '_next') !== false) {
    add_check('ok', 'index.html valid (hasil build Next.js)', 'Ukuran ' . number_format(strlen($idx) / 1024, 1) . ' KB.');
} elseif ($idx !== false) {
    add_check('warn', 'index.html tampak tidak wajar', 'File ada tetapi tidak mengandung aset _next — kemungkinan file lama/salah.');
}

/* ── 6. Database JSON (api/data) ───────────────────────────────────── */
$dataDir = $ROOT . '/api/data';
$dataFiles = array('products.json', 'categories.json', 'pages.json', 'settings.json', 'admins.json');
$foundData = 0;
foreach ($dataFiles as $f) {
    if (file_exists($dataDir . '/' . $f)) $foundData++;
}
if ($foundData === count($dataFiles)) {
    $prodCount = 0;
    $pj = @file_get_contents($dataDir . '/products.json');
    if ($pj) {
        $arr = json_decode($pj, true);
        if (is_array($arr)) $prodCount = count($arr);
    }
    add_check('ok', 'Database JSON lengkap (api/data/)', 'Produk terbaca: ' . number_format($prodCount) . '. Data Anda aman dan siap dipakai.');
} else {
    add_check(
        'fail',
        'Database JSON tidak lengkap (api/data/)',
        'Hanya ' . $foundData . ' dari ' . count($dataFiles) . ' file data ditemukan.',
        'Pastikan Anda mengekstrak SELURUH isi ZIP. File data ada di folder api/data/.'
    );
}

/* ── 7. MODE DARURAT (api-cache) ───────────────────────────────────── */
$cacheDir = $ROOT . '/api-cache';
$cacheFiles = array('products.json', 'categories.json', 'pages.json', 'settings.json');
$foundCache = 0;
foreach ($cacheFiles as $f) {
    if (file_exists($cacheDir . '/' . $f)) $foundCache++;
}
if ($foundCache === count($cacheFiles)) {
    add_check('ok', 'Mode darurat siap (api-cache/)', 'Jika PHP bermasalah, halaman toko TETAP TAMPIL dalam mode baca-saja (tanpa admin). Pengunjung tidak akan melihat website kosong.');
} else {
    add_check(
        'warn',
        'Folder api-cache/ tidak lengkap',
        'Tanpa folder ini, PHP yang bermasalah bisa membuat website tampak kosong.',
        'Upload ulang ZIP (folder api-cache/ harus ikut).'
    );
}

/* ── 8. Izin tulis folder ──────────────────────────────────────────── */
$writeTargets = array(
    'api/data' => 'menyimpan perubahan data dari dashboard admin',
    'uploads' => 'upload foto produk/logo',
);
foreach ($writeTargets as $dirRel => $purpose) {
    $dirAbs = $ROOT . '/' . $dirRel;
    if (!is_dir($dirAbs)) {
        @mkdir($dirAbs, 0755, true);
    }
    $testFile = $dirAbs . '/.cek-tulis-' . uniqid() . '.tmp';
    $canWrite = @file_put_contents($testFile, 'x') !== false;
    if ($canWrite) {
        @unlink($testFile);
        add_check('ok', 'Folder ' . $dirRel . '/ bisa ditulis', 'Dibutuhkan untuk ' . $purpose . '.');
    } else {
        add_check(
            'fail',
            'Folder ' . $dirRel . '/ TIDAK bisa ditulis',
            'Tanpa izin tulis, ' . $purpose . ' akan gagal.',
            'File Manager → klik kanan folder ' . $dirRel . ' → Change Permissions → isi 755 (atau 775) → Change.'
        );
    }
}

/* ── 9. Konfigurasi .htaccess (mod_rewrite) ────────────────────────── */
$ht = @file_get_contents($ROOT . '/.htaccess');
if ($ht !== false && strpos($ht, 'RewriteRule') !== false) {
    add_check('ok', '.htaccess berisi aturan routing API', 'Permintaan /api/* akan diteruskan ke PHP bridge.');
} else {
    add_check(
        'fail',
        '.htaccess tidak ditemukan / rusak',
        'Tanpa file ini, dashboard admin tidak bisa mengakses data (ciri: login gagal "Gagal terhubung").',
        'Upload ulang ZIP — file .htaccess wajib ikut (aktifkan "Show Hidden Files" di File Manager untuk melihatnya).'
    );
}

/* ── 10. Uji nyala API lewat HTTP (loopback) ───────────────────────── */
$apiUrl = $siteUrl . ($baseDir === '' || $baseDir === '/' ? '' : '') . 'api/products?limit=1';
$ctx = stream_context_create(array('http' => array(
    'method' => 'GET',
    'timeout' => 8,
    'ignore_errors' => true,
    'header' => "User-Agent: cek-php/1.0\r\n",
)));
$apiBody = @file_get_contents($apiUrl, false, $ctx);
$apiStatusLine = isset($http_response_header[0]) ? $http_response_header[0] : '';
if ($apiBody !== false && strpos(trim($apiBody), '{') === 0) {
    add_check('ok', 'API merespons dengan benar', 'Uji langsung ke ' . $apiUrl . ' menghasilkan JSON — backend PHP hidup. (' . $apiStatusLine . ')');
} elseif ($apiBody !== false) {
    add_check(
        'warn',
        'API menjawab tetapi BUKAN JSON',
        'Respons: ' . htmlspecialchars(function_exists('mb_substr') ? mb_substr(trim($apiBody), 0, 120) : substr(trim($apiBody), 0, 120)) . ' — biasanya berarti mod_rewrite tidak aktif atau PHP error.',
        'Hubungi hosting: minta mod_rewrite diaktifkan untuk akun Anda. Sementara itu website tetap tampil (mode darurat).'
    );
} else {
    add_check(
        'info',
        'Uji API tidak bisa dilakukan dari dalam server',
        'Server menolak koneksi ke dirinya sendiri (fitur umum di shared hosting). Ini BUKAN error.',
        'Uji manual: buka ' . $apiUrl . ' di browser. Jika tampil teks JSON berawalan { berarti backend sehat.'
    );
}

/* ── 11. Folder uploads berisi gambar? ─────────────────────────────── */
$upDir = $ROOT . '/uploads';
if (is_dir($upDir)) {
    $n = 0;
    foreach (scandir($upDir) as $e) {
        if ($e !== '.' && $e !== '..' && is_file($upDir . '/' . $e)) $n++;
    }
    add_check('ok', 'Folder uploads/ ada (' . number_format($n) . ' file)', 'Foto hero, logo, dan gambar produk tersimpan di sini.');
} else {
    add_check('fail', 'Folder uploads/ TIDAK ADA', 'Gambar produk & logo tidak akan tampil.', 'Upload ulang ZIP (folder uploads/ wajib ikut).');
}

/* ── Render ────────────────────────────────────────────────────────── */
$counts = array('ok' => 0, 'warn' => 0, 'fail' => 0, 'info' => 0);
foreach ($CHECKS as $c) $counts[$c['status']]++;

$verdictTitle = $counts['fail'] > 0
    ? 'DITEMUKAN ' . $counts['fail'] . ' MASALAH SERIUS'
    : ($counts['warn'] > 0 ? 'HAMPIR SEMPURNA — ' . $counts['warn'] . ' hal perlu diperhatikan' : 'SEMUA SEHAT! 🎉');
$verdictDesc = $counts['fail'] > 0
    ? 'Perbaiki item berwarna merah di bawah (ikuti petunjuk "Cara memperbaiki"). Setelah itu muat ulang halaman ini.'
    : ($counts['warn'] > 0
        ? 'Website Anda sudah bisa tampil. Perhatikan saran pada item kuning agar fitur admin berjalan penuh.'
        : 'Tidak ada masalah terdeteksi. Website seharusnya tampil normal di ' . htmlspecialchars($siteUrl));

$STATUS_META = array(
    'ok' => array('✔', '#0d9488', '#f0fdfa', 'OK'),
    'warn' => array('!', '#d97706', '#fffbeb', 'PERHATIAN'),
    'fail' => array('✕', '#dc2626', '#fef2f2', 'MASALAH'),
    'info' => array('i', '#0369a1', '#f0f9ff', 'INFO'),
);

$report = "LAPORAN DIAGNOSIS WEBSITE — " . date('d-m-Y H:i') . "\nURL: " . $siteUrl . "\nPHP: " . PHP_VERSION . "\n\n";
foreach ($CHECKS as $c) {
    $report .= '[' . strtoupper($c['status']) . '] ' . $c['title'] . "\n  " . preg_replace("/\s+/", ' ', strip_tags($c['detail'])) . "\n" . ($c['fix'] ? "  FIX: " . preg_replace("/\s+/", ' ', strip_tags($c['fix'])) . "\n" : '') . "\n";
}
$reportJson = json_encode($report);
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Diagnosis Website — Berkat Mandiri Pendingin</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.55; padding: 24px 16px 60px; }
  .wrap { max-width: 860px; margin: 0 auto; }
  .head { background: linear-gradient(135deg, #0f766e, #14b8a6); color: #fff; border-radius: 18px; padding: 28px 24px; box-shadow: 0 10px 30px rgba(13,148,136,.25); }
  .head h1 { font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
  .head p { margin-top: 6px; opacity: .92; font-size: 14px; }
  .verdict { margin-top: 16px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.25); border-radius: 12px; padding: 14px 16px; }
  .verdict strong { font-size: 16px; }
  .verdict p { margin-top: 4px; font-size: 13.5px; }
  .stats { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
  .stat { background: rgba(255,255,255,.16); border-radius: 10px; padding: 6px 12px; font-size: 12.5px; font-weight: 700; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; margin-top: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,23,42,.05); }
  .row { display: flex; gap: 14px; padding: 16px 18px; border-top: 1px solid #f1f5f9; }
  .row:first-child { border-top: 0; }
  .badge { flex: 0 0 auto; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
  .body { flex: 1; min-width: 0; }
  .body h2 { font-size: 14.5px; font-weight: 700; }
  .body .detail { font-size: 13px; color: #475569; margin-top: 3px; word-break: break-word; }
  .fix { margin-top: 8px; background: #f0fdfa; border: 1px dashed #99f6e4; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #134e4a; }
  .fix b { color: #0f766e; }
  .tag { display: inline-block; font-size: 10.5px; font-weight: 800; letter-spacing: .06em; padding: 2px 8px; border-radius: 999px; margin-bottom: 5px; }
  .copybtn { margin-top: 18px; background: #0f766e; color: #fff; border: 0; border-radius: 12px; padding: 12px 20px; font-size: 14px; font-weight: 700; cursor: pointer; }
  .copybtn:hover { background: #115e59; }
  .note { margin-top: 14px; font-size: 12.5px; color: #64748b; }
  .note a { color: #0f766e; font-weight: 600; }
  @media (max-width: 520px) { .row { padding: 14px 12px; } .head { padding: 20px 16px; } }
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <h1>🔍 Diagnosis Website — Berkat Mandiri Pendingin</h1>
    <p>Alamat instalasi: <?php echo htmlspecialchars($siteUrl); ?> · PHP <?php echo htmlspecialchars(PHP_VERSION); ?></p>
    <div class="verdict">
      <strong><?php echo htmlspecialchars($verdictTitle); ?></strong>
      <p><?php echo htmlspecialchars($verdictDesc); ?></p>
      <div class="stats">
        <span class="stat">✔ <?php echo $counts['ok']; ?> OK</span>
        <span class="stat">⚠ <?php echo $counts['warn']; ?> perhatian</span>
        <span class="stat">✕ <?php echo $counts['fail']; ?> masalah</span>
        <span class="stat">ℹ <?php echo $counts['info']; ?> info</span>
      </div>
    </div>
  </div>

  <div class="card">
    <?php foreach ($CHECKS as $c):
        $m = $STATUS_META[$c['status']]; ?>
      <div class="row">
        <div class="badge" style="background:<?php echo $m[2]; ?>;color:<?php echo $m[1]; ?>;"><?php echo $m[0]; ?></div>
        <div class="body">
          <span class="tag" style="background:<?php echo $m[2]; ?>;color:<?php echo $m[1]; ?>;"><?php echo $m[3]; ?></span>
          <h2><?php echo htmlspecialchars($c['title']); ?></h2>
          <div class="detail"><?php echo htmlspecialchars($c['detail']); ?></div>
          <?php if ($c['fix']): ?>
            <div class="fix"><b>🔧 Cara memperbaiki:</b> <?php echo htmlspecialchars($c['fix']); ?></div>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <button class="copybtn" onclick="copyReport()">📋 Salin Laporan (untuk dikirim ke teknisi)</button>
  <p class="note">
    Setelah website berjalan normal, file <code>cek.php</code> ini aman dihapus dari hosting.<br>
    Butuh bantuan? Baca <b>PANDUAN-DEPLOY-SHARED-HOSTING.md</b> atau hubungi penyedia hosting Anda.<br>
    <a href="<?php echo htmlspecialchars($siteUrl); ?>">← Kembali ke beranda website</a>
  </p>
</div>
<textarea id="report" style="position:absolute;left:-9999px;top:0;"><?php echo htmlspecialchars($report); ?></textarea>
<script>
function copyReport() {
  var t = document.getElementById('report');
  t.style.left = '0';
  t.select();
  try { document.execCommand('copy'); } catch (e) {}
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t.value).catch(function () {});
  }
  t.style.left = '-9999px';
  var b = document.querySelector('.copybtn');
  var old = b.textContent;
  b.textContent = '✔ Laporan tersalin! Tempel (paste) di chat teknisi Anda';
  setTimeout(function () { b.textContent = old; }, 3000);
}
</script>
</body>
</html>
