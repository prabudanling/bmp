import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// PUT /api/messages/[id] — tandai dibaca / belum dibaca (admin)
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
    const body = await req.json()
    const message = await db.message.update({
      where: { id },
      data: { isRead: !!body.isRead },
    })
    return NextResponse.json({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Gagal memperbarui pesan.' },
      { status: 500 }
    )
  }
}

// DELETE /api/messages/[id] — hapus pesan (admin)
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
    await db.message.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Gagal menghapus pesan.' },
      { status: 500 }
    )
  }
}
