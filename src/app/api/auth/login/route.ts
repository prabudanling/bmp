import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { TOKEN_COOKIE, TOKEN_MAX_AGE, signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = String(body.username || '').trim()
    const password = String(body.password || '')

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      )
    }

    const admin = await db.admin.findUnique({ where: { username } })
    if (!admin) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      )
    }

    const token = await signToken({
      sub: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role === 'SEO' ? 'SEO' : 'ADMIN',
    })

    const res = NextResponse.json({
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role === 'SEO' ? 'SEO' : 'ADMIN',
      },
    })
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_MAX_AGE,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login.' },
      { status: 500 }
    )
  }
}
