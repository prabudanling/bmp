<?php
/**
 * Berkat Mandiri Pendingin — PHP API Bridge
 * ============================================================
 * Front controller yang meniru seluruh REST API Next.js
 * (src/app/api/**) sehingga website statis hasil export tetap
 * punya dashboard admin yang berfungsi penuh di shared hosting.
 *
 * Routing:
 *   /api                      → health check {message}
 *   /api/products             → GET/POST
 *   /api/products/{id}        → GET/PUT/DELETE  (id atau slug)
 *   /api/categories           → GET/POST
 *   /api/categories/{id}      → PUT/DELETE
 *   /api/settings             → GET/PUT
 *   /api/upload               → POST (multipart, field "file")
 *   /api/media                → GET ; DELETE ?url=/uploads/xxx
 *   /api/pages                → GET/POST
 *   /api/pages/{id}           → GET/PUT/DELETE
 *   /api/pages/slug/{slug}    → GET (publik)
 *   /api/messages             → GET/POST
 *   /api/messages/{id}        → PUT/DELETE
 *   /api/stats                → GET
 *   /api/auth/login|me|logout → POST/GET/POST
 *   /api/auth/change-password → POST
 *
 * Penyimpanan: file JSON di folder data/ (terlindungi .htaccess).
 * Autentikasi: session PHP (cookie httpOnly, 7 hari).
 */

define('BMP_API', '1');

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require __DIR__ . '/lib/http.php';
require __DIR__ . '/lib/store.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/handlers.php';

/* ---------------------------------------------------------------
 * Parse route dari REQUEST_URI
 * ------------------------------------------------------------- */
$uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$path = parse_url($uri, PHP_URL_PATH);
if (!is_string($path) || $path === '') {
    $path = '/';
}
$path = rawurldecode($path);

// Prefix folder skrip (mendukung install di subfolder, mis. /toko/api/...)
$scriptDir = rtrim(str_replace('\\', '/', dirname(isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '/')), '/');
if ($scriptDir !== '' && strpos($path, $scriptDir) === 0) {
    $path = substr($path, strlen($scriptDir));
}
$route = trim($path, '/');

// Fallback bila mod_rewrite tidak tersedia: /api/index.php?__route=products
if (q('__route', '') !== '') {
    $route = trim(q('__route', ''), '/');
}

$segments = $route === '' ? array() : explode('/', $route);
$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';

/* ---------------------------------------------------------------
 * Dispatch
 * ------------------------------------------------------------- */
$s0 = isset($segments[0]) ? $segments[0] : '';
$s1 = isset($segments[1]) ? $segments[1] : '';

switch ($s0) {
    case '':
    case 'index.php':
        if ($method === 'GET') {
            json_out(array('message' => 'Hello, world!'));
        }
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'auth':
        if ($s1 === 'login' && $method === 'POST') {
            handle_auth_login();
        }
        if ($s1 === 'me' && $method === 'GET') {
            handle_auth_me();
        }
        if ($s1 === 'logout' && $method === 'POST') {
            handle_auth_logout();
        }
        if ($s1 === 'change-password' && $method === 'POST') {
            handle_auth_change_password();
        }
        json_out(array('error' => 'Endpoint auth tidak ditemukan.'), 404);
        break;

    case 'products':
        if ($s1 === '') {
            if ($method === 'GET') handle_products_list();
            if ($method === 'POST') handle_products_create();
            json_out(array('error' => 'Metode tidak didukung.'), 405);
        }
        $id = implode('/', array_slice($segments, 1));
        if ($method === 'GET') handle_product_get($id);
        if ($method === 'PUT' || $method === 'PATCH') handle_product_put($id);
        if ($method === 'DELETE') handle_product_delete($id);
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'categories':
        if ($s1 === '') {
            if ($method === 'GET') handle_categories_list();
            if ($method === 'POST') handle_categories_create();
            json_out(array('error' => 'Metode tidak didukung.'), 405);
        }
        $id = $s1;
        if ($method === 'PUT' || $method === 'PATCH') handle_category_put($id);
        if ($method === 'DELETE') handle_category_delete($id);
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'settings':
        if ($method === 'GET') handle_settings_get();
        if ($method === 'PUT' || $method === 'PATCH') handle_settings_put();
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'upload':
        if ($method === 'POST') handle_upload();
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'media':
        if ($method === 'GET') handle_media_list();
        if ($method === 'DELETE') handle_media_delete();
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'pages':
        if ($s1 === 'slug' && isset($segments[2])) {
            if ($method === 'GET') handle_page_by_slug(implode('/', array_slice($segments, 2)));
            json_out(array('error' => 'Metode tidak didukung.'), 405);
        }
        if ($s1 === '') {
            if ($method === 'GET') handle_pages_list();
            if ($method === 'POST') handle_pages_create();
            json_out(array('error' => 'Metode tidak didukung.'), 405);
        }
        $id = $s1;
        if ($method === 'GET') handle_page_get($id);
        if ($method === 'PUT' || $method === 'PATCH') handle_page_put($id);
        if ($method === 'DELETE') handle_page_delete($id);
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'messages':
        if ($s1 === '') {
            if ($method === 'GET') handle_messages_list();
            if ($method === 'POST') handle_messages_create();
            json_out(array('error' => 'Metode tidak didukung.'), 405);
        }
        $id = $s1;
        if ($method === 'PUT' || $method === 'PATCH') handle_message_put($id);
        if ($method === 'DELETE') handle_message_delete($id);
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    case 'stats':
        if ($method === 'GET') handle_stats();
        json_out(array('error' => 'Metode tidak didukung.'), 405);
        break;

    default:
        json_out(array('error' => 'Endpoint tidak ditemukan.'), 404);
}
