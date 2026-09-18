<?php
/**
 * Berkat Mandiri Pendingin — handler API
 * Mirror 1:1 dari route handler Next.js (src/app/api/**) supaya
 * frontend React tidak perlu diubah sama sekali.
 */

if (!defined('BMP_API')) {
    exit('Akses langsung tidak diizinkan.');
}

/* =========================================================================
 * UTIL SLUG — meniru src/lib/slug.ts (produk & kategori)
 * ======================================================================= */

function slugify_item($text)
{
    $t = strtolower(trim((string) $text));
    $t = preg_replace('/[^a-z0-9\s-]/', '', $t);
    $t = preg_replace('/[\s_]+/', '-', $t);
    $t = preg_replace('/-+/', '-', $t);
    $t = preg_replace('/^-+|-+$/', '', $t);
    return $t !== '' ? $t : 'item';
}

function unique_item_slug($table, $base, $excludeId = null)
{
    $root = slugify_item($base);
    $slug = $root;
    $i = 2;
    while (true) {
        $found = null;
        $rows = store_load($table);
        foreach ($rows as $row) {
            if (isset($row['slug']) && $row['slug'] === $slug) {
                if ($excludeId !== null && isset($row['id']) && (string) $row['id'] === (string) $excludeId) {
                    continue;
                }
                $found = $row;
                break;
            }
        }
        if ($found === null) {
            return $slug;
        }
        $slug = $root . '-' . $i;
        $i++;
    }
}

/* Meniru slugify di src/lib/format.ts (halaman CMS, maks 80 char) */
function slugify_page($text)
{
    $t = strtolower((string) $text);
    $t = preg_replace('/[^a-z0-9]+/', '-', $t);
    $t = preg_replace('/^-+|-+$/', '', $t);
    $t = substr($t, 0, 80);
    return $t;
}

/* =========================================================================
 * DTO — meniru src/lib/product-dto.ts & tipe di src/lib/types.ts
 * ======================================================================= */

function category_map()
{
    $map = array();
    foreach (store_load('categories') as $c) {
        $map[(string) $c['id']] = $c;
    }
    return $map;
}

function product_dto($p, $catMap = null)
{
    if ($catMap === null) {
        $catMap = category_map();
    }
    $specs = json_decode(isset($p['specs']) ? $p['specs'] : '[]', true);
    if (!is_array($specs)) {
        $specs = array();
    }
    $images = json_decode(isset($p['images']) ? $p['images'] : '[]', true);
    if (!is_array($images)) {
        $images = array();
    }
    $cat = null;
    if (!empty($p['categoryId']) && isset($catMap[$p['categoryId']])) {
        $c = $catMap[$p['categoryId']];
        $cat = array(
            'id' => (string) $c['id'],
            'name' => (string) $c['name'],
            'slug' => (string) $c['slug'],
            'icon' => (string) $c['icon'],
        );
    }
    return array(
        'id' => (string) $p['id'],
        'name' => (string) $p['name'],
        'slug' => (string) $p['slug'],
        'sku' => isset($p['sku']) && $p['sku'] !== null && $p['sku'] !== '' ? (string) $p['sku'] : null,
        'brand' => isset($p['brand']) && $p['brand'] !== null && $p['brand'] !== '' ? (string) $p['brand'] : null,
        'categoryId' => isset($p['categoryId']) && $p['categoryId'] ? (string) $p['categoryId'] : null,
        'category' => $cat,
        'price' => isset($p['price']) && $p['price'] !== null && $p['price'] !== '' ? (int) $p['price'] : null,
        'unit' => isset($p['unit']) && $p['unit'] !== '' ? (string) $p['unit'] : 'pcs',
        'stock' => (int) (isset($p['stock']) ? $p['stock'] : 0),
        'shortDesc' => isset($p['shortDesc']) && $p['shortDesc'] !== null && $p['shortDesc'] !== '' ? (string) $p['shortDesc'] : null,
        'description' => isset($p['description']) ? (string) $p['description'] : '',
        'specs' => array_values($specs),
        'images' => array_values($images),
        'isFeatured' => !empty($p['isFeatured']),
        'isActive' => !empty($p['isActive']),
        'views' => (int) (isset($p['views']) ? $p['views'] : 0),
        'createdAt' => isset($p['createdAt']) ? (string) $p['createdAt'] : iso_now(),
        'updatedAt' => isset($p['updatedAt']) ? (string) $p['updatedAt'] : iso_now(),
    );
}

function message_dto($m)
{
    return array(
        'id' => (string) $m['id'],
        'name' => (string) $m['name'],
        'phone' => (string) $m['phone'],
        'email' => isset($m['email']) && $m['email'] !== null && $m['email'] !== '' ? (string) $m['email'] : null,
        'message' => (string) $m['message'],
        'isRead' => !empty($m['isRead']),
        'createdAt' => isset($m['createdAt']) ? (string) $m['createdAt'] : iso_now(),
    );
}

/* Pengurutan ISO string = urutan kronologis (semua format sama) */
function cmp_created_desc($a, $b)
{
    return strcmp((string) $b['createdAt'], (string) $a['createdAt']);
}

/* =========================================================================
 * PRODUCTS
 * ======================================================================= */

function handle_products_list()
{
    try {
        $admin = current_admin();
        $qq = trim(q('q', ''));
        $category = q('category', '');
        $featured = q('featured', '') === '1';
        $exclude = q('exclude', '');
        $page = max(1, (int) q('page', '1'));
        $limit = min(48, max(1, (int) q('limit', '12')));
        $sort = q('sort', 'terbaru');
        $status = q('status', 'active');

        $rows = store_load('products');
        $catMap = category_map();

        $out = array();
        foreach ($rows as $p) {
            if ($admin) {
                if ($status === 'active' && empty($p['isActive'])) continue;
                if ($status === 'inactive' && !empty($p['isActive'])) continue;
            } else {
                if (empty($p['isActive'])) continue;
            }
            if ($qq !== '') {
                $hay = strtolower(
                    (isset($p['name']) ? $p['name'] : '') . "\n" .
                    (isset($p['brand']) ? $p['brand'] : '') . "\n" .
                    (isset($p['sku']) ? $p['sku'] : '') . "\n" .
                    (isset($p['shortDesc']) ? $p['shortDesc'] : '') . "\n" .
                    (isset($p['description']) ? $p['description'] : '')
                );
                if (strpos($hay, strtolower($qq)) === false) continue;
            }
            if ($category !== '') {
                $c = isset($catMap[$p['categoryId']]) ? $catMap[$p['categoryId']] : null;
                if (!$c || (string) $c['slug'] !== $category) continue;
            }
            if ($featured && empty($p['isFeatured'])) continue;
            if ($exclude !== '' && isset($p['id']) && (string) $p['id'] === $exclude) continue;
            $out[] = $p;
        }

        // Pengurutan — meniru Prisma/SQLite
        usort($out, function ($a, $b) use ($sort) {
            if ($sort === 'harga-asc') {
                $pa = isset($a['price']) && $a['price'] !== null ? (int) $a['price'] : null;
                $pb = isset($b['price']) && $b['price'] !== null ? (int) $b['price'] : null;
                if ($pa === null && $pb === null) return cmp_created_desc($a, $b);
                if ($pa === null) return -1; // SQLite ASC: NULL lebih dulu
                if ($pb === null) return 1;
                if ($pa !== $pb) return $pa < $pb ? -1 : 1;
                return cmp_created_desc($a, $b);
            }
            if ($sort === 'harga-desc') {
                $pa = isset($a['price']) && $a['price'] !== null ? (int) $a['price'] : null;
                $pb = isset($b['price']) && $b['price'] !== null ? (int) $b['price'] : null;
                if ($pa === null && $pb === null) return cmp_created_desc($a, $b);
                if ($pa === null) return 1;  // SQLite DESC: NULL paling akhir
                if ($pb === null) return -1;
                if ($pa !== $pb) return $pa > $pb ? -1 : 1;
                return cmp_created_desc($a, $b);
            }
            if ($sort === 'nama') {
                $r = strcmp((string) $a['name'], (string) $b['name']);
                return $r !== 0 ? $r : cmp_created_desc($a, $b);
            }
            if ($sort === 'populer') {
                $va = (int) (isset($a['views']) ? $a['views'] : 0);
                $vb = (int) (isset($b['views']) ? $b['views'] : 0);
                if ($va !== $vb) return $va > $vb ? -1 : 1;
                return cmp_created_desc($a, $b);
            }
            return cmp_created_desc($a, $b);
        });

        $total = count($out);
        $pages = max(1, (int) ceil($total / $limit));
        $items = array_slice($out, ($page - 1) * $limit, $limit);

        $dtos = array();
        foreach ($items as $p) {
            $dtos[] = product_dto($p, $catMap);
        }
        json_out(array(
            'items' => $dtos,
            'total' => $total,
            'page' => $page,
            'pages' => $pages,
        ));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memuat produk.'), 500);
    }
}

function handle_products_create()
{
    $admin = require_admin();
    try {
        $body = json_input();
        $name = trim((string) (isset($body['name']) ? $body['name'] : ''));
        if ($name === '') {
            json_out(array('error' => 'Nama produk wajib diisi.'), 400);
        }

        $slug = unique_item_slug('products', isset($body['slug']) && $body['slug'] !== '' ? $body['slug'] : $name);
        $price = null;
        if (isset($body['price']) && $body['price'] !== null && $body['price'] !== '') {
            $price = max(0, (int) round((float) $body['price']));
        }
        $stock = max(0, (int) round((float) (isset($body['stock']) ? $body['stock'] : 0)));
        $specs = is_array(isset($body['specs']) ? $body['specs'] : null) ? $body['specs'] : array();
        $images = is_array(isset($body['images']) ? $body['images'] : null) ? $body['images'] : array();

        $now = iso_now();
        $row = array(
            'id' => new_id(),
            'name' => $name,
            'slug' => $slug,
            'sku' => str_or_null(isset($body['sku']) ? $body['sku'] : null),
            'brand' => str_or_null(isset($body['brand']) ? $body['brand'] : null),
            'categoryId' => isset($body['categoryId']) && $body['categoryId'] ? (string) $body['categoryId'] : null,
            'price' => $price,
            'unit' => isset($body['unit']) && $body['unit'] !== '' ? (string) $body['unit'] : 'pcs',
            'stock' => $stock,
            'shortDesc' => str_or_null(isset($body['shortDesc']) ? $body['shortDesc'] : null),
            'description' => (string) (isset($body['description']) ? $body['description'] : ''),
            'specs' => json_encode(array_values($specs), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'images' => json_encode(array_values($images), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'isFeatured' => !empty($body['isFeatured']),
            'isActive' => isset($body['isActive']) ? !empty($body['isActive']) : true,
            'views' => 0,
            'createdAt' => $now,
            'updatedAt' => $now,
        );

        store_update('products', function ($rows) use ($row) {
            $rows[] = $row;
            return $rows;
        });

        json_out(product_dto($row), 201);
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menyimpan produk.'), 500);
    }
}

function find_product_row($idOrSlug)
{
    $rows = store_load('products');
    foreach ($rows as $p) {
        if ((string) $p['id'] === (string) $idOrSlug || (string) $p['slug'] === (string) $idOrSlug) {
            return $p;
        }
    }
    return null;
}

function handle_product_get($id)
{
    try {
        if (q('view', '') === '1') {
            store_update('products', function ($rows) use ($id) {
                foreach ($rows as $i => $p) {
                    if ((string) $p['id'] === (string) $id || (string) $p['slug'] === (string) $id) {
                        $rows[$i]['views'] = (int) (isset($p['views']) ? $p['views'] : 0) + 1;
                        break;
                    }
                }
                return $rows;
            });
        }
        $p = find_product_row($id);
        if (!$p) {
            json_out(array('error' => 'Produk tidak ditemukan.'), 404);
        }
        json_out(product_dto($p));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memuat detail produk.'), 500);
    }
}

function handle_product_put($id)
{
    require_admin();
    try {
        $existing = find_product_row($id);
        if (!$existing) {
            json_out(array('error' => 'Produk tidak ditemukan.'), 404);
        }
        $body = json_input();

        $name = isset($body['name']) ? trim((string) $body['name']) : $existing['name'];
        if ($name === '') {
            json_out(array('error' => 'Nama produk wajib diisi.'), 400);
        }

        $price = null;
        if (isset($body['price'])) {
            $price = ($body['price'] === null || $body['price'] === '')
                ? null
                : max(0, (int) round((float) $body['price']));
        } else {
            $price = isset($existing['price']) && $existing['price'] !== null ? (int) $existing['price'] : null;
        }

        $updated = array_merge($existing, array(
            'name' => $name,
            'sku' => isset($body['sku'])
                ? str_or_null($body['sku'])
                : (isset($existing['sku']) ? $existing['sku'] : null),
            'brand' => isset($body['brand'])
                ? str_or_null($body['brand'])
                : (isset($existing['brand']) ? $existing['brand'] : null),
            'categoryId' => isset($body['categoryId'])
                ? ($body['categoryId'] ? (string) $body['categoryId'] : null)
                : (isset($existing['categoryId']) ? $existing['categoryId'] : null),
            'price' => $price,
            'unit' => isset($body['unit']) ? (string) $body['unit'] : (isset($existing['unit']) ? $existing['unit'] : 'pcs'),
            'stock' => isset($body['stock'])
                ? max(0, (int) round((float) $body['stock']))
                : (int) (isset($existing['stock']) ? $existing['stock'] : 0),
            'shortDesc' => isset($body['shortDesc'])
                ? str_or_null($body['shortDesc'])
                : (isset($existing['shortDesc']) ? $existing['shortDesc'] : null),
            'description' => isset($body['description'])
                ? (string) $body['description']
                : (isset($existing['description']) ? $existing['description'] : ''),
            'specs' => isset($body['specs'])
                ? json_encode(is_array($body['specs']) ? array_values($body['specs']) : array(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                : (isset($existing['specs']) ? $existing['specs'] : '[]'),
            'images' => isset($body['images'])
                ? json_encode(is_array($body['images']) ? array_values($body['images']) : array(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                : (isset($existing['images']) ? $existing['images'] : '[]'),
            'isFeatured' => isset($body['isFeatured']) ? !empty($body['isFeatured']) : !empty($existing['isFeatured']),
            'isActive' => isset($body['isActive']) ? !empty($body['isActive']) : !empty($existing['isActive']),
            'updatedAt' => iso_now(),
        ));

        store_update('products', function ($rows) use ($updated) {
            foreach ($rows as $i => $p) {
                if ((string) $p['id'] === (string) $updated['id']) {
                    $rows[$i] = $updated;
                    break;
                }
            }
            return $rows;
        });

        json_out(product_dto($updated));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memperbarui produk.'), 500);
    }
}

function handle_product_delete($id)
{
    require_admin();
    try {
        $existing = find_product_row($id);
        if (!$existing) {
            json_out(array('error' => 'Produk tidak ditemukan.'), 404);
        }
        store_update('products', function ($rows) use ($existing) {
            return array_values(array_filter($rows, function ($p) use ($existing) {
                return (string) $p['id'] !== (string) $existing['id'];
            }));
        });
        json_out(array('ok' => true));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menghapus produk.'), 500);
    }
}

/* =========================================================================
 * CATEGORIES
 * ======================================================================= */

function handle_categories_list()
{
    try {
        $rows = store_load('categories');
        usort($rows, function ($a, $b) {
            return strcasecmp((string) $a['name'], (string) $b['name']);
        });
        $products = store_load('products');
        $items = array();
        foreach ($rows as $c) {
            $count = 0;
            foreach ($products as $p) {
                if (!empty($p['isActive']) && isset($p['categoryId']) && (string) $p['categoryId'] === (string) $c['id']) {
                    $count++;
                }
            }
            $items[] = array(
                'id' => (string) $c['id'],
                'name' => (string) $c['name'],
                'slug' => (string) $c['slug'],
                'icon' => (string) $c['icon'],
                'productCount' => $count,
            );
        }
        json_out(array('items' => $items));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memuat kategori.'), 500);
    }
}

function handle_categories_create()
{
    require_admin();
    try {
        $body = json_input();
        $name = trim((string) (isset($body['name']) ? $body['name'] : ''));
        if ($name === '') {
            json_out(array('error' => 'Nama kategori wajib diisi.'), 400);
        }
        if (store_find('categories', 'name', $name)) {
            json_out(array('error' => 'Kategori dengan nama tersebut sudah ada.'), 400);
        }
        $slug = unique_item_slug('categories', $name);
        $now = iso_now();
        $row = array(
            'id' => new_id(),
            'name' => $name,
            'slug' => $slug,
            'icon' => isset($body['icon']) && $body['icon'] !== '' ? (string) $body['icon'] : 'package',
            'createdAt' => $now,
        );
        store_update('categories', function ($rows) use ($row) {
            $rows[] = $row;
            return $rows;
        });
        $out = $row;
        $out['productCount'] = 0;
        json_out($out, 201);
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menyimpan kategori.'), 500);
    }
}

function handle_category_put($id)
{
    require_admin();
    try {
        $existing = store_find('categories', 'id', $id);
        if (!$existing) {
            json_out(array('error' => 'Kategori tidak ditemukan.'), 404);
        }
        $body = json_input();
        $name = trim((string) (isset($body['name']) ? $body['name'] : ''));
        if ($name === '') {
            json_out(array('error' => 'Nama kategori wajib diisi.'), 400);
        }
        // Nama unik (kecuali milik sendiri)
        foreach (store_load('categories') as $c) {
            if ((string) $c['id'] !== (string) $id && (string) $c['name'] === $name) {
                json_out(array('error' => 'Kategori dengan nama tersebut sudah ada.'), 400);
            }
        }
        $slug = $name !== $existing['name']
            ? unique_item_slug('categories', $name, $id)
            : $existing['slug'];
        $updated = array_merge($existing, array(
            'name' => $name,
            'slug' => $slug,
            'icon' => isset($body['icon']) && $body['icon'] !== '' ? (string) $body['icon'] : $existing['icon'],
        ));
        store_update('categories', function ($rows) use ($updated) {
            foreach ($rows as $i => $c) {
                if ((string) $c['id'] === (string) $updated['id']) {
                    $rows[$i] = $updated;
                    break;
                }
            }
            return $rows;
        });
        json_out($updated);
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memperbarui kategori.'), 500);
    }
}

function handle_category_delete($id)
{
    require_admin();
    try {
        $existing = store_find('categories', 'id', $id);
        if (!$existing) {
            json_out(array('error' => 'Kategori tidak ditemukan.'), 404);
        }
        $count = 0;
        foreach (store_load('products') as $p) {
            if (isset($p['categoryId']) && (string) $p['categoryId'] === (string) $id) {
                $count++;
            }
        }
        if ($count > 0) {
            json_out(array(
                'error' => "Tidak bisa menghapus: masih ada {$count} produk di kategori ini. Pindahkan atau hapus produknya terlebih dahulu.",
            ), 400);
        }
        store_update('categories', function ($rows) use ($id) {
            return array_values(array_filter($rows, function ($c) use ($id) {
                return (string) $c['id'] !== (string) $id;
            }));
        });
        json_out(array('ok' => true));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menghapus kategori.'), 500);
    }
}

/* =========================================================================
 * SETTINGS — meniru src/app/api/settings/route.ts
 * ======================================================================= */

function default_settings()
{
    return array(
        'storeName' => 'Berkat Mandiri Pendingin',
        'tagline' => 'Spesialis Kompresor & Sparepart AC',
        'heroTitle' => 'Kompresor & Sparepart AC Original untuk Setiap Kebutuhan',
        'heroSubtitle' => 'Menyediakan kompresor AC, motor fan, kapasitor, termostat, freon, dan ratusan sparepart AC lainnya. Kualitas terjamin, harga bersahabat, pengiriman ke seluruh Indonesia.',
        'whatsapp' => '6281234567890',
        'phone' => '(021) 555-0123',
        'email' => 'info@berkatmandiripendingin.com',
        'address' => 'Jl. Raya Pendingin No. 123, Jakarta Timur, DKI Jakarta 13930',
        'hours' => 'Senin - Sabtu: 08.00 - 17.00 WIB',
        'about' => 'Berkat Mandiri Pendingin adalah toko spesialis kompresor dan sparepart AC yang telah dipercaya teknisi, bengkel AC, dan pemilik rumah di seluruh Indonesia. Kami menyediakan ribuan item sparepart AC mulai dari kompresor, motor fan, kapasitor, termostat, freon, hingga fitting dan aksesoris pendukung — semuanya original dan bergaransi.',
        'logoUrl' => '',
        'partnerLogos' => '[]',
        'faviconUrl' => '',
        'instagram' => '',
        'facebook' => '',
        'youtube' => '',
        'tiktok' => '',
    );
}

function settings_map()
{
    $map = default_settings();
    foreach (store_load('settings') as $key => $value) {
        $map[(string) $key] = (string) $value;
    }
    return $map;
}

function handle_settings_get()
{
    json_out(settings_map());
}

function handle_settings_put()
{
    require_admin();
    try {
        $body = json_input();
        $keys = array_keys(default_settings());
        store_update('settings', function ($rows) use ($body, $keys) {
            foreach ($keys as $key) {
                if (array_key_exists($key, $body)) {
                    $rows[$key] = trim((string) $body[$key]);
                }
            }
            return $rows;
        });
        json_out(settings_map());
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menyimpan pengaturan.'), 500);
    }
}

/* =========================================================================
 * UPLOAD — meniru src/app/api/upload/route.ts
 * ======================================================================= */

function uploads_dir()
{
    // Layout deploy: <root>/api/lib/handlers.php → uploads di <root>/uploads
    // (dua tingkat di atas folder lib/)
    return dirname(__DIR__, 2) . '/uploads';
}

function handle_upload()
{
    require_admin();
    $file = isset($_FILES['file']) ? $_FILES['file'] : null;
    if (!$file || !isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        json_out(array('error' => 'Tidak ada file yang dikirim.'), 400);
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_out(array('error' => 'Gagal mengunggah file.'), 500);
    }
    if ((int) $file['size'] > 3 * 1024 * 1024) {
        json_out(array('error' => 'File terlalu besar (maksimal 3MB).'), 400);
    }

    $origName = (string) $file['name'];
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $allowed = array('jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico', 'avif');
    if ($ext === '' || !in_array($ext, $allowed, true)) {
        json_out(array('error' => 'Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, SVG, ICO, atau AVIF.'), 400);
    }

    $base = strtolower(pathinfo($origName, PATHINFO_FILENAME));
    $base = preg_replace('/[^a-z0-9-_]+/', '-', $base);
    $base = preg_replace('/-+/', '-', $base);
    $base = preg_replace('/^-+|-+$/', '', $base);
    $base = substr($base, 0, 60);
    if ($base === '') {
        $base = 'file';
    }

    $filename = (string) round(microtime(true) * 1000) . '-' . $base . '.' . $ext;

    $dir = uploads_dir();
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $dest = $dir . '/' . $filename;

    // move_uploaded_file adalah jalur utama; fallback aliran demi SAPI/CLI
    // yang tidak menandai berkas sebagai "uploaded" (mis. server uji lokal).
    $ok = @move_uploaded_file($file['tmp_name'], $dest);
    if (!$ok) {
        $contents = @file_get_contents($file['tmp_name']);
        $ok = $contents !== false && @file_put_contents($dest, $contents) !== false;
    }
    if (!$ok) {
        json_out(array('error' => 'Gagal mengunggah file.'), 500);
    }
    @chmod($dest, 0644);

    json_out(array('url' => '/uploads/' . $filename));
}

/* =========================================================================
 * MEDIA — meniru src/app/api/media/route.ts
 * ======================================================================= */

function media_is_image($name)
{
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    return in_array($ext, array('jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico', 'avif'), true);
}

function media_scan_dir($abs, $rel)
{
    $out = array();
    if (!is_dir($abs)) {
        return $out;
    }
    $entries = @scandir($abs);
    if (!is_array($entries)) {
        return $out;
    }
    foreach ($entries as $name) {
        if ($name === '.' || $name === '..' || $name[0] === '.') continue;
        $full = $abs . '/' . $name;
        if (!is_file($full)) continue;
        $mtime = @filemtime($full);
        $out[] = array(
            'name' => $name,
            'url' => '/uploads/' . ($rel !== '' ? $rel . '/' : '') . $name,
            'size' => (int) @filesize($full),
            'mtime' => $mtime ? gmdate('Y-m-d\TH:i:s.v\Z', $mtime) : iso_now(),
            'isImage' => media_is_image($name),
        );
    }
    return $out;
}

function handle_media_list()
{
    require_admin();
    try {
        $root = media_scan_dir(uploads_dir(), '');
        $products = media_scan_dir(uploads_dir() . '/products', 'products');
        $items = array_merge($root, $products);
        usort($items, function ($a, $b) {
            return strcmp($b['mtime'], $a['mtime']);
        });
        json_out(array('items' => $items));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal membaca perpustakaan media.'), 500);
    }
}

function handle_media_delete()
{
    require_admin();
    try {
        $url = q('url', '');
        if (strpos($url, '/uploads/') !== 0) {
            json_out(array('error' => 'URL media tidak valid.'), 400);
        }
        $rel = substr($url, strlen('/uploads/'));
        $rel = str_replace('\\', '/', $rel);
        if ($rel === '' || strpos($rel, '..') !== false || $rel[0] === '/') {
            json_out(array('error' => 'URL media tidak valid.'), 400);
        }
        $rootReal = realpath(uploads_dir());
        $absReal = realpath(uploads_dir() . '/' . $rel);
        if (!$rootReal || !$absReal || strpos($absReal, $rootReal) !== 0) {
            json_out(array('error' => 'URL media tidak valid.'), 400);
        }
        if (!@unlink($absReal)) {
            json_out(array('error' => 'Gagal menghapus file (mungkin sudah terhapus).'), 500);
        }
        json_out(array('ok' => true));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menghapus file (mungkin sudah terhapus).'), 500);
    }
}

/* =========================================================================
 * PAGES (CMS) — meniru src/app/api/pages/**
 * ======================================================================= */

function handle_pages_list()
{
    try {
        $menu = q('menu', '');
        $wantAll = q('all', '') === '1';
        if ($menu === '1') {
            $filterPublished = true;
            $filterMenu = true;
        } elseif ($wantAll) {
            require_admin();
            $filterPublished = false;
            $filterMenu = false;
        } else {
            $filterPublished = true;
            $filterMenu = false;
        }

        $rows = store_load('pages');
        usort($rows, function ($a, $b) {
            $sa = (int) (isset($a['sortOrder']) ? $a['sortOrder'] : 0);
            $sb = (int) (isset($b['sortOrder']) ? $b['sortOrder'] : 0);
            if ($sa !== $sb) return $sa < $sb ? -1 : 1;
            return strcmp((string) $b['updatedAt'], (string) $a['updatedAt']);
        });

        $items = array();
        foreach ($rows as $p) {
            if ($filterPublished && empty($p['isPublished'])) continue;
            if ($filterMenu && empty($p['showInMenu'])) continue;
            $items[] = $p;
        }
        json_out(array('items' => $items));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memuat daftar halaman.'), 500);
    }
}

function handle_pages_create()
{
    require_admin();
    try {
        $body = json_input();
        $title = trim((string) (isset($body['title']) ? $body['title'] : ''));
        if ($title === '') {
            json_out(array('error' => 'Judul halaman wajib diisi.'), 400);
        }

        $slug = slugify_page(isset($body['slug']) && $body['slug'] !== '' ? $body['slug'] : $title);
        if ($slug === '') {
            $slug = 'halaman-' . round(microtime(true) * 1000);
        }
        if (store_find('pages', 'slug', $slug)) {
            $suffix = substr(base_convert((string) round(microtime(true) * 1000), 10, 36), -4);
            $slug = $slug . '-' . $suffix;
        }

        $now = iso_now();
        $row = array(
            'id' => new_id(),
            'title' => $title,
            'slug' => $slug,
            'content' => (string) (isset($body['content']) ? $body['content'] : ''),
            'excerpt' => substr((string) (isset($body['excerpt']) ? $body['excerpt'] : ''), 0, 300),
            'isPublished' => isset($body['isPublished']) ? !empty($body['isPublished']) : true,
            'showInMenu' => !empty($body['showInMenu']),
            'sortOrder' => (int) (isset($body['sortOrder']) ? $body['sortOrder'] : 0),
            'views' => 0,
            'createdAt' => $now,
            'updatedAt' => $now,
        );
        store_update('pages', function ($rows) use ($row) {
            $rows[] = $row;
            return $rows;
        });
        json_out($row, 201);
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal membuat halaman.'), 500);
    }
}

function handle_page_get($id)
{
    require_admin();
    $p = store_find('pages', 'id', $id);
    if (!$p) {
        json_out(array('error' => 'Halaman tidak ditemukan.'), 404);
    }
    json_out($p);
}

function handle_page_put($id)
{
    require_admin();
    try {
        $existing = store_find('pages', 'id', $id);
        if (!$existing) {
            json_out(array('error' => 'Halaman tidak ditemukan.'), 404);
        }
        $body = json_input();
        $data = array();

        if (array_key_exists('title', $body)) {
            $title = trim((string) $body['title']);
            if ($title === '') {
                json_out(array('error' => 'Judul halaman wajib diisi.'), 400);
            }
            $data['title'] = $title;
        }
        if (array_key_exists('slug', $body)) {
            $slug = slugify_page($body['slug'] !== '' ? (string) $body['slug'] : (isset($data['title']) ? $data['title'] : $existing['title']));
            if ($slug !== $existing['slug'] && $slug !== '' && store_find('pages', 'slug', $slug)) {
                json_out(array('error' => 'Slug "' . $slug . '" sudah dipakai halaman lain.'), 400);
            }
            $data['slug'] = $slug !== '' ? $slug : $existing['slug'];
        }
        if (array_key_exists('content', $body)) {
            $data['content'] = (string) $body['content'];
        }
        if (array_key_exists('excerpt', $body)) {
            $data['excerpt'] = substr((string) $body['excerpt'], 0, 300);
        }
        if (array_key_exists('isPublished', $body)) {
            $data['isPublished'] = !empty($body['isPublished']);
        }
        if (array_key_exists('showInMenu', $body)) {
            $data['showInMenu'] = !empty($body['showInMenu']);
        }
        if (array_key_exists('sortOrder', $body)) {
            $data['sortOrder'] = (int) (is_numeric($body['sortOrder']) ? $body['sortOrder'] : 0);
        }
        $data['updatedAt'] = iso_now();

        $updated = array_merge($existing, $data);
        store_update('pages', function ($rows) use ($updated) {
            foreach ($rows as $i => $p) {
                if ((string) $p['id'] === (string) $updated['id']) {
                    $rows[$i] = $updated;
                    break;
                }
            }
            return $rows;
        });
        json_out($updated);
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menyimpan halaman.'), 500);
    }
}

function handle_page_delete($id)
{
    require_admin();
    try {
        $existing = store_find('pages', 'id', $id);
        if (!$existing) {
            json_out(array('error' => 'Halaman tidak ditemukan.'), 404);
        }
        store_update('pages', function ($rows) use ($id) {
            return array_values(array_filter($rows, function ($p) use ($id) {
                return (string) $p['id'] !== (string) $id;
            }));
        });
        json_out(array('ok' => true));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menghapus halaman.'), 500);
    }
}

function handle_page_by_slug($slug)
{
    $slug = urldecode((string) $slug);
    try {
        $p = store_find('pages', 'slug', $slug);
        if (!$p || empty($p['isPublished'])) {
            json_out(array('error' => 'Halaman tidak ditemukan.'), 404);
        }
        // Counter kunjungan (abaikan kegagalan)
        store_update('pages', function ($rows) use ($p) {
            foreach ($rows as $i => $r) {
                if ((string) $r['id'] === (string) $p['id']) {
                    $rows[$i]['views'] = (int) (isset($r['views']) ? $r['views'] : 0) + 1;
                    break;
                }
            }
            return $rows;
        });
        json_out($p);
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memuat halaman.'), 500);
    }
}

/* =========================================================================
 * MESSAGES — meniru src/app/api/messages/**
 * ======================================================================= */

function handle_messages_list()
{
    require_admin();
    try {
        $unreadOnly = q('unread', '') === '1';
        $rows = store_load('messages');
        usort($rows, 'cmp_created_desc');
        $items = array();
        foreach ($rows as $m) {
            if ($unreadOnly && !empty($m['isRead'])) continue;
            $items[] = $m;
            if (count($items) >= 200) break;
        }
        $dtos = array();
        foreach ($items as $m) {
            $dtos[] = message_dto($m);
        }
        json_out(array('items' => $dtos));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memuat pesan.'), 500);
    }
}

function handle_messages_create()
{
    try {
        $body = json_input();

        // Honeypot anti-spam: bot biasanya mengisi field tersembunyi "website"
        if (!empty($body['website'])) {
            json_out(array('ok' => true));
        }

        $name = trim((string) (isset($body['name']) ? $body['name'] : ''));
        $phone = trim((string) (isset($body['phone']) ? $body['phone'] : ''));
        $email = trim((string) (isset($body['email']) ? $body['email'] : ''));
        $message = trim((string) (isset($body['message']) ? $body['message'] : ''));

        if ($name === '' || $phone === '' || $message === '') {
            json_out(array('error' => 'Nama, nomor telepon, dan pesan wajib diisi.'), 400);
        }
        if (strlen($message) > 2000) {
            json_out(array('error' => 'Pesan terlalu panjang (maksimal 2000 karakter).'), 400);
        }

        $row = array(
            'id' => new_id(),
            'name' => $name,
            'phone' => $phone,
            'email' => $email !== '' ? $email : null,
            'message' => $message,
            'isRead' => false,
            'createdAt' => iso_now(),
        );
        store_update('messages', function ($rows) use ($row) {
            $rows[] = $row;
            return $rows;
        });
        json_out(array('ok' => true), 201);
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal mengirim pesan. Silakan coba lagi.'), 500);
    }
}

function handle_message_put($id)
{
    require_admin();
    try {
        $existing = store_find('messages', 'id', $id);
        if (!$existing) {
            json_out(array('error' => 'Gagal memperbarui pesan.'), 500);
        }
        $body = json_input();
        $updated = array_merge($existing, array('isRead' => !empty($body['isRead'])));
        store_update('messages', function ($rows) use ($updated) {
            foreach ($rows as $i => $m) {
                if ((string) $m['id'] === (string) $updated['id']) {
                    $rows[$i] = $updated;
                    break;
                }
            }
            return $rows;
        });
        json_out(message_dto($updated));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memperbarui pesan.'), 500);
    }
}

function handle_message_delete($id)
{
    require_admin();
    try {
        $existing = store_find('messages', 'id', $id);
        if (!$existing) {
            json_out(array('error' => 'Gagal menghapus pesan.'), 500);
        }
        store_update('messages', function ($rows) use ($id) {
            return array_values(array_filter($rows, function ($m) use ($id) {
                return (string) $m['id'] !== (string) $id;
            }));
        });
        json_out(array('ok' => true));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal menghapus pesan.'), 500);
    }
}

/* =========================================================================
 * STATS — meniru src/app/api/stats/route.ts
 * ======================================================================= */

function handle_stats()
{
    require_admin();
    try {
        $products = store_load('products');
        $categories = store_load('categories');
        $messages = store_load('messages');

        $productActive = 0;
        $totalViews = 0;
        foreach ($products as $p) {
            if (!empty($p['isActive'])) $productActive++;
            $totalViews += (int) (isset($p['views']) ? $p['views'] : 0);
        }
        $unread = 0;
        foreach ($messages as $m) {
            if (empty($m['isRead'])) $unread++;
        }

        // Stok menipis: aktif & stok <= 3, urut stok asc, ambil 5
        $low = array();
        foreach ($products as $p) {
            if (!empty($p['isActive']) && (int) $p['stock'] <= 3) {
                $low[] = $p;
            }
        }
        usort($low, function ($a, $b) {
            $sa = (int) $a['stock'];
            $sb = (int) $b['stock'];
            if ($sa === $sb) return cmp_created_desc($a, $b);
            return $sa < $sb ? -1 : 1;
        });
        $low = array_slice($low, 0, 5);
        $lowStock = array();
        foreach ($low as $p) {
            $images = json_decode(isset($p['images']) ? $p['images'] : '[]', true);
            if (!is_array($images)) $images = array();
            $lowStock[] = array(
                'id' => (string) $p['id'],
                'name' => (string) $p['name'],
                'stock' => (int) $p['stock'],
                'images' => array_values($images),
            );
        }

        usort($messages, 'cmp_created_desc');
        $recentMessages = array();
        foreach (array_slice($messages, 0, 5) as $m) {
            $recentMessages[] = message_dto($m);
        }

        usort($products, 'cmp_created_desc');
        $recentProducts = array();
        foreach (array_slice($products, 0, 5) as $p) {
            $recentProducts[] = product_dto($p);
        }

        json_out(array(
            'productTotal' => count($products),
            'productActive' => $productActive,
            'categoryTotal' => count($categories),
            'unreadMessages' => $unread,
            'totalViews' => $totalViews,
            'lowStock' => $lowStock,
            'recentMessages' => $recentMessages,
            'recentProducts' => $recentProducts,
        ));
    } catch (Exception $e) {
        json_out(array('error' => 'Gagal memuat ringkasan.'), 500);
    }
}

/* =========================================================================
 * AUTH
 * ======================================================================= */

function handle_auth_login()
{
    try {
        $body = json_input();
        $username = trim((string) (isset($body['username']) ? $body['username'] : ''));
        $password = (string) (isset($body['password']) ? $body['password'] : '');
        if ($username === '' || $password === '') {
            json_out(array('error' => 'Username dan password wajib diisi.'), 400);
        }
        $user = auth_login($username, $password);
        json_out(array('user' => $user));
    } catch (Exception $e) {
        json_out(array('error' => 'Terjadi kesalahan saat login.'), 500);
    }
}

function handle_auth_me()
{
    $admin = current_admin();
    if (!$admin) {
        json_out(array('user' => null), 401);
    }
    json_out(array('user' => $admin));
}

function handle_auth_logout()
{
    auth_logout();
    json_out(array('ok' => true));
}

function handle_auth_change_password()
{
    $admin = require_admin();
    try {
        $body = json_input();
        $currentPassword = (string) (isset($body['currentPassword']) ? $body['currentPassword'] : '');
        $newPassword = (string) (isset($body['newPassword']) ? $body['newPassword'] : '');

        if ($currentPassword === '' || $newPassword === '') {
            json_out(array('error' => 'Password lama dan baru wajib diisi.'), 400);
        }
        if (strlen($newPassword) < 6) {
            json_out(array('error' => 'Password baru minimal 6 karakter.'), 400);
        }

        $record = store_find('admins', 'id', $admin['id']);
        if (!$record) {
            json_out(array('error' => 'Akun admin tidak ditemukan.'), 404);
        }
        if (!password_verify($currentPassword, (string) $record['password'])) {
            json_out(array('error' => 'Password lama tidak sesuai.'), 400);
        }

        $hash = password_hash($newPassword, PASSWORD_BCRYPT, array('cost' => 10));
        store_update('admins', function ($rows) use ($record, $hash) {
            foreach ($rows as $i => $a) {
                if ((string) $a['id'] === (string) $record['id']) {
                    $rows[$i]['password'] = $hash;
                    $rows[$i]['updatedAt'] = iso_now();
                    break;
                }
            }
            return $rows;
        });
        json_out(array('ok' => true));
    } catch (Exception $e) {
        json_out(array('error' => 'Terjadi kesalahan saat mengubah password.'), 500);
    }
}
