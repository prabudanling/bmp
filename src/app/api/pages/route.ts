import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq } from '@/lib/auth'
import { slugify } from '@/lib/format'

// GET /api/pages — daftar halaman
// Publik: hanya yang terbit. Admin (?all=1): semua termasuk draft.
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const menu = url.searchParams.get('menu')
    const wantAll = url.searchParams.get('all') === '1'

    const where: Record<string, unknown> = {}
    if (menu === '1') {
      where.isPublished = true
      where.showInMenu = true
    } else if (!wantAll) {
      where.isPublished = true
    }
    if (wantAll) {
      const admin = await getAdminFromReq(req)
      if (!admin) {
        return NextResponse.json(
          { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
          { status: 401 }
        )
      }
    }

    const items = await db.page.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('[pages GET]', e)
    return NextResponse.json(
      { error: 'Gagal memuat daftar halaman.' },
      { status: 500 }
    )
  }
}

// POST /api/pages — buat halaman baru (admin)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromReq(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const title = String(body.title || '').trim()
    if (!title) {
      return NextResponse.json(
        { error: 'Judul halaman wajib diisi.' },
        { status: 400 }
      )
    }

    let slug = slugify(String(body.slug || '') || title)
    if (!slug) slug = `halaman-${Date.now()}`

    // Cegah slug bentrok — tambahkan angka di belakang bila perlu
    const exists = await db.page.findUnique({ where: { slug } })
    if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

    const page = await db.page.create({
      data: {
        title,
        slug,
        content: String(body.content || ''),
        excerpt: String(body.excerpt || '').slice(0, 300),
        isPublished: body.isPublished === undefined ? true : !!body.isPublished,
        showInMenu: !!body.showInMenu,
        sortOrder: Number(body.sortOrder) || 0,
      },
    })
    return NextResponse.json(page, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Gagal membuat halaman.' },
      { status: 500 }
    )
  }
}
