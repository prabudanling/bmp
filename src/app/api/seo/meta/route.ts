import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'
import { getAllMetas } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/** GET /api/seo/meta — semua meta halaman (gabungan default + tersimpan) */
export async function GET(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()
  return NextResponse.json({ items: await getAllMetas() })
}

/** PUT /api/seo/meta — simpan (upsert) meta satu halaman */
export async function PUT(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const body = await req.json()
    const routePath = String(body.routePath || '').trim()
    if (!routePath.startsWith('/')) {
      return NextResponse.json(
        { error: 'routePath harus diawali tanda "/".' },
        { status: 400 }
      )
    }

    const title = String(body.title || '').trim()
    const description = String(body.description || '').trim()
    if (title.length < 10) {
      return NextResponse.json(
        { error: 'Title terlalu pendek (minimal 10 karakter).' },
        { status: 400 }
      )
    }

    const data = {
      title,
      description,
      keywords: String(body.keywords || '').trim(),
      ogImage: String(body.ogImage || '').trim(),
      robots: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'].includes(
        body.robots
      )
        ? body.robots
        : 'index,follow',
      priority: Math.max(0, Math.min(1, Number(body.priority) || 0.5)),
    }

    const row = await db.seoPageMeta.upsert({
      where: { routePath },
      update: data,
      create: { routePath, ...data },
    })

    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'meta.update',
        detail: `Meta "${routePath}" diperbarui`,
      },
    })

    return NextResponse.json({ item: { ...row, updatedAt: row.updatedAt.toISOString() } })
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan meta.' }, { status: 500 })
  }
}

/** DELETE /api/seo/meta?routePath=/katalog — hapus meta tersimpan (kembali ke default) */
export async function DELETE(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  const routePath = req.nextUrl.searchParams.get('routePath')
  if (!routePath) {
    return NextResponse.json({ error: 'routePath wajib diisi.' }, { status: 400 })
  }
  await db.seoPageMeta.deleteMany({ where: { routePath } })
  await db.seoEvent.create({
    data: {
      actor: auth.username,
      action: 'meta.reset',
      detail: `Meta "${routePath}" direset ke default`,
    },
  })
  return NextResponse.json({ ok: true })
}
