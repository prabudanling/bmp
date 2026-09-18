import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * robots.txt dinamis — daftar Disallow bisa diedit dari
 * SEO Command Center VVIP (Setting key: seoRobotsDisallow).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = getSiteUrl()

  let disallow = ['/admin']
  try {
    const row = await db.setting.findUnique({ where: { key: 'seoRobotsDisallow' } })
    if (row?.value) {
      const parsed = JSON.parse(row.value)
      if (Array.isArray(parsed)) {
        disallow = parsed
          .map((s) => String(s).trim())
          .filter(Boolean)
      }
    }
  } catch {
    // pakai default
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${site}/sitemap.xml`,
  }
}
