import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'
import { countSitemapUrls, DEFAULT_ROUTES } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * POST /api/seo/audit — jalankan audit penuh atas website:
 * konten produk, meta halaman, kategori kosong, sitemap, keyword.
 * Semua temuan OPEN lama diganti dengan hasil audit terbaru.
 */
export async function POST(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const [products, categories, pages, metas, keywords] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, description: true, shortDesc: true, images: true },
      }),
      db.category.findMany({ select: { id: true, name: true, slug: true } }),
      db.page.findMany({ select: { id: true, title: true, slug: true, isPublished: true } }),
      db.seoPageMeta.findMany(),
      db.seoKeyword.findMany({ select: { keyword: true, position: true } }),
    ])

    type NewIssue = {
      type: string
      severity: 'CRITICAL' | 'WARNING' | 'INFO'
      title: string
      detail: string
      target: string
    }
    const findings: NewIssue[] = []

    // ── 1. Konten produk ────────────────────────────────────────
    for (const p of products) {
      const desc = (p.description || '').trim()
      if (!desc) {
        findings.push({
          type: 'missing-desc',
          severity: 'CRITICAL',
          title: `Deskripsi kosong: ${p.name}`,
          detail:
            'Produk aktif tanpa deskripsi sangat sulit muncul di Google. Tulis minimal 80 karakter berisi keunggulan, kompatibilitas, dan kata kunci.',
          target: `/produk/${p.slug}`,
        })
      } else if (desc.length < 80) {
        findings.push({
          type: 'thin-content',
          severity: 'WARNING',
          title: `Konten tipis (${desc.length} karakter): ${p.name}`,
          detail:
            'Deskripsi di bawah 80 karakter dianggap "thin content". Perkaya dengan spesifikasi, keunggulan, dan varian.',
          target: `/produk/${p.slug}`,
        })
      }
      let imgCount = 0
      try {
        imgCount = (JSON.parse(p.images || '[]') as string[]).length
      } catch {
        imgCount = 0
      }
      if (imgCount === 0) {
        findings.push({
          type: 'no-image',
          severity: 'WARNING',
          title: `Tanpa foto: ${p.name}`,
          detail:
            'Produk tanpa gambar tidak tampil di pencarian gambar Google dan menurunkan kepercayaan pembeli.',
          target: `/produk/${p.slug}`,
        })
      }
      if (!p.shortDesc || !p.shortDesc.trim()) {
        findings.push({
          type: 'missing-shortdesc',
          severity: 'INFO',
          title: `Ringkasan singkat kosong: ${p.name}`,
          detail:
            'Short description tampil di kartu produk dan snippet sosial media. Isi 1 kalimat menarik.',
          target: `/produk/${p.slug}`,
        })
      }
    }

    // ── 2. Kategori kosong ──────────────────────────────────────
    const productCatIds = new Set(
      (await db.product.findMany({ where: { isActive: true }, select: { categoryId: true } })).map(
        (p) => p.categoryId
      )
    )
    for (const c of categories) {
      if (!productCatIds.has(c.id)) {
        findings.push({
          type: 'empty-category',
          severity: 'WARNING',
          title: `Kategori kosong: ${c.name}`,
          detail:
            'Kategori tanpa produk menghasilkan halaman hampa yang melemahkan struktur internal link. Isi produknya atau nonaktifkan.',
          target: `/katalog?category=${c.slug}`,
        })
      }
    }

    // ── 3. Meta halaman utama ───────────────────────────────────
    for (const d of DEFAULT_ROUTES) {
      const row = metas.find((m) => m.routePath === d.routePath)
      const title = row?.title?.trim() || ''
      const desc = row?.description?.trim() || ''
      if (title.length < 20) {
        findings.push({
          type: 'meta-title',
          severity: 'WARNING',
          title: `Title meta lemah: ${d.routePath}`,
          detail:
            'Title adalah sinyal Google terkuat. Pastikan 30-60 karakter, memuat kata kunci utama, dan menjual.',
          target: d.routePath,
        })
      }
      if (desc.length < 70) {
        findings.push({
          type: 'meta-desc',
          severity: 'WARNING',
          title: `Meta description lemah: ${d.routePath}`,
          detail:
            'Description 120-160 karakter meningkatkan CTR di hasil pencarian. Jelaskan keunggulan + ajakan bertindak.',
          target: d.routePath,
        })
      }
    }

    // ── 4. Halaman CMS draft ────────────────────────────────────
    for (const pg of pages) {
      if (!pg.isPublished) {
        findings.push({
          type: 'draft-page',
          severity: 'INFO',
          title: `Halaman masih draft: ${pg.title}`,
          detail:
            'Halaman yang sudah matang sebaiknya dipublikasikan agar bisa terindeks dan memperluas jangkauan kata kunci.',
          target: `/p/${pg.slug}`,
        })
      }
    }

    // ── 5. Keyword tanpa data posisi ────────────────────────────
    const noPos = keywords.filter((k) => k.position == null)
    if (keywords.length > 0 && noPos.length > 0) {
      findings.push({
        type: 'keyword-no-data',
        severity: 'INFO',
        title: `${noPos.length} keyword belum dicatat posisinya`,
        detail: `Contoh: ${noPos
          .slice(0, 3)
          .map((k) => `"${k.keyword}"`)
          .join(', ')}. Cek posisi di Google (mode incognito) lalu catat di tab Keywords.`,
        target: '/admin/seo',
      })
    }

    // ── 6. Sitemap & skala ──────────────────────────────────────
    const sitemapUrls = await countSitemapUrls()
    if (sitemapUrls < 8) {
      findings.push({
        type: 'sitemap-small',
        severity: 'WARNING',
        title: `Sitemap baru berisi ${sitemapUrls} URL`,
        detail:
          'Situs internasional biasanya punya puluhan URL terindeks. Tambah produk dan halaman informatif secara rutin.',
        target: '/sitemap.xml',
      })
    }

    // Ganti semua temuan OPEN dengan hasil audit terbaru
    await db.seoIssue.deleteMany({ where: { status: 'OPEN' } })
    if (findings.length > 0) {
      await db.seoIssue.createMany({ data: findings })
    }

    const critical = findings.filter((f) => f.severity === 'CRITICAL').length
    const warning = findings.filter((f) => f.severity === 'WARNING').length
    const info = findings.filter((f) => f.severity === 'INFO').length

    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'audit.run',
        detail: `Audit selesai: ${findings.length} temuan (${critical} kritis, ${warning} peringatan, ${info} info)`,
      },
    })

    return NextResponse.json({
      total: findings.length,
      critical,
      warning,
      info,
      checkedProducts: products.length,
      checkedCategories: categories.length,
      checkedPages: pages.length,
    })
  } catch {
    return NextResponse.json({ error: 'Audit gagal dijalankan.' }, { status: 500 })
  }
}
