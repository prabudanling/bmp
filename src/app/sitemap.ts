import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { DEFAULT_ROUTES, getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * Sitemap dinamis — dibaca langsung oleh Google Search Console.
 * URL produk memakai fragment hash sesuai arsitektur SPA (#/produk/slug).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl()

  const [products, categories, pages, metaRows] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    db.category.findMany({ select: { slug: true, name: true } }),
    db.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    db.seoPageMeta.findMany(),
  ])

  const priorityByRoute = new Map(metaRows.map((m) => [m.routePath, m.priority]))

  const entries: MetadataRoute.Sitemap = []

  // Halaman utama (priority dari meta manager bila tersedia)
  for (const d of DEFAULT_ROUTES) {
    entries.push({
      url: `${site}/#${d.routePath === '/' ? '/' : d.routePath}`,
      lastModified: new Date(),
      changeFrequency: d.routePath === '/' ? 'daily' : 'weekly',
      priority: priorityByRoute.get(d.routePath) ?? d.priority,
    })
  }

  // Kategori
  for (const c of categories) {
    entries.push({
      url: `${site}/#/katalog?category=${c.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  // Produk aktif
  for (const p of products) {
    entries.push({
      url: `${site}/#/produk/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Halaman CMS
  for (const pg of pages) {
    entries.push({
      url: `${site}/#/p/${pg.slug}`,
      lastModified: pg.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}
