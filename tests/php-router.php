<?php
/**
 * Router pengganti .htaccess untuk PENGUJIAN LOKAL dengan:
 *   php -S 127.0.0.1:8899 tests/php-router.php
 * (php -S tidak membaca .htaccess, jadi router ini menirunya:
 *  file statis dilayani langsung; /api/* → api/index.php)
 */
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';
$root = !empty($_SERVER['DOCUMENT_ROOT'])
    ? rtrim($_SERVER['DOCUMENT_ROOT'], '/')
    : __DIR__ . '/..';

// /__debug → diagnosa router (hanya untuk pengujian lokal)
if ($path === '/__debug') {
    header('Content-Type: text/plain; charset=utf-8');
    echo 'DOCUMENT_ROOT=' . var_export($_SERVER['DOCUMENT_ROOT'] ?? null, true) . "\n";
    echo 'root=' . var_export($root, true) . "\n";
    echo 'path=' . var_export($path, true) . "\n";
    echo 'realpath=' . var_export(realpath($root . $path), true) . "\n";
    echo 'is_file_index=' . var_export(is_file($root . '/index.html'), true) . "\n";
    echo 'cwd=' . getcwd() . "\n";
    return true;
}

// /api/* → PHP bridge
if (preg_match('#^/api(/|$)#', $path)) {
    $_GET['__route'] = trim(preg_replace('#^/api#', '', $path), '/');
    chdir($root . '/api');
    require $root . '/api/index.php';
    return true;
}

// File statis
$file = realpath($root . $path);
$docRoot = realpath($root);
if ($file && strpos($file, $docRoot) === 0 && is_file($file)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = array(
        'html' => 'text/html; charset=utf-8',
        'js' => 'application/javascript',
        'css' => 'text/css',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'json' => 'application/json',
        'woff2' => 'font/woff2',
        'txt' => 'text/plain',
    );
    header('Content-Type: ' . ($mime[$ext] ?? 'application/octet-stream'));
    readfile($file);
    return true;
}

// SPA fallback → index.html
$index = $root . '/index.html';
if (is_file($index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($index);
    return true;
}

http_response_code(404);
echo 'Not found (test router)';
return true;
