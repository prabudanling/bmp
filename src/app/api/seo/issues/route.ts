import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SEV_ORDER: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 }
const STATUS_ORDER: Record<string, number> = { OPEN: 0, FIXED: 1, IGNORED: 2 }

function serialize(i: {
  id: string
  type: string
  severity: string
  title: string
  detail: string
  target: string
  status: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...i,
    severity: (SEV_ORDER[i.severity] != null ? i.severity : 'WARNING') as
      | 'CRITICAL'
      | 'WARNING'
      | 'INFO',
    status: (STATUS_ORDER[i.status] != null ? i.status : 'OPEN') as
      | 'OPEN'
      | 'FIXED'
      | 'IGNORED',
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }
}

/** GET /api/seo/issues?status=OPEN — daftar temuan audit */
export async function GET(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  const status = req.nextUrl.searchParams.get('status')
  const rows = await db.seoIssue.findMany({
    where: status ? { status: status.toUpperCase() } : undefined,
    orderBy: { updatedAt: 'desc' },
    take: 200,
  })
  const items = rows
    .map(serialize)
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        SEV_ORDER[a.severity] - SEV_ORDER[b.severity]
    )
  return NextResponse.json({ items })
}

/** PUT /api/seo/issues — ubah status temuan (FIXED / IGNORED / OPEN) */
export async function PUT(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const body = await req.json()
    const id = String(body.id || '')
    const status = String(body.status || '').toUpperCase()
    if (!['OPEN', 'FIXED', 'IGNORED'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 })
    }
    const row = await db.seoIssue.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ error: 'Temuan tidak ditemukan.' }, { status: 404 })
    }
    const updated = await db.seoIssue.update({ where: { id }, data: { status } })
    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'issue.status',
        detail: `"${row.title}" → ${status}`,
      },
    })
    return NextResponse.json({ item: serialize(updated) })
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui temuan.' }, { status: 500 })
  }
}
