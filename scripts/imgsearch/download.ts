/**
 * Download semua gambar hasil image-search ke public/uploads/products/
 * + membuat image-map.json (family -> daftar path lokal yang berhasil).
 * Jalankan: bun scripts/imgsearch/download.ts
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const RESULTS = join(ROOT, 'scripts/imgsearch/results')
const DEST = join(ROOT, 'public/uploads/products')
const MAPFILE = join(ROOT, 'scripts/imgsearch/image-map.json')

const MIN_BYTES = 4000 // < 4KB = hampir pasti error page/blank

async function download(url: string, dest: string): Promise<number> {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) return 0
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < MIN_BYTES) return 0
  writeFileSync(dest, buf)
  return buf.length
}

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpg|jpeg|png|webp|gif)(?:\?|$)/i)
  return m ? m[1].toLowerCase() : 'jpg'
}

async function main() {
  mkdirSync(DEST, { recursive: true })
  const files = readdirSync(RESULTS).filter((f) => f.endsWith('.json'))
  const map: Record<string, string[]> = {}
  let totalOk = 0
  let totalFail = 0

  for (const f of files) {
    const family = f.replace('.json', '')
    map[family] = []
    let data: { success?: boolean; results?: { original_url: string }[] }
    try {
      data = JSON.parse(readFileSync(join(RESULTS, f), 'utf8'))
    } catch {
      console.log(`SKIP ${family}: JSON invalid`)
      continue
    }
    if (!data.success || !Array.isArray(data.results) || data.results.length === 0) {
      console.log(`SKIP ${family}: search gagal/kosong`)
      continue
    }

    let i = 0
    for (const r of data.results) {
      const url = r.original_url
      if (!url) continue
      const fname = `${family}-${String(i).padStart(2, '0')}.${extFromUrl(url)}`
      const dest = join(DEST, fname)
      i++
      // skip jika sudah pernah berhasil didownload (idempotent)
      if (existsSync(dest) && statSync(dest).size >= MIN_BYTES) {
        map[family].push(`products/${fname}`)
        totalOk++
        continue
      }
      try {
        const size = await download(url, dest)
        if (size > 0) {
          map[family].push(`products/${fname}`)
          totalOk++
          console.log(`OK   ${fname} (${(size / 1024).toFixed(0)}KB)`)
        } else {
          totalFail++
          console.log(`GAGAL ${fname}`)
        }
      } catch {
        totalFail++
        console.log(`GAGAL ${fname} (exception)`)
      }
    }
    console.log(`--- ${family}: ${map[family].length} gambar siap`)
  }

  // buang family tanpa gambar
  for (const k of Object.keys(map)) {
    if (map[k].length === 0) delete map[k]
  }
  writeFileSync(MAPFILE, JSON.stringify(map, null, 2))
  console.log(`\nSELESAI: ${totalOk} gambar OK, ${totalFail} gagal, ${Object.keys(map).length} family`)
}

main()
