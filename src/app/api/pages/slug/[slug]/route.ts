import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pages/slug/[slug] — halaman terbit berdasarkan slug (publik)
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params
  try {
    const page = await db.page.findUnique({
      where: { slug: decodeURIComponent(slug) },
    })
    if (!page || !page.isPublished) {
      return NextResponse.json(
        { error: 'Halaman tidak ditemukan.' },
        { status: 404 }
      )
    }
    // Hitung kunjungan (abaikan kegagalan)
    db.page
      .update({ where: { id: page.id }, data: { views: { increment: 1 } } })
      .catch(() => {})
    return NextResponse.json(page)
  } catch {
    return NextResponse.json(
      { error: 'Gagal memuat halaman.' },
      { status: 500 }
    )
  }
}
