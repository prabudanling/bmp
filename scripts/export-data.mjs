/**
 * export-data.mjs — Ekspor database SQLite (Prisma) → file JSON
 * untuk backend PHP di shared hosting (php-api/data/*.json)
 * + snapshot statis api-cache/*.json untuk MODE DARURAT.
 *
 * Semua URL gambar diubah menjadi RELATIF (`uploads/...` bukan
 * `/uploads/...`) sehingga paket deploy bekerja di domain root
 * maupun di subfolder.
 *
 * Pemakaian:
 *   bun scripts/export-data.mjs [--out <folder>] [--cache <folder>]
 *   (default --out: php-api/data)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const outIdx = args.indexOf('--out')
const OUT_DIR = outIdx !== -1 && args[outIdx + 1]
  ? path.resolve(args[outIdx + 1])
  : path.resolve(import.meta.dir, '..', 'php-api', 'data')
const cacheIdx = args.indexOf('--cache')
const CACHE_DIR = cacheIdx !== -1 && args[cacheIdx + 1]
  ? path.resolve(args[cacheIdx + 1])
  : null

const db = new PrismaClient()

function iso(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

/**
 * Ubah URL absolut `/uploads/...` menjadi relatif `uploads/...`.
 * Menangani: nilai langsung ('/uploads/x.png'), di dalam JSON string
 * (["/uploads/x.png"]), atribut HTML (src="/uploads/x.png"), dan url CSS.
 */
function relUrls(value) {
  if (typeof value === 'string') {
    let s = value.replace(/([\("'`\s])\/uploads\//g, '$1uploads/')
    if (s.startsWith('/uploads/')) s = s.slice(1)
    return s
  }
  if (Array.isArray(value)) return value.map(relUrls)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = relUrls(v)
    return out
  }
  return value
}

/** PHP password_verify paling aman dengan prefix $2y$ (identik secara algoritma). */
function phpHash(hash) {
  return String(hash).replace(/^\$2[ab]\$/, '$2y$')
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // ── Admins ──────────────────────────────────────────────────────────
  let admins = await db.admin.findMany()
  if (admins.length === 0) {
    // Fallback: akun default agar dashboard tetap bisa dibuka
    const hash = await bcrypt.hash('admin123', 10)
    const created = await db.admin.create({
      data: { username: 'admin', password: hash, name: 'Admin Berkat Mandiri' },
    })
    admins = [created]
    console.log('  ℹ️  Tidak ada admin di DB — dibuat akun default admin/admin123')
  }
  const adminsJson = admins.map((a) => ({
    id: a.id,
    username: a.username,
    password: phpHash(a.password),
    name: a.name,
    createdAt: iso(a.createdAt),
    updatedAt: iso(a.updatedAt),
  }))

  // ── Categories ──────────────────────────────────────────────────────
  const categories = await db.category.findMany()
  const categoriesJson = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    createdAt: iso(c.createdAt),
  }))

  // ── Products (specs & images tetap string JSON, seperti di DB) ──────
  const products = await db.product.findMany()
  const productsJson = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    brand: p.brand,
    categoryId: p.categoryId,
    price: p.price,
    unit: p.unit,
    stock: p.stock,
    shortDesc: p.shortDesc,
    description: relUrls(p.description),
    specs: relUrls(p.specs || '[]'),
    images: relUrls(p.images || '[]'),
    isFeatured: !!p.isFeatured,
    isActive: !!p.isActive,
    views: p.views,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  }))

  // ── Settings (key → value) ──────────────────────────────────────────
  const rows = await db.setting.findMany()
  const settingsJson = Object.fromEntries(
    rows.map((r) => [r.key, relUrls(r.value)])
  )

  // ── Pages (CMS) ─────────────────────────────────────────────────────
  const pages = await db.page.findMany()
  const pagesJson = pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: relUrls(p.content || ''),
    excerpt: relUrls(p.excerpt || ''),
    isPublished: !!p.isPublished,
    showInMenu: !!p.showInMenu,
    sortOrder: p.sortOrder,
    views: p.views,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  }))

  // ── Messages ────────────────────────────────────────────────────────
  const messages = await db.message.findMany()
  const messagesJson = messages.map((m) => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    email: m.email,
    message: m.message,
    isRead: !!m.isRead,
    createdAt: iso(m.createdAt),
  }))

  const files = {
    admins: adminsJson,
    categories: categoriesJson,
    products: productsJson,
    settings: settingsJson,
    pages: pagesJson,
    messages: messagesJson,
  }

  for (const [name, data] of Object.entries(files)) {
    fs.writeFileSync(
      path.join(OUT_DIR, `${name}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    )
  }

  console.log(`✅ Data diekspor ke ${OUT_DIR}`)
  console.log(`   • admins:    ${adminsJson.length}`)
  console.log(`   • categories:${categoriesJson.length}`)
  console.log(`   • products:  ${productsJson.length}`)
  console.log(`   • settings:  ${Object.keys(settingsJson).length} key`)
  console.log(`   • pages:     ${pagesJson.length}`)
  console.log(`   • messages:  ${messagesJson.length}`)

  // ── Snapshot MODE DARURAT (api-cache) ───────────────────────────────
  // Publik & aman: TANPA admins (hash password) & TANPA messages (privasi).
  if (CACHE_DIR) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    const cacheFiles = {
      products: productsJson,
      categories: categoriesJson,
      pages: pagesJson,
      settings: settingsJson,
    }
    for (const [name, data] of Object.entries(cacheFiles)) {
      fs.writeFileSync(
        path.join(CACHE_DIR, `${name}.json`),
        JSON.stringify(data),
        'utf-8'
      )
    }
    console.log(`✅ Snapshot mode darurat → ${CACHE_DIR} (products/categories/pages/settings)`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Export gagal:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
