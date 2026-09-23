import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { toProductDTO } from '@/lib/product-dto'
import { uniqueProductSlug } from '@/lib/slug'

// GET /api/products — daftar produk dengan filter & paginasi
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const q = sp.get('q')?.trim() || ''
    const category = sp.get('category') || ''
    const featured = sp.get('featured') === '1'
    const exclude = sp.get('exclude') || ''
    const page = Math.max(1, parseInt(sp.get('page') || '1') || 1)
    const limit = Math.min(
      48,
      Math.max(1, parseInt(sp.get('limit') || '12') || 12)
    )
    const sort = sp.get('sort') || 'terbaru'
    const status = sp.get('status') || 'active'

    const admin = await requireAdmin(req)

    const where: Prisma.ProductWhereInput = {}
    if (admin) {
      // Admin boleh memfilter: all | active | inactive
      if (status === 'active') where.isActive = true
      else if (status === 'inactive') where.isActive = false
    } else {
      where.isActive = true
    }
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { sku: { contains: q } },
        { shortDesc: { contains: q } },
        { description: { contains: q } },
      ]
    }
    if (category) where.category = { slug: category }
    if (featured) where.isFeatured = true
    if (exclude) where.id = { not: exclude }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === 'harga-asc'
        ? [{ price: 'asc' }, { createdAt: 'desc' }]
        : sort === 'harga-desc'
          ? [{ price: 'desc' }, { createdAt: 'desc' }]
          : sort === 'nama'
            ? [{ name: 'asc' }]
            : sort === 'populer'
              ? [{ views: 'desc' }, { createdAt: 'desc' }]
              : [{ createdAt: 'desc' }]

    const [total, items] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
    ])

    return NextResponse.json({
      items: items.map(toProductDTO),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch {
    return NextResponse.json({ error: 'Gagal memuat produk.' }, { status: 500 })
  }
}

// POST /api/products — tambah produk baru (admin)
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    if (!name) {
      return NextResponse.json(
        { error: 'Nama produk wajib diisi.' },
        { status: 400 }
      )
    }

    const slug = await uniqueProductSlug(body.slug || name)
    const price =
      body.price === null || body.price === undefined || body.price === ''
        ? null
        : Math.max(0, Math.round(Number(body.price)))
    const stock = Math.max(0, Math.round(Number(body.stock ?? 0)) || 0)

    const product = await db.product.create({
      data: {
        name,
        slug,
        sku: body.sku ? String(body.sku).trim() : null,
        brand: body.brand ? String(body.brand).trim() : null,
        categoryId: body.categoryId || null,
        price,
        unit: body.unit ? String(body.unit) : 'pcs',
        stock,
        shortDesc: body.shortDesc ? String(body.shortDesc).trim() : null,
        description: String(body.description || ''),
        specs: JSON.stringify(Array.isArray(body.specs) ? body.specs : []),
        images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
        isFeatured: !!body.isFeatured,
        isActive: body.isActive === undefined ? true : !!body.isActive,
      },
      include: { category: true },
    })

    return NextResponse.json(toProductDTO(product), { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Gagal menyimpan produk.' },
      { status: 500 }
    )
  }
}
