import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function parseHistory(raw: string): { d: string; p: number }[] {
  try {
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr.slice(-30) : []
  } catch {
    return []
  }
}

function serializeKeyword(k: {
  id: string
  keyword: string
  targetUrl: string
  position: number | null
  bestPosition: number | null
  volume: number
  history: string
  notes: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: k.id,
    keyword: k.keyword,
    targetUrl: k.targetUrl,
    position: k.position,
    bestPosition: k.bestPosition,
    volume: k.volume,
    history: parseHistory(k.history),
    notes: k.notes,
    createdAt: k.createdAt.toISOString(),
    updatedAt: k.updatedAt.toISOString(),
  }
}

/** GET /api/seo/keywords — daftar keyword dipantau */
export async function GET(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()
  const rows = await db.seoKeyword.findMany({ orderBy: { createdAt: 'desc' } })
  const items = rows
    .map(serializeKeyword)
    .sort((a, b) => {
      if (a.position == null && b.position == null) return 0
      if (a.position == null) return 1
      if (b.position == null) return -1
      return a.position - b.position
    })
  return NextResponse.json({ items })
}

/** POST /api/seo/keywords — tambah keyword baru */
export async function POST(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const body = await req.json()
    const keyword = String(body.keyword || '').trim()
    if (keyword.length < 3) {
      return NextResponse.json(
        { error: 'Keyword minimal 3 karakter.' },
        { status: 400 }
      )
    }
    const exists = await db.seoKeyword.findUnique({ where: { keyword } })
    if (exists) {
      return NextResponse.json(
        { error: 'Keyword sudah ada di daftar pantauan.' },
        { status: 409 }
      )
    }

    const position =
      body.position != null && !Number.isNaN(Number(body.position))
        ? Math.max(1, Math.floor(Number(body.position)))
        : null

    const row = await db.seoKeyword.create({
      data: {
        keyword,
        targetUrl: String(body.targetUrl || '/').trim() || '/',
        volume: Math.max(0, Math.floor(Number(body.volume) || 0)),
        notes: String(body.notes || '').trim(),
        position,
        bestPosition: position,
        history: position ? JSON.stringify([{ d: new Date().toISOString(), p: position }]) : '[]',
      },
    })

    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'keyword.add',
        detail: `Keyword baru dipantau: "${keyword}"`,
      },
    })
    return NextResponse.json({ item: serializeKeyword(row) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menambah keyword.' }, { status: 500 })
  }
}

/** PUT /api/seo/keywords — update data / catat posisi terbaru */
export async function PUT(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const body = await req.json()
    const id = String(body.id || '')
    const row = await db.seoKeyword.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ error: 'Keyword tidak ditemukan.' }, { status: 404 })
    }

    const data: {
      keyword?: string
      targetUrl?: string
      volume?: number
      notes?: string
      position?: number | null
      bestPosition?: number | null
      history?: string
    } = {}

    if (body.keyword != null) {
      const kw = String(body.keyword).trim()
      if (kw.length < 3) {
        return NextResponse.json({ error: 'Keyword minimal 3 karakter.' }, { status: 400 })
      }
      data.keyword = kw
    }
    if (body.targetUrl != null) data.targetUrl = String(body.targetUrl).trim() || '/'
    if (body.volume != null) data.volume = Math.max(0, Math.floor(Number(body.volume) || 0))
    if (body.notes != null) data.notes = String(body.notes).trim()

    // Catat posisi terbaru → masuk riwayat
    if (body.position != null && body.position !== '') {
      const pos = Math.max(1, Math.floor(Number(body.position)))
      const history = parseHistory(row.history)
      history.push({ d: new Date().toISOString(), p: pos })
      data.position = pos
      data.history = JSON.stringify(history.slice(-30))
      data.bestPosition =
        row.bestPosition == null ? pos : Math.min(row.bestPosition, pos)
    }

    const updated = await db.seoKeyword.update({ where: { id }, data })
    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'keyword.log',
        detail:
          body.position != null
            ? `Posisi "${row.keyword}" dicatat: ${Number(body.position)}`
            : `Keyword "${row.keyword}" diperbarui`,
      },
    })
    return NextResponse.json({ item: serializeKeyword(updated) })
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui keyword.' }, { status: 500 })
  }
}

/** DELETE /api/seo/keywords?id=... */
export async function DELETE(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id wajib diisi.' }, { status: 400 })
  }
  const row = await db.seoKeyword.delete({ where: { id } }).catch(() => null)
  if (row) {
    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'keyword.delete',
        detail: `Keyword "${row.keyword}" dihapus dari pantauan`,
      },
    })
  }
  return NextResponse.json({ ok: true })
}
