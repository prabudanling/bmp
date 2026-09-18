<?php
/**
 * Berkat Mandiri Pendingin — HTTP helpers
 * Respons JSON + parsing input, meniru NextResponse.json (Next.js API).
 */

if (!defined('BMP_API')) {
    exit('Akses langsung tidak diizinkan.');
}

/** Kirim respons JSON dan selesai. */
function json_out($data, $status = 200)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/** Baca body JSON (POST/PUT/DELETE) sebagai array asosiatif. */
function json_input()
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return array();
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : array();
}

/** Ambil query param (?a=b) dengan fallback. */
function q($key, $default = '')
{
    if (!isset($_GET[$key])) {
        return $default;
    }
    $v = $_GET[$key];
    return is_string($v) ? $v : $default;
}

/** Respons 401 standar — pesan sama persis dengan lib/auth.ts Next.js. */
function unauthorized_response()
{
    json_out(
        array('error' => 'Tidak memiliki akses. Silakan login terlebih dahulu.'),
        401
    );
}

/** Timestamp ISO-8601 UTC (format kompatibel dengan Date ISO Next.js). */
function iso_now()
{
    return gmdate('Y-m-d\TH:i:s.v\Z');
}

/** Konversi string waktu ISO/epoch apa pun ke format ISO UTC. */
function iso_of($value)
{
    $t = strtotime((string) $value);
    if ($t === false || $t <= 0) {
        return iso_now();
    }
    return gmdate('Y-m-d\TH:i:s.v\Z', $t);
}

/** Trim aman → string atau null bila kosong. */
function str_or_null($v)
{
    if ($v === null) {
        return null;
    }
    $s = trim((string) $v);
    return $s === '' ? null : $s;
}

/** Angka bulat aman dengan batas minimum. */
function int_clamp($v, $min)
{
    $n = (int) round((float) $v);
    return max($min, $n);
}
