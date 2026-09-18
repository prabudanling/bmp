<?php
/**
 * Uji CLI endpoint /api/upload — memverifikasi seluruh logika handler
 * (validasi ukuran/tipe, sanitasi nama, penamaan timestamp, penulisan
 * berkas ke disk) tanpa server web, sehingga berkas benar-benar
 * terlihat persisten di sandbox ini.
 *
 * Pemakaian: ~/bin/php tests/upload-cli-test.php /path/ke/gambar.png
 */
$_SERVER['REQUEST_URI'] = '/api/upload';
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['SCRIPT_NAME'] = '/api/index.php'; // agar route parsing mengenali prefix /api
$tmp = isset($argv[1]) ? $argv[1] : '/tmp/php-upload-test.png';
if (!is_file($tmp)) {
    fwrite(STDERR, "File uji tidak ada: {$tmp}\n");
    exit(1);
}

$_FILES = array(
    'file' => array(
        'name' => basename($tmp),
        'type' => 'image/png',
        'tmp_name' => $tmp,
        'error' => UPLOAD_ERR_OK,
        'size' => filesize($tmp),
    ),
);

// Status login admin (session CLI)
if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}
$_SESSION['bmp_admin'] = array('id' => 'cli-test', 'username' => 'admin', 'name' => 'Admin CLI');

require __DIR__ . '/../php-api/index.php';
