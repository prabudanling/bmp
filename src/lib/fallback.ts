/**
 * fallback.ts — MODE DARURAT (read-only)
 * ============================================================
 * Bila backend PHP/API tidak aktif di hosting (PHP versi lama,
 * mod_rewrite bermasalah, atau file belum lengkap), aplikasi
 * TETAP HARUS TAMPIL. Modul ini menyajikan data dari snapshot
 * statis di /api-cache/*.json yang dibuat saat build paket deploy.
 *
 * Semua bentuk data dibuat identik dengan REST API asli agar
 * komponen UI tidak perlu tahu bedanya.
 */

import { DEFAULT_SETTINGS } from '@/lib/settings'
import type {
  CategoryDTO,
  PageDTO,
  ProductDTO,
  ProductsResponse,
  SpecItem,
  StatsDTO,
  StoreSettings,
} from '@/lib/types'

/** Pesan untuk aksi tulis saat backend mati */
export const BACKEND_DEAD_MSG =
  'Server (PHP) tidak aktif di hosting ini sehingga fitur tulis tidak tersedia. ' +
  'Situs tampil dalam mode baca-saja dari snapshot. Buka /cek.php di browser ' +
  'untuk melihat diagnosis dan cara memperbaikinya.'

interface RawCategory {
  id: string
  name: string
  slug: string
  icon: string
  createdAt: string
}

interface RawProduct {
  id: string
  name: string
  slug: string
  sku: string | null
  brand: string | null
  categoryId: string | null
  price: number | null
  unit: string
  stock: number
  shortDesc: string | null
  description: string
  specs: string
  images: string
  isFeatured: boolean
  isActive: boolean
  views: number
  createdAt: string
  updatedAt: string
}

interface RawPage {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  isPublished: boolean
  showInMenu: boolean
  sortOrder: number
  views: number
  createdAt: string
  updatedAt: string
}

const cacheMap = new Map<string, Promise<unknown>>()

function loadJson<T>(file: string): Promise<T> {
  if (!cacheMap.has(file)) {
    cacheMap.set(
      file,
      fetch(`api-cache/${file}.json`).then((r) => {
        if (!r.ok) throw new Error(`Snapshot ${file} tidak tersedia`)
        return r.json() as Promise<T>
      })
    )
  }
  return cacheMap.get(file) as Promise<T>
}

async function getCategories(): Promise<RawCategory[]> {
  return loadJson<RawCategory[]>('categories')
}

async function getProducts(): Promise<RawProduct[]> {
  return loadJson<RawProduct[]>('products')
}

async function getPages(): Promise<RawPage[]> {
  return loadJson<RawPage[]>('pages')
}

function categoryMap(cats: RawCategory[]): Record<string, RawCategory> {
  const map: Record<string, RawCategory> = {}
  for (const c of cats) map[c.id] = c
  return map
}

function safeParseArray(json: string | null | undefined): unknown[] {
  try {
    const v = JSON.parse(json || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function productDto(p: RawProduct, cm: Record<string, RawCategory>): ProductDTO {
  const specs = safeParseArray(p.specs) as SpecItem[]
  const images = safeParseArray(p.images) as string[]
  const c = p.categoryId ? cm[p.categoryId] : undefined
  return {
    ...p,
    specs,
    images,
    category: c
      ? { id: c.id, name: c.name, slug: c.slug, icon: c.icon }
      : null,
  }
}

/** Paritas dengan filter handler PHP/Next (pencarian teks) */
function matchQuery(p: RawProduct, q: string): boolean {
  const needle = q.toLowerCase()
  const hay = [p.name, p.brand, p.sku, p.shortDesc, p.description]
    .map((s) => (s || '').toLowerCase())
    .join('\n')
  return hay.includes(needle)
}

function cmpCreatedDesc(a: RawProduct, b: RawProduct): number {
  return (b.createdAt || '').localeCompare(a.createdAt || '')
}

/** Paritas dengan sort handler PHP: terbaru, harga-asc, harga-desc, nama, populer */
function sortProducts(items: RawProduct[], sort: string): RawProduct[] {
  const out = [...items]
  out.sort((a, b) => {
    if (sort === 'harga-asc') {
      const pa = a.price ?? null
      const pb = b.price ?? null
      if (pa === null && pb === null) return cmpCreatedDesc(a, b)
      if (pa === null) return -1
      if (pb === null) return 1
      if (pa !== pb) return pa < pb ? -1 : 1
      return cmpCreatedDesc(a, b)
    }
    if (sort === 'harga-desc') {
      const pa = a.price ?? null
      const pb = b.price ?? null
      if (pa === null && pb === null) return cmpCreatedDesc(a, b)
      if (pa === null) return 1
      if (pb === null) return -1
      if (pa !== pb) return pa > pb ? -1 : 1
      return cmpCreatedDesc(a, b)
    }
    if (sort === 'nama') {
      const r = (a.name || '').localeCompare(b.name || '', 'id')
      return r !== 0 ? r : cmpCreatedDesc(a, b)
    }
    if (sort === 'populer') {
      if (a.views !== b.views) return b.views - a.views
      return cmpCreatedDesc(a, b)
    }
    // terbaru (default)
    return cmpCreatedDesc(a, b)
  })
  return out
}

async function productsList(params: URLSearchParams): Promise<ProductsResponse> {
  const [rows, cats] = await Promise.all([getProducts(), getCategories()])
  const cm = categoryMap(cats)

  const q = (params.get('q') || '').trim()
  const category = params.get('category') || ''
  const featured = params.get('featured') === '1'
  const exclude = params.get('exclude') || ''
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)
  const limit = Math.min(48, Math.max(1, parseInt(params.get('limit') || '12', 10) || 12))
  const sort = params.get('sort') || 'terbaru'

  let items = rows.filter((p) => !!p.isActive)
  if (q) items = items.filter((p) => matchQuery(p, q))
  if (category) {
    items = items.filter((p) => {
      const c = p.categoryId ? cm[p.categoryId] : undefined
      return !!c && c.slug === category
    })
  }
  if (featured) items = items.filter((p) => !!p.isFeatured)
  if (exclude) items = items.filter((p) => p.id !== exclude)
  items = sortProducts(items, sort)

  const total = items.length
  const pages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  return {
    items: items.slice(start, start + limit).map((p) => productDto(p, cm)),
    total,
    page,
    pages,
  }
}

function sortPages(items: RawPage[]): RawPage[] {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return (a.createdAt || '').localeCompare(b.createdAt || '')
  })
}

async function statsFallback(): Promise<StatsDTO> {
  const [prods, cats] = await Promise.all([getProducts(), getCategories()])
  const cm = categoryMap(cats)
  const active = prods.filter((p) => !!p.isActive)
  const totalViews = prods.reduce((acc, p) => acc + (p.views || 0), 0)
  const lowStock = active
    .filter((p) => p.stock <= 3)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      images: safeParseArray(p.images) as string[],
    }))
  const recentProducts = [...prods]
    .sort((a, b) => cmpCreatedDesc(a, b))
    .slice(0, 5)
    .map((p) => productDto(p, cm))
  return {
    productTotal: prods.length,
    productActive: active.length,
    categoryTotal: cats.length,
    unreadMessages: 0,
    totalViews,
    lowStock,
    recentMessages: [],
    recentProducts,
  }
}

/**
 * Menjawab permintaan GET dari snapshot statis.
 * path: 'api/...' (relatif, tanpa query), params: query string.
 * Melempar Error bila endpoint tidak bisa dilayani dari snapshot.
 */
export async function fallbackFor(path: string, params: URLSearchParams): Promise<unknown> {
  const seg = path.replace(/^api\/?/, '').split('/').filter(Boolean)

  if (path === 'api/settings') {
    const raw = await loadJson<Partial<StoreSettings>>('settings')
    return { ...DEFAULT_SETTINGS, ...raw }
  }

  if (path === 'api/categories') {
    const [cats, prods] = await Promise.all([getCategories(), getProducts()])
    const count: Record<string, number> = {}
    for (const p of prods) {
      if (p.isActive && p.categoryId) count[p.categoryId] = (count[p.categoryId] || 0) + 1
    }
    const items: CategoryDTO[] = cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      productCount: count[c.id] || 0,
    }))
    return { items }
  }

  if (path === 'api/products') {
    if (seg.length === 1) return productsList(params)
    // detail produk: /api/products/{id|slug}
    const key = decodeURIComponent(seg.slice(1).join('/'))
    const [rows, cats] = await Promise.all([getProducts(), getCategories()])
    const cm = categoryMap(cats)
    const found = rows.find((p) => p.id === key || p.slug === key)
    if (!found) throw new Error('Produk tidak ditemukan.')
    return productDto(found, cm)
  }

  if (path === 'api/pages') {
    const rows = sortPages(await getPages())
    if (params.get('menu') === '1') {
      return {
        items: rows
          .filter((p) => p.isPublished && p.showInMenu)
          .map((p) => ({ ...p })),
      }
    }
    return { items: rows.map((p) => ({ ...p })) }
  }

  if (seg[0] === 'pages' && seg[1] === 'slug' && seg.length >= 3) {
    const slug = decodeURIComponent(seg.slice(2).join('/'))
    const rows = sortPages(await getPages())
    const found = rows.find((p) => p.slug === slug && p.isPublished)
    if (!found) throw new Error('Halaman tidak ditemukan.')
    return { ...found }
  }

  if (path === 'api/stats') return statsFallback()

  if (path === 'api/auth/me') return { user: null }

  throw new Error(BACKEND_DEAD_MSG)
}
