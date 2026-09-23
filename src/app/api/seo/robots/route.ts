import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'
import { getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const DEFAULT_DISALLOW = ['/admin']

async function readDisallow(): Promise<string[]> {
  try {
    const row = await db.setting.findUnique({ where: { key: 'seoRobotsDisallow' } })
    if (row?.value) {
      const parsed = JSON.parse(row.value)
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean)
      }
    }
  } catch {
    /* default */
  }
  return DEFAULT_DISALLOW
}

/** GET /api/seo/robots — isi robots.txt aktif + daftar Disallow */
export async function GET(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  const disallow = await readDisallow()
  const site = getSiteUrl()
  const text = [
    'User-agent: *',
    'Allow: /',
    ...disallow.map((d) => `Disallow: ${d}`),
    '',
    `Sitemap: ${site}/sitemap.xml`,
  ].join('\n')

  return NextResponse.json({ disallow, text, sitemapUrl: `${site}/sitemap.xml` })
}

/** PUT /api/seo/robots — simpan daftar Disallow (array of path) */
export async function PUT(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const body = await req.json()
    const raw = Array.isArray(body.disallow)
      ? body.disallow
      : String(body.disallow || '').split('\n')
    const disallow = raw
      .map((s: unknown) => String(s).trim())
      .filter((s: string) => s.startsWith('/') && !s.includes(' '))

    await db.setting.upsert({
      where: { key: 'seoRobotsDisallow' },
      update: { value: JSON.stringify(disallow) },
      create: { key: 'seoRobotsDisallow', value: JSON.stringify(disallow) },
    })

    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'robots.update',
        detail: `robots.txt diperbarui (${disallow.length} aturan Disallow)`,
      },
    })
    return NextResponse.json({ ok: true, disallow })
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan robots.txt.' }, { status: 500 })
  }
}
