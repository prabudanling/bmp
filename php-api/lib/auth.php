<?php
/**
 * Berkat Mandiri Pendingin — autentikasi admin (session PHP)
 * Meniru perilaku JWT-cookie di Next.js: client tetap memakai cookie
 * httpOnly yang dikirim otomatis browser; bedanya di sini memakai
 * PHP session bawaan (tanpa library eksternal).
 */

if (!defined('BMP_API')) {
    exit('Akses langsung tidak diizinkan.');
}

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(array(
        'lifetime' => 60 * 60 * 24 * 7, // 7 hari, sama seperti TOKEN_MAX_AGE
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ));
    @session_start();
}

/** Admin yang sedang login (array id/username/name) atau null. */
function current_admin()
{
    if (isset($_SESSION['bmp_admin']) && is_array($_SESSION['bmp_admin'])) {
        $a = $_SESSION['bmp_admin'];
        if (isset($a['id'], $a['username'], $a['name'])) {
            return array(
                'id' => (string) $a['id'],
                'username' => (string) $a['username'],
                'name' => (string) $a['name'],
            );
        }
    }
    return null;
}

/** Aliases yang dipakai handler. */
function is_admin()
{
    return current_admin() !== null;
}

/** Wajib login, atau balas 401 (sama seperti getAdminFromReq + unauthorized). */
function require_admin()
{
    if (!is_admin()) {
        unauthorized_response();
    }
    return current_admin();
}

/** Coba login dengan username/password terhadap data/admins.json. */
function auth_login($username, $password)
{
    // Pembatas sederhana: maksimal 8 percobaan per sesi (reset saat berhasil / 10 menit)
    $attempts = isset($_SESSION['bmp_attempts']) ? (int) $_SESSION['bmp_attempts'] : 0;
    $since = isset($_SESSION['bmp_attempt_at']) ? (int) $_SESSION['bmp_attempt_at'] : 0;
    if ($since > 0 && (time() - $since) > 600) {
        $attempts = 0;
    }
    if ($attempts >= 8) {
        json_out(
            array('error' => 'Terlalu banyak percobaan login. Tunggu beberapa menit lalu coba lagi.'),
            429
        );
    }

    $admin = store_find('admins', 'username', $username);
    $valid = false;
    if ($admin && isset($admin['password'])) {
        $valid = password_verify((string) $password, (string) $admin['password']);
    }

    if (!$valid) {
        $_SESSION['bmp_attempts'] = $attempts + 1;
        $_SESSION['bmp_attempt_at'] = time();
        usleep(400000); // perlambat brute force
        json_out(array('error' => 'Username atau password salah.'), 401);
    }

    $_SESSION['bmp_attempts'] = 0;
    $_SESSION['bmp_attempt_at'] = 0;
    session_regenerate_id(true);

    $user = array(
        'id' => (string) $admin['id'],
        'username' => (string) $admin['username'],
        'name' => (string) $admin['name'],
    );
    $_SESSION['bmp_admin'] = $user;
    return $user;
}

/** Keluar: hapus data sesi. */
function auth_logout()
{
    $_SESSION['bmp_admin'] = null;
    unset($_SESSION['bmp_admin']);
    if (session_status() === PHP_SESSION_ACTIVE) {
        @session_destroy();
    }
}
