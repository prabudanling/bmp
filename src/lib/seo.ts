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
    title: 'Kompresor & Sparepart AC Glodok | Berkat Mandiri Pendingin',
    description:
      'Toko kompresor & sparepart AC original di New Harco Glodok, Jakarta Barat. 1000+ item ready stok: kompresor rotary/scroll, kapasitor, motor fan, freon. Kirim seluruh Indonesia.',
    keywords:
      'toko sparepart AC glodok, jual kompresor AC glodok, kompresor AC jakarta barat, sparepart AC original glodok, toko kompresor pendingin glodok, kapasitor AC original, motor fan AC jakarta, freon AC murah glodok, sparepart AC harco glodok, jual kompresor AC jakarta',
    priority: 1,
  },
  {
    routePath: '/katalog',
    title: 'Katalog 1000+ Sparepart & Kompresor AC Glodok | Harga Grosir',
    description:
      'Katalog lengkap kompresor AC, kapasitor, motor fan, termostat, freon & fitting di Glodok Jakarta Barat. Harga jujur, stok terupdate, pesan mudah via WhatsApp.',
    keywords:
      'katalog sparepart AC, harga kompresor AC, katalog kompresor AC glodok, harga kompresor AC 1 pk, jual kapasitor AC glodok, grosir sparepart AC jakarta, harga freon AC jakarta barat',
    priority: 0.9,
  },
  {
    routePath: '/kontak',
    title: 'Kontak & Lokasi Toko AC Glodok | Berkat Mandiri Pendingin',
    description:
      'Kunjungi toko kami di New Harco Glodok Lantai 1 Blok C 45, Jakarta Barat, atau hubungi Mr. Encep (WA +62 812-5000-3323). Konsultasi part, cek stok, harga grosir.',
    keywords:
      'alamat toko sparepart AC glodok, lokasi toko kompresor AC jakarta barat, kontak sparepart AC glodok, toko AC harco glodok, telp toko sparepart AC jakarta',
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

  // Alamat granular untuk local SEO (postal code & kota membantu Google Maps)
  const rawAddress = map.address?.trim() || ''
  const postal = rawAddress.match(/\b(\d{5})\b/)?.[1]
  const locality =
    rawAddress.match(/Jakarta\s+Barat/i)?.[0] || 'Jakarta Barat'
  const waDigits = (map.whatsapp || '').replace(/\D/g, '')

  return {
    '@context': 'https://schema.org',
    '@type': 'HardwareStore',
    '@id': `${siteUrl}/#store`,
    name: storeName,
    description: `Toko spesialis kompresor dan sparepart AC original di New Harco Glodok, Jakarta Barat. ${
      map.tagline?.trim() || 'Spesialis Kompresor & Sparepart AC'
    }. Melayani satuan & grosir, kirim ke seluruh Indonesia.`,
    url: siteUrl,
    telephone: map.phone?.trim() || map.whatsapp?.trim() || undefined,
    email: map.email?.trim() || undefined,
    address: rawAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: rawAddress.replace(/,\s*(Jakarta\s*Barat|DKI\s*Jakarta|Indonesia|\d{5})[^,]*/gi, '').replace(/,\s*$/, ''),
          addressLocality: locality,
          addressRegion: 'DKI Jakarta',
          ...(postal ? { postalCode: postal } : {}),
          addressCountry: 'ID',
        }
      : undefined,
    // Pusat Gedung New Harco Glodok, Jl. Hayam Wuruk — membantu Google Maps & paket lokasi
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -6.1481,
      longitude: 106.8136,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '08:00',
        closes: '17:00',
      },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        ...(map.contactPerson?.trim()
          ? { name: map.contactPerson.trim() }
          : {}),
        ...(waDigits
          ? { telephone: `+${waDigits}` }
          : map.phone?.trim()
            ? { telephone: map.phone.trim() }
            : {}),
        availableLanguage: ['id', 'ID'],
      },
    ],
    priceRange: 'Rp',
    currenciesAccepted: 'IDR',
    paymentAccepted: 'Cash, Transfer Bank, QRIS, GoPay, OVO, DANA',
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
