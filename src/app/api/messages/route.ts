import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import type { MessageDTO } from '@/lib/types'

// GET /api/messages — daftar pesan (admin)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const unreadOnly = req.nextUrl.searchParams.get('unread') === '1'
    const messages = await db.message.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    const items: MessageDTO[] = messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    }))
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { error: 'Gagal memuat pesan.' },
      { status: 500 }
    )
  }
}

// POST /api/messages — kirim pesan dari form kontak (publik)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Honeypot anti-spam: bot biasanya mengisi field tersembunyi "website"
    if (body.website) {
      return NextResponse.json({ ok: true })
    }

    const name = String(body.name || '').trim()
    const phone = String(body.phone || '').trim()
    const email = String(body.email || '').trim()
    const message = String(body.message || '').trim()

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Nama, nomor telepon, dan pesan wajib diisi.' },
        { status: 400 }
      )
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Pesan terlalu panjang (maksimal 2000 karakter).' },
        { status: 400 }
      )
    }

    await db.message.create({
      data: { name, phone, email: email || null, message },
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengirim pesan. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
