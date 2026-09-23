import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { toProductDTO } from '@/lib/product-dto'

type Params = { params: Promise<{ id: string }> }

async function findProduct(idOrSlug: string) {
  return db.product.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: { category: true },
  })
}

// GET /api/products/[id] — detail produk (id atau slug). ?view=1 untuk hit views
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    if (req.nextUrl.searchParams.get('view') === '1') {
      await db.product
        .updateMany({
          where: { OR: [{ id }, { slug: id }] },
          data: { views: { increment: 1 } },
        })
        .catch(() => null)
    }
    const product = await findProduct(id)
    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan.' },
        { status: 404 }
      )
    }
    return NextResponse.json(toProductDTO(product))
  } catch {
    return NextResponse.json(
      { error: 'Gagal memuat detail produk.' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] — update produk (admin)
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
    const existing = await findProduct(id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan.' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const name =
      body.name !== undefined ? String(body.name).trim() : existing.name
    if (!name) {
      return NextResponse.json(
        { error: 'Nama produk wajib diisi.' },
        { status: 400 }
      )
    }

    const price =
      body.price === null || body.price === undefined || body.price === ''
        ? null
        : Math.max(0, Math.round(Number(body.price)))

    const product = await db.product.update({
      where: { id: existing.id },
      data: {
        name,
        sku:
          body.sku !== undefined
            ? body.sku
              ? String(body.sku).trim()
              : null
            : existing.sku,
        brand:
          body.brand !== undefined
            ? body.brand
              ? String(body.brand).trim()
              : null
            : existing.brand,
        categoryId:
          body.categoryId !== undefined
            ? body.categoryId || null
            : existing.categoryId,
        price,
        unit: body.unit !== undefined ? String(body.unit) : existing.unit,
        stock:
          body.stock !== undefined
            ? Math.max(0, Math.round(Number(body.stock)) || 0)
            : existing.stock,
        shortDesc:
          body.shortDesc !== undefined
            ? body.shortDesc
              ? String(body.shortDesc).trim()
              : null
            : existing.shortDesc,
        description:
          body.description !== undefined
            ? String(body.description)
            : existing.description,
        specs:
          body.specs !== undefined
            ? JSON.stringify(Array.isArray(body.specs) ? body.specs : [])
            : existing.specs,
        images:
          body.images !== undefined
            ? JSON.stringify(Array.isArray(body.images) ? body.images : [])
            : existing.images,
        isFeatured:
          body.isFeatured !== undefined
            ? !!body.isFeatured
            : existing.isFeatured,
        isActive:
          body.isActive !== undefined ? !!body.isActive : existing.isActive,
      },
      include: { category: true },
    })

    return NextResponse.json(toProductDTO(product))
  } catch {
    return NextResponse.json(
      { error: 'Gagal memperbarui produk.' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] — hapus produk (admin)
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
    const existing = await findProduct(id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan.' },
        { status: 404 }
      )
    }
    await db.product.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Gagal menghapus produk.' },
      { status: 500 }
    )
  }
}
