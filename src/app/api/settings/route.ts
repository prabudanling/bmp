import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq } from '@/lib/auth'
import { DEFAULT_SETTINGS } from '@/lib/settings'
import type { StoreSettings } from '@/lib/types'

// GET /api/settings — pengaturan toko (publik)
export async function GET() {
  try {
    const rows = await db.setting.findMany()
    const map: Record<string, string> = { ...DEFAULT_SETTINGS }
    for (const row of rows) map[row.key] = row.value
    return NextResponse.json(map as StoreSettings)
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

// PUT /api/settings — simpan pengaturan toko (admin)
export async function PUT(req: NextRequest) {
  const admin = await getAdminFromReq(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof StoreSettings)[]
    for (const key of keys) {
      if (body[key] !== undefined) {
        const value = String(body[key]).trim()
        await db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      }
    }
    const rows = await db.setting.findMany()
    const map: Record<string, string> = { ...DEFAULT_SETTINGS }
    for (const row of rows) map[row.key] = row.value
    return NextResponse.json(map as StoreSettings)
  } catch {
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan.' },
      { status: 500 }
    )
  }
}
