import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'
import { getAllMetas, getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * GET /api/seo/report — laporan SEO lengkap siap unduh (JSON).
 * Dipakai panel VVIP untuk ekspor & dokumentasi kemajuan.
 */
export async function GET(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  const [metas, keywords, issues, events, productTotal, productActive] = await Promise.all([
    getAllMetas(),
    db.seoKeyword.findMany({ orderBy: { createdAt: 'desc' } }),
    db.seoIssue.findMany({ orderBy: { updatedAt: 'desc' }, take: 300 }),
    db.seoEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
  ])

  const report = {
    meta: {
      generatedAt: new Date().toISOString(),
      site: getSiteUrl(),
      store: 'Berkat Mandiri Pendingin',
      generatedBy: auth.username,
      role: auth.role,
      tool: 'SEO Command Center — Super VVIP',
    },
    products: { total: productTotal, active: productActive },
    pageMetas: metas,
    keywords: keywords.map((k) => ({
      keyword: k.keyword,
      targetUrl: k.targetUrl,
      position: k.position,
      bestPosition: k.bestPosition,
      volume: k.volume,
      history: k.history,
    })),
    issues: issues.map((i) => ({
      severity: i.severity,
      type: i.type,
      title: i.title,
      detail: i.detail,
      target: i.target,
      status: i.status,
      updatedAt: i.updatedAt.toISOString(),
    })),
    activity: events.map((e) => ({
      actor: e.actor,
      action: e.action,
      detail: e.detail,
      createdAt: e.createdAt.toISOString(),
    })),
  }

  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="seo-report-${stamp}.json"`,
    },
  })
}
