#!/bin/bash
# Runner pencarian gambar — foreground, skip yang sudah ada
cd "$(dirname "$0")"
TOTAL=$(wc -l < queries.tsv)
i=0
while IFS=$'\t' read -r family query; do
  i=$((i+1))
  out="results/${family}.json"
  if [ -s "$out" ] && grep -q '"success": true' "$out" 2>/dev/null; then echo "[SKIP] $family"; continue; fi
  echo "[$i/$TOTAL] SEARCH $family ..."
  tmp=$(mktemp)
  z-ai image-search -q "$query" -c 10 --gl us --no-rank > "$tmp" 2>/dev/null
  # ekstrak JSON dari output (buang banner emoji)
  node -e "
    const fs = require('fs');
    try {
      const raw = fs.readFileSync('$tmp', 'utf8');
      const j = raw.indexOf('{');
      if (j < 0) throw new Error('no json');
      const d = JSON.parse(raw.slice(j));
      if (!d.success || !d.results || d.results.length === 0) throw new Error('empty');
      fs.writeFileSync('$out', JSON.stringify(d, null, 2));
      console.log('  OK — ' + d.results.length + ' gambar');
    } catch (e) { console.log('  GAGAL: ' + e.message); }
  "
  rm -f "$tmp"
  sleep 2
done < queries.tsv
echo "CHUNK SELESAI"
