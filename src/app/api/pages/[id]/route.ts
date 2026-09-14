import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq } from '@/lib/auth'
import { slugify } from '@/lib/format'

function unauthorized() {
  return NextResponse.json(
    { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
    { status: 401 }
  )
}

// GET /api/pages/[id] — detail untuk form edit (admin)
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromReq(req)
  if (!admin) return unauthorized()
  const { id } = await ctx.params
  const page = await db.page.findUnique({ where: { id } })
  if (!page) {
    return NextResponse.json({ error: 'Halaman tidak ditemukan.' }, { status: 404 })
  }
  return NextResponse.json(page)
}

// PUT /api/pages/[id] — perbarui halaman (admin)
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromReq(req)
  if (!admin) return unauthorized()

  const { id } = await ctx.params
  try {
    const body = (await req.json()) as Record<string, unknown>
    const existing = await db.page.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan.' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) {
      const title = String(body.title).trim()
      if (!title) {
        return NextResponse.json(
          { error: 'Judul halaman wajib diisi.' },
          { status: 400 }
        )
      }
      data.title = title
    }
    if (body.slug !== undefined) {
      let slug = slugify(String(body.slug) || String(data.title || existing.title))
      if (slug !== existing.slug) {
        const taken = await db.page.findUnique({ where: { slug } })
        if (taken) {
          return NextResponse.json(
            { error: `Slug "${slug}" sudah dipakai halaman lain.` },
            { status: 400 }
          )
        }
      }
      data.slug = slug || existing.slug
    }
    if (body.content !== undefined) data.content = String(body.content)
    if (body.excerpt !== undefined)
      data.excerpt = String(body.excerpt).slice(0, 300)
    if (body.isPublished !== undefined) data.isPublished = !!body.isPublished
    if (body.showInMenu !== undefined) data.showInMenu = !!body.showInMenu
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0

    const page = await db.page.update({ where: { id }, data })
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan halaman.' }, { status: 500 })
  }
}

// DELETE /api/pages/[id] — hapus halaman (admin)
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromReq(req)
  if (!admin) return unauthorized()
  const { id } = await ctx.params
  try {
    await db.page.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus halaman.' }, { status: 500 })
  }
}
