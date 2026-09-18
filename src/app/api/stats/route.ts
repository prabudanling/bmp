import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { toProductDTO } from '@/lib/product-dto'
import type { MessageDTO, StatsDTO } from '@/lib/types'

// GET /api/stats — ringkasan dashboard (admin)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const [
      productTotal,
      productActive,
      categoryTotal,
      unreadMessages,
      viewsAgg,
      lowStock,
      recentMessages,
      recentProductsRaw,
    ] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
      db.category.count(),
      db.message.count({ where: { isRead: false } }),
      db.product.aggregate({ _sum: { views: true } }),
      db.product.findMany({
        where: { isActive: true, stock: { lte: 3 } },
        orderBy: { stock: 'asc' },
        take: 5,
        select: { id: true, name: true, stock: true, images: true },
      }),
      db.message.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      db.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { category: true },
      }),
    ])

    const stats: StatsDTO = {
      productTotal,
      productActive,
      categoryTotal,
      unreadMessages,
      totalViews: viewsAgg._sum.views || 0,
      lowStock: lowStock.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        images: JSON.parse(p.images || '[]'),
      })),
      recentMessages: recentMessages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })) as MessageDTO[],
      recentProducts: recentProductsRaw.map(toProductDTO),
    }

    return NextResponse.json(stats)
  } catch {
    return NextResponse.json(
      { error: 'Gagal memuat ringkasan.' },
      { status: 500 }
    )
  }
}
