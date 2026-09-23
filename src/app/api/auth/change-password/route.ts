import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const admin = await getAdminFromReq(req)
  if (!admin) return unauthorized()

  try {
    const body = await req.json()
    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan baru wajib diisi.' },
        { status: 400 }
      )
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter.' },
        { status: 400 }
      )
    }

    const adminRecord = await db.admin.findUnique({
      where: { id: admin.sub },
    })
    if (!adminRecord) {
      return NextResponse.json(
        { error: 'Akun admin tidak ditemukan.' },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(currentPassword, adminRecord.password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Password lama tidak sesuai.' },
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await db.admin.update({
      where: { id: adminRecord.id },
      data: { password: hash },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah password.' },
      { status: 500 }
    )
  }
}
