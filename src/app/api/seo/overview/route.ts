import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'
import { buildJsonLd, countSitemapUrls, DEFAULT_ROUTES, getAllMetas, getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/** GET /api/seo/overview — skor, statistik, dan feed aktivitas VVIP */
export async function GET(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  const [productTotal, productActive, products, categories, pages, keywords, metas, issues, events, sitemapUrls, jsonLd] =
    await Promise.all([
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
      db.product.findMany({
        where: { isActive: true },
        select: { description: true, shortDesc: true, images: true },
      }),
      db.category.count(),
      db.page.count({ where: { isPublished: true } }),
      db.seoKeyword.findMany({ select: { position: true } }),
      getAllMetas(),
      db.seoIssue.findMany({ where: { status: 'OPEN' } }),
      db.seoEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
      countSitemapUrls(),
      buildJsonLd(),
    ])

  const productsMissingDesc = products.filter(
    (p) => !p.description || p.description.trim().length === 0
  ).length
  const productsMissingImages = products.filter((p) => {
    try {
      return (JSON.parse(p.images || '[]') as string[]).length === 0
    } catch {
      return true
    }
  }).length
  const productsThinContent = products.filter(
    (p) => (p.description || '').trim().length > 0 && (p.description || '').trim().length < 80
  ).length

  // ── Skor Konten (maks 40) ───────────────────────────────────
  const n = products.length || 1
  let content = 0
  if (products.length > 0) {
    content +=
      ((products.length - productsMissingDesc) / n) * 20 +
      ((products.length - productsMissingImages) / n) * 10 +
      ((products.length - productsThinContent) / n) * 10
    content = Math.round(content)
  } else {
    content = 8 // belum ada produk — beri skor dasar
  }

  // ── Skor Meta (maks 30) — 10 poin per route utama ───────────
  const metaRows = metas.filter((m) => !m.isDefault)
  let meta = 0
  for (const d of DEFAULT_ROUTES) {
    const row = metas.find((m) => m.routePath === d.routePath)
    if (row && row.title.trim().length >= 20 && row.description.trim().length >= 70) {
      meta += 10
    }
  }

  // ── Skor Keyword (maks 15) ──────────────────────────────────
  const tracked = keywords.length
  const withPos = keywords.filter((k) => k.position != null)
  const top3 = withPos.filter((k) => (k.position ?? 99) <= 3)
  let keywordScore = 0
  if (tracked > 0) {
    keywordScore = Math.round((withPos.length / tracked) * 10 + (top3.length / tracked) * 5)
  }

  // ── Skor Teknis (maks 15) ───────────────────────────────────
  const technical =
    (sitemapUrls >= 5 ? 5 : sitemapUrls >= 1 ? 3 : 0) +
    5 + // JSON-LD selalu tersedia (layout SSR)
    (metaRows.length > 0 ? 5 : 0)

  const score = Math.max(0, Math.min(100, content + meta + keywordScore + technical))

  const positions = withPos.map((k) => k.position as number)
  const avgPosition = positions.length
    ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
    : null

  const sevOrder: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 }
  const issuesPreview = issues
    .sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3))
    .slice(0, 6)
    .map((i) => ({ ...i, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString() }))

  const lastAudit = await db.seoEvent.findFirst({
    where: { action: 'audit.run' },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    score,
    breakdown: {
      content: Math.min(40, content),
      meta: Math.min(30, meta),
      keywords: Math.min(15, keywordScore),
      technical: Math.min(15, technical),
    },
    stats: {
      productTotal,
      productActive,
      productsMissingDesc,
      productsMissingImages,
      productsThinContent,
      categoryTotal: categories,
      pageTotal: pages,
      metaRows: metaRows.length,
      keywordsTracked: tracked,
      keywordsWithPosition: withPos.length,
      keywordsTop3: top3.length,
      avgPosition,
      sitemapUrls,
      issuesOpen: issues.length,
      issuesCritical: issues.filter((i) => i.severity === 'CRITICAL').length,
      lastAuditAt: lastAudit?.createdAt.toISOString() ?? null,
    },
    issuesPreview,
    events: events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
    jsonLd,
    siteUrl: getSiteUrl(),
  })
}
