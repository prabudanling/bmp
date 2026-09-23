<?php
/**
 * Router uji SUBFOLDER — meniru Apache + .htaccess di dalam subfolder.
 * php -S 127.0.0.1:8897 -t build/test-sub tests/php-router-sub.php
 */
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$root = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '.', '/');

// /api atau /<subfolder>/api → PHP bridge
if (preg_match('#^(/[A-Za-z0-9_-]+)?(/api(?:/|$)(.*))$#', $path, $m)) {
    $prefix = $m[1]; // '' atau '/toko'
    $apiAbs = $root . $prefix . '/api';
    $_GET['__route'] = trim($m[3] ?? '', '/');
    chdir($apiAbs);
    require $apiAbs . '/index.php';
    return true;
}

// Redirect folder tanpa trailing slash (meniru Apache)
$file = $root . $path;
if (is_dir($file) && substr($path, -1) !== '/') {
    header('Location: ' . $path . '/');
    return true;
}
if (is_dir($file)) {
    $idxFile = rtrim($file, '/') . '/index.html';
    if (is_file($idxFile)) {
        header('Content-Type: text/html; charset=utf-8');
        echo file_get_contents($idxFile);
        return true;
    }
}
if (is_file($file)) {
    if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'php') {
        chdir(dirname($file));
        require $file;
        return true;
    }
    return false; // php -S melayani sendiri
}
http_response_code(404);
echo '404';
return true;
