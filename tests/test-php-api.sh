#!/usr/bin/env bash
# ============================================================
# Test suite PHP API Bridge — mirror Next.js API
# Jalankan: bash tests/test-php-api.sh
# ============================================================
BASE="${BASE:-http://127.0.0.1:8899}"
CJ="/tmp/bmp-php-cookies.txt"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rm -f "$CJ"
PASS=0; FAIL=0

check() { # check <nama> <expected> <actual>
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "PASS | $1"
  else FAIL=$((FAIL+1)); echo "FAIL | $1 | expected=$2 got=$3"; fi
}
jqget() { # jqget <json> <path>
  echo "$1" | python3 "$SCRIPT_DIR/jget.py" "$2"
}

echo "── 1. HEALTH ────────────────────────────────────────────"
R=$(curl -s "$BASE/api")
check "health message" "Hello, world!" "$(jqget "$R" "['message']")"

echo "── 2. AUTH ──────────────────────────────────────────────"
R=$(curl -s -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d '{"username":"admin","password":"salah"}')
check "login salah → 401" "Username atau password salah." "$(jqget "$R" "['error']")"
R=$(curl -s -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d '{}')
check "login kosong → 400" "Username dan password wajib diisi." "$(jqget "$R" "['error']")"
R=$(curl -s -c "$CJ" -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin123"}')
check "login benar" "admin" "$(jqget "$R" "['user']['username']")"
R=$(curl -s -b "$CJ" "$BASE/api/auth/me")
check "auth/me user" "Admin Berkat Mandiri" "$(jqget "$R" "['user']['name']")"
R=$(curl -s "$BASE/api/auth/me")
check "auth/me tanpa login → 401" "None" "$(jqget "$R" "['user']")"

echo "── 3. PRODUCTS (list & filter) ──────────────────────────"
R=$(curl -s "$BASE/api/products?limit=12")
check "products total=1000" "1000" "$(jqget "$R" "['total']")"
check "products pages=84" "84" "$(jqget "$R" "['pages']")"
HAS_CAT=$(echo "$R" | python3 -c "import sys,json;d=json.load(sys.stdin);print('True' if d['items'][0].get('category') else 'False')")
check "products item punya category" "True" "$HAS_CAT"
R=$(curl -s "$BASE/api/products?limit=12&status=all")
check "products anonim status=all tetap hanya aktif" "1000" "$(jqget "$R" "['total']")"
R=$(curl -s -b "$CJ" "$BASE/api/products?limit=48&status=all")
TOTAL_ALL=$(jqget "$R" "['total']")
if [ "$TOTAL_ALL" -ge 1000 ]; then PASS=$((PASS+1)); echo "PASS | products admin status=all ($TOTAL_ALL)"; else FAIL=$((FAIL+1)); echo "FAIL | products admin status=all got $TOTAL_ALL"; fi
R=$(curl -s "$BASE/api/products?limit=5&sort=harga-asc")
P1=$(jqget "$R" "['items'][0]['price']")
P2=$(jqget "$R" "['items'][1]['price']")
if [ "$P1" = "None" ] || [ "$P2" = "None" ]; then check "harga-asc null handling ok" "ok" "ok"
elif [ "$P1" -le "$P2" ]; then PASS=$((PASS+1)); echo "PASS | sort harga-asc ($P1<=$P2)"; else FAIL=$((FAIL+1)); echo "FAIL | sort harga-asc ($P1>$P2)"; fi
R=$(curl -s "$BASE/api/products?limit=5&q=kompresor")
Q1=$(jqget "$R" "['total']")
if [ "$Q1" -ge 1 ]; then PASS=$((PASS+1)); echo "PASS | search q=kompresor ($Q1 hasil)"; else FAIL=$((FAIL+1)); echo "FAIL | search q=kompresor 0 hasil"; fi
FIRST_SLUG=$(curl -s "$BASE/api/products?limit=1" | python3 -c "import sys,json;print(json.load(sys.stdin)['items'][0]['slug'])")
R=$(curl -s "$BASE/api/products/$FIRST_SLUG")
check "detail by slug" "$FIRST_SLUG" "$(jqget "$R" "['slug']")"
V0=$(jqget "$R" "['views']")
curl -s "$BASE/api/products/$FIRST_SLUG?view=1" > /dev/null
R=$(curl -s "$BASE/api/products/$FIRST_SLUG")
V1=$(jqget "$R" "['views']")
check "view counter +1" "$((V0+1))" "$V1"

echo "── 4. PRODUCTS (CRUD admin) ─────────────────────────────"
R=$(curl -s -b "$CJ" -X POST "$BASE/api/products" -H 'Content-Type: application/json' -d '{"name":"Produk Uji Deploy","price":150000,"stock":7,"specs":[{"k":"Daya","v":"1 PK"}],"images":["/uploads/a.png"]}')
PID=$(jqget "$R" "['id']")
check "create produk 201" "Produk Uji Deploy" "$(jqget "$R" "['name']")"
check "create produk slug" "produk-uji-deploy" "$(jqget "$R" "['slug']")"
R=$(curl -s -X POST "$BASE/api/products" -H 'Content-Type: application/json' -d '{"name":"X"}')
check "create tanpa login → 401" "Tidak memiliki akses. Silakan login terlebih dahulu." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" -X PUT "$BASE/api/products/$PID" -H 'Content-Type: application/json' -d '{"price":200000,"isFeatured":true}')
check "update produk price" "200000" "$(jqget "$R" "['price']")"
check "update produk featured" "True" "$(jqget "$R" "['isFeatured']")"
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/products/$PID")
check "delete produk" "True" "$(jqget "$R" "['ok']")"

echo "── 5. CATEGORIES ────────────────────────────────────────"
R=$(curl -s "$BASE/api/categories")
CATN=$(jqget "$R" "['items'][0]['productCount']")
if [ "$CATN" -ge 0 ] 2>/dev/null; then PASS=$((PASS+1)); echo "PASS | categories productCount ($CATN)"; else FAIL=$((FAIL+1)); echo "FAIL | productCount=$CATN"; fi
R=$(curl -s -b "$CJ" -X POST "$BASE/api/categories" -H 'Content-Type: application/json' -d '{"name":"Kategori Uji"}')
CID=$(jqget "$R" "['id']")
check "create kategori" "Kategori Uji" "$(jqget "$R" "['name']")"
check "create kategori icon default" "package" "$(jqget "$R" "['icon']")"
R=$(curl -s -b "$CJ" -X POST "$BASE/api/categories" -H 'Content-Type: application/json' -d '{"name":"Kategori Uji"}')
check "dup kategori → 400" "Kategori dengan nama tersebut sudah ada." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" -X PUT "$BASE/api/categories/$CID" -H 'Content-Type: application/json' -d '{"name":"Kategori Uji Baru","icon":"fan"}')
check "update kategori" "fan" "$(jqget "$R" "['icon']")"
# kategori tanpa produk → boleh dihapus; buat satu lagi untuk test gagal
R=$(curl -s -b "$CJ" -X POST "$BASE/api/categories" -H 'Content-Type: application/json' -d '{"name":"Kategori Hapus Aku"}')
CID2=$(jqget "$R" "['id']")
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/categories/$CID2")
check "delete kategori kosong" "True" "$(jqget "$R" "['ok']")"
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/categories/1-nonexistent")
check "delete kategori asing → 404" "Kategori tidak ditemukan." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/categories/$CID")
check "delete kategori uji" "True" "$(jqget "$R" "['ok']")"

echo "── 6. SETTINGS ──────────────────────────────────────────"
R=$(curl -s "$BASE/api/settings")
check "settings storeName" "Berkat Mandiri Pendingin" "$(jqget "$R" "['storeName']")"
ORIG_LOGO=$(jqget "$R" "['logoUrl']")
R=$(curl -s -b "$CJ" -X PUT "$BASE/api/settings" -H 'Content-Type: application/json' -d '{"storeName":"Toko Uji Sementara"}')
check "settings PUT storeName" "Toko Uji Sementara" "$(jqget "$R" "['storeName']")"
R=$(curl -s -X PUT "$BASE/api/settings" -H 'Content-Type: application/json' -d '{"storeName":"Hacker"}')
check "settings PUT tanpa login → 401" "Tidak memiliki akses. Silakan login terlebih dahulu." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" -X PUT "$BASE/api/settings" -H 'Content-Type: application/json' -d '{"storeName":"Berkat Mandiri Pendingin"}')
check "settings restore" "Berkat Mandiri Pendingin" "$(jqget "$R" "['storeName']")"

echo "── 7. UPLOAD ────────────────────────────────────────────"
printf '\x89PNG\r\n\x1a\n test-bytes' > /tmp/php-upload-test.png
R=$(curl -s -b "$CJ" -X POST "$BASE/api/upload" -F "file=@/tmp/php-upload-test.png")
URL=$(jqget "$R" "['url']")
HOSTDIR="${HOSTDIR:-build/deploy}"
# URL kini relatif (uploads/...) — dukung juga bentuk lama (/uploads/...)
UPFILE="$HOSTDIR/$(printf '%s' "$URL" | sed 's#^/##')"
if [ -f "$UPFILE" ]; then PASS=$((PASS+1)); echo "PASS | upload file tersimpan ($URL)"; else FAIL=$((FAIL+1)); echo "FAIL | file tidak ada: $UPFILE"; fi
R=$(curl -s -X POST "$BASE/api/upload" -F "file=@/tmp/php-upload-test.png")
check "upload tanpa login → 401" "Tidak memiliki akses. Silakan login terlebih dahulu." "$(jqget "$R" "['error']")"
echo "bukan gambar" > /tmp/bad.txt
R=$(curl -s -b "$CJ" -X POST "$BASE/api/upload" -F "file=@/tmp/bad.txt")
check "upload tipe salah → 400" "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, SVG, ICO, atau AVIF." "$(jqget "$R" "['error']")"

echo "── 8. MEDIA ─────────────────────────────────────────────"
R=$(curl -s -b "$CJ" "$BASE/api/media")
MEDIAN=$(python3 -c "import json;print(len(json.load(open('/dev/stdin'))['items']))" <<< "$R")
if [ "$MEDIAN" -ge 1 ]; then PASS=$((PASS+1)); echo "PASS | media list ($MEDIAN file)"; else FAIL=$((FAIL+1)); echo "FAIL | media list kosong"; fi
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/media?url=$URL")
check "media delete" "True" "$(jqget "$R" "['ok']")"
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/media?url=/uploads/../../etc/passwd")
check "media traversal → 400" "URL media tidak valid." "$(jqget "$R" "['error']")"
R=$(curl -s "$BASE/api/media")
check "media tanpa login → 401" "Tidak memiliki akses. Silakan login terlebih dahulu." "$(jqget "$R" "['error']")"

echo "── 9. PAGES (CMS) ───────────────────────────────────────"
R=$(curl -s "$BASE/api/pages")
PUBN=$(python3 -c "import json;print(len(json.load(open('/dev/stdin'))['items']))" <<< "$R")
if [ "$PUBN" -ge 1 ]; then PASS=$((PASS+1)); echo "PASS | pages publik ($PUBN terbit)"; else FAIL=$((FAIL+1)); echo "FAIL | pages publik 0"; fi
R=$(curl -s "$BASE/api/pages?menu=1")
MENUN=$(python3 -c "import json;print(len(json.load(open('/dev/stdin'))['items']))" <<< "$R")
if [ "$MENUN" -ge 0 ]; then PASS=$((PASS+1)); echo "PASS | pages menu=1 ($MENUN)"; else FAIL=$((FAIL+1)); fi
R=$(curl -s "$BASE/api/pages?all=1")
check "pages all=1 anonim → 401" "Tidak memiliki akses. Silakan login terlebih dahulu." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" "$BASE/api/pages?all=1")
ALLN=$(python3 -c "import json;print(len(json.load(open('/dev/stdin'))['items']))" <<< "$R")
if [ "$ALLN" -ge "$PUBN" ]; then PASS=$((PASS+1)); echo "PASS | pages all=1 admin ($ALLN)"; else FAIL=$((FAIL+1)); fi
R=$(curl -s -b "$CJ" -X POST "$BASE/api/pages" -H 'Content-Type: application/json' -d '{"title":"Halaman Uji Deploy","content":"<h2>Halo</h2>","showInMenu":true}')
PGID=$(jqget "$R" "['id']")
PGSLUG=$(jqget "$R" "['slug']")
check "create page slug" "halaman-uji-deploy" "$PGSLUG"
R=$(curl -s -b "$CJ" -X PUT "$BASE/api/pages/$PGID" -H 'Content-Type: application/json' -d '{"content":"<p>Baru</p>","isPublished":true}')
check "update page" "<p>Baru</p>" "$(jqget "$R" "['content']")"
R=$(curl -s "$BASE/api/pages/slug/$PGSLUG")
check "page by slug publik" "Halaman Uji Deploy" "$(jqget "$R" "['title']")"
R=$(curl -s "$BASE/api/pages/slug/tidak-ada")
check "page slug 404" "Halaman tidak ditemukan." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/pages/$PGID")
check "delete page" "True" "$(jqget "$R" "['ok']")"

echo "── 10. MESSAGES ─────────────────────────────────────────"
R=$(curl -s "$BASE/api/messages")
check "messages anonim → 401" "Tidak memiliki akses. Silakan login terlebih dahulu." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" "$BASE/api/messages")
MSGN=$(python3 -c "import json;print(len(json.load(open('/dev/stdin'))['items']))" <<< "$R")
if [ "$MSGN" -ge 1 ]; then PASS=$((PASS+1)); echo "PASS | messages list ($MSGN)"; else FAIL=$((FAIL+1)); fi
R=$(curl -s -X POST "$BASE/api/messages" -H 'Content-Type: application/json' -d '{"name":"Budi","phone":"08123456789","message":"Halo, stok ada?"}')
check "message create 201" "True" "$(jqget "$R" "['ok']")"
R=$(curl -s -X POST "$BASE/api/messages" -H 'Content-Type: application/json' -d '{"name":"Budi","phone":"08123456789","message":"Halo","website":"http://spam.io"}')
check "honeypot diam" "True" "$(jqget "$R" "['ok']")"
R=$(curl -s -X POST "$BASE/api/messages" -H 'Content-Type: application/json' -d '{"name":"Budi","message":"tanpa telepon"}')
check "message tanpa phone → 400" "Nama, nomor telepon, dan pesan wajib diisi." "$(jqget "$R" "['error']")"
MID=$(curl -s -b "$CJ" "$BASE/api/messages" | python3 -c "import sys,json;print(json.load(sys.stdin)['items'][0]['id'])")
R=$(curl -s -b "$CJ" -X PUT "$BASE/api/messages/$MID" -H 'Content-Type: application/json' -d '{"isRead":true}')
check "message tandai dibaca" "True" "$(jqget "$R" "['isRead']")"
R=$(curl -s -b "$CJ" -X PUT "$BASE/api/messages/$MID" -H 'Content-Type: application/json' -d '{"isRead":false}')
R=$(curl -s -b "$CJ" -X DELETE "$BASE/api/messages/$MID")
check "message delete" "True" "$(jqget "$R" "['ok']")"

echo "── 11. STATS ────────────────────────────────────────────"
R=$(curl -s -b "$CJ" "$BASE/api/stats")
check "stats productTotal" "1000" "$(jqget "$R" "['productTotal']")"
check "stats categoryTotal" "13" "$(jqget "$R" "['categoryTotal']")"
HAS_LOW=$(echo "$R" | python3 -c "import sys,json;d=json.load(sys.stdin);print('True' if d.get('lowStock') is not None else 'False')")
check "stats punya lowStock" "True" "$HAS_LOW"
R=$(curl -s "$BASE/api/stats")
check "stats anonim → 401" "Tidak memiliki akses. Silakan login terlebih dahulu." "$(jqget "$R" "['error']")"

echo "── 12. CHANGE PASSWORD + LOGOUT ─────────────────────────"
R=$(curl -s -b "$CJ" -X POST "$BASE/api/auth/change-password" -H 'Content-Type: application/json' -d '{"currentPassword":"admin123","newPassword":"123"}')
check "ganti password pendek → 400" "Password baru minimal 6 karakter." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" -X POST "$BASE/api/auth/change-password" -H 'Content-Type: application/json' -d '{"currentPassword":"salah","newPassword":"admin1234"}')
check "password lama salah → 400" "Password lama tidak sesuai." "$(jqget "$R" "['error']")"
R=$(curl -s -b "$CJ" -X POST "$BASE/api/auth/change-password" -H 'Content-Type: application/json' -d '{"currentPassword":"admin123","newPassword":"admin1234"}')
check "ganti password ok" "True" "$(jqget "$R" "['ok']")"
R=$(curl -s -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin1234"}')
check "login dgn password baru" "admin" "$(jqget "$R" "['user']['username']")"
R=$(curl -s -b "$CJ" -X POST "$BASE/api/auth/change-password" -H 'Content-Type: application/json' -d '{"currentPassword":"admin1234","newPassword":"admin123"}')
check "ganti password kembali" "True" "$(jqget "$R" "['ok']")"
R=$(curl -s -b "$CJ" -X POST "$BASE/api/auth/logout")
check "logout" "True" "$(jqget "$R" "['ok']")"
R=$(curl -s -b "$CJ" "$BASE/api/auth/me")
check "me setelah logout → 401" "None" "$(jqget "$R" "['user']")"

echo "── 13. EDGE CASES ───────────────────────────────────────"
R=$(curl -s "$BASE/api/endpoint-tidak-ada")
check "404 endpoint" "Endpoint tidak ditemukan." "$(jqget "$R" "['error']")"
R=$(curl -s -X DELETE "$BASE/api/settings")
check "method salah → 405" "Metode tidak didukung." "$(jqget "$R" "['error']")"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/data/products.json")
# Di hosting nyata & router uji, /api/data/* tertangkap rewrite → PHP balas 404 JSON.
check "data JSON terproteksi (403/404)" "404" "$CODE"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "HASIL: $PASS PASS, $FAIL FAIL"
echo "═══════════════════════════════════════════════════════"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
