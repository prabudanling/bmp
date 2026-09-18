import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { uniqueCategorySlug } from '@/lib/slug'

type Params = { params: Promise<{ id: string }> }

// PUT /api/categories/[id] — update kategori (admin)
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan.' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const name = String(body.name || '').trim()
    if (!name) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi.' },
        { status: 400 }
      )
    }

    const dup = await db.category.findFirst({
      where: { name, id: { not: id } },
    })
    if (dup) {
      return NextResponse.json(
        { error: 'Kategori dengan nama tersebut sudah ada.' },
        { status: 400 }
      )
    }

    const slug =
      name !== existing.name
        ? await uniqueCategorySlug(name, id)
        : existing.slug

    const category = await db.category.update({
      where: { id },
      data: { name, slug, icon: body.icon ? String(body.icon) : existing.icon },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json(
      { error: 'Gagal memperbarui kategori.' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] — hapus kategori (admin)
export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const count = await db.product.count({ where: { categoryId: id } })
    if (count > 0) {
      return NextResponse.json(
        {
          error: `Tidak bisa menghapus: masih ada ${count} produk di kategori ini. Pindahkan atau hapus produknya terlebih dahulu.`,
        },
        { status: 400 }
      )
    }
    await db.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Gagal menghapus kategori.' },
      { status: 500 }
    )
  }
}
