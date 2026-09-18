import { db } from '@/lib/db'

/* ============================================================
 * SEO COMMAND CENTER — inti logika bersama (SSR + API)
 * ============================================================ */

/** URL dasar situs (untuk canonical, sitemap, OG) */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ).replace(/\/$/, '')
}

/** Halaman-halaman utama yang wajib punya meta tag rapi */
export const DEFAULT_ROUTES = [
  {
    routePath: '/',
    title: 'Berkat Mandiri Pendingin — Kompresor & Sparepart AC Terlengkap',
    description:
      'Toko spesialis kompresor dan sparepart AC: kompresor rotary & scroll, motor fan, kapasitor, termostat, freon, dan aksesoris AC lainnya. Original, bergaransi, kirim ke seluruh Indonesia.',
    keywords:
      'kompresor AC, sparepart AC, jual kompresor AC, kapasitor AC, motor fan AC, freon AC',
    priority: 1,
  },
  {
    routePath: '/katalog',
    title: 'Katalog Produk — Kompresor & Sparepart AC',
    description:
      'Jelajahi ratusan kompresor, kapasitor, motor fan, termostat, dan sparepart AC lainnya. Harga jujur, stok terupdate, pemesanan mudah via WhatsApp.',
    keywords: 'katalog sparepart AC, harga kompresor, katalog kompresor AC',
    priority: 0.9,
  },
  {
    routePath: '/kontak',
    title: 'Kontak & Lokasi Toko — Berkat Mandiri Pendingin',
    description:
      'Hubungi tim kami untuk konsultasi part, cek stok, kerja sama grosir, atau kunjungi toko. Respon cepat di jam kerja.',
    keywords: 'kontak toko AC, alamat toko sparepart AC, grosir sparepart AC',
    priority: 0.8,
  },
]

/** Ambil meta dari DB, merge dengan default untuk route utama */
export async function getAllMetas() {
  const rows = await db.seoPageMeta.findMany({
    orderBy: { routePath: 'asc' },
  })
  const byRoute = new Map(rows.map((r) => [r.routePath, r]))
  // Route default yang belum pernah disimpan → tampilkan sebagai default
  const defaults = DEFAULT_ROUTES.filter(
    (d) => !byRoute.has(d.routePath)
  ).map((d, i) => ({
    id: `default-${i}`,
    routePath: d.routePath,
    title: d.title,
    description: d.description,
    keywords: d.keywords,
    ogImage: '',
    robots: 'index,follow',
    priority: d.priority,
    updatedAt: new Date(0).toISOString(),
    isDefault: true,
  }))
  const saved = rows.map((r) => ({
    ...r,
    updatedAt: r.updatedAt.toISOString(),
    isDefault: false,
  }))
  return [...saved, ...defaults].sort(
    (a, b) => b.priority - a.priority || a.routePath.localeCompare(b.routePath)
  )
}

/** Ambil meta satu route (untuk generateMetadata) */
export async function getMetaForRoute(routePath: string) {
  const row = await db.seoPageMeta.findUnique({ where: { routePath } })
  if (row) return row
  return DEFAULT_ROUTES.find((d) => d.routePath === routePath) || null
}

/** Data terstruktur Schema.org untuk hasil pencarian kaya Google */
export async function buildJsonLd() {
  const rows = await db.setting.findMany()
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  const storeName = map.storeName?.trim() || 'Berkat Mandiri Pendingin'
  const socials = [map.instagram, map.facebook, map.youtube, map.tiktok]
    .map((s) => s?.trim())
    .filter(Boolean)
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'HardwareStore',
    '@id': `${siteUrl}/#store`,
    name: storeName,
    description: `Toko spesialis kompresor dan sparepart AC original. ${
      map.tagline?.trim() || 'Spesialis Kompresor & Sparepart AC'
    }.`,
    url: siteUrl,
    telephone: map.phone?.trim() || map.whatsapp?.trim() || undefined,
    email: map.email?.trim() || undefined,
    address: map.address?.trim()
      ? {
          '@type': 'PostalAddress',
          streetAddress: map.address.trim(),
          addressCountry: 'ID',
        }
      : undefined,
    openingHours: 'Mo-Sa 08:00-17:00',
    priceRange: 'Rp',
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    sameAs: socials.length ? socials : undefined,
  }
}

/** Total URL di sitemap (produk aktif + kategori + halaman + route utama) */
export async function countSitemapUrls(): Promise<number> {
  const [products, categories, pages] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.category.count(),
    db.page.count({ where: { isPublished: true } }),
  ])
  return DEFAULT_ROUTES.length + products + categories + pages
}
