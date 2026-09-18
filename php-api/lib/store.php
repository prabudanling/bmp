<?php
/**
 * Berkat Mandiri Pendingin — penyimpanan JSON
 * Pengganti Prisma/SQLite di shared hosting: tiap "tabel" = satu file JSON
 * di folder data/ (terlindungi .htaccess). Penulisan atomik + lock agar
 * aman dari tabrakan request.
 */

if (!defined('BMP_API')) {
    exit('Akses langsung tidak diizinkan.');
}

define('BMP_DATA_DIR', __DIR__ . '/../data');

/** Pastikan folder data ada. */
function store_init()
{
    if (!is_dir(BMP_DATA_DIR)) {
        @mkdir(BMP_DATA_DIR, 0755, true);
    }
}

/** Path file data. */
function store_path($name)
{
    return BMP_DATA_DIR . '/' . basename($name) . '.json';
}

/** Muat seluruh baris sebuah "tabel" (array) atau map (settings). */
function store_load($name)
{
    $file = store_path($name);
    if (!is_file($file)) {
        return array();
    }
    $raw = file_get_contents($file);
    if ($raw === false || trim($raw) === '') {
        return array();
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : array();
}

/**
 * Baca-modify-tulis atomik: memegang lock eksklusif selama callback
 * berjalan, lalu menulis hasilnya secara atomik (tmp + rename).
 * Callback menerima isi saat ini dan mengembalikan isi baru.
 */
function store_update($name, $fn)
{
    store_init();
    $file = store_path($name);
    $lockFile = BMP_DATA_DIR . '/.lock-' . basename($name);

    $fh = fopen($lockFile, 'c');
    if ($fh) {
        flock($fh, LOCK_EX);
    }

    $current = store_load($name);
    $next = $fn($current);
    if (!is_array($next)) {
        $next = array();
    }

    $json = json_encode(
        $next,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    );
    $tmp = $file . '.tmp';
    file_put_contents($tmp, $json, LOCK_EX);
    @rename($tmp, $file);

    if ($fh) {
        flock($fh, LOCK_UN);
        fclose($fh);
    }

    return $next;
}

/** ID unik 24 karakter heksadesimal (pengganti cuid Prisma). */
function new_id()
{
    return bin2hex(random_bytes(12));
}

/** Cari satu baris berdasarkan field. */
function store_find($name, $field, $value)
{
    $rows = store_load($name);
    foreach ($rows as $row) {
        if (is_array($row) && isset($row[$field]) && (string) $row[$field] === (string) $value) {
            return $row;
        }
    }
    return null;
}
