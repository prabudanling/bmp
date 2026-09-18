import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { uniqueCategorySlug } from '@/lib/slug'
import type { CategoryDTO } from '@/lib/types'

// GET /api/categories — daftar kategori + jumlah produk
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    })
    const items: CategoryDTO[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      productCount: c._count.products,
    }))
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { error: 'Gagal memuat kategori.' },
      { status: 500 }
    )
  }
}

// POST /api/categories — tambah kategori (admin)
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
        { error: 'Nama kategori wajib diisi.' },
        { status: 400 }
      )
    }

    const exists = await db.category.findFirst({ where: { name } })
    if (exists) {
      return NextResponse.json(
        { error: 'Kategori dengan nama tersebut sudah ada.' },
        { status: 400 }
      )
    }

    const slug = await uniqueCategorySlug(name)
    const category = await db.category.create({
      data: { name, slug, icon: body.icon ? String(body.icon) : 'package' },
    })
    return NextResponse.json(
      { ...category, productCount: 0 },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Gagal menyimpan kategori.' },
      { status: 500 }
    )
  }
}
