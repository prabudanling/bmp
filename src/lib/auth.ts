import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const secretString =
  process.env.AUTH_SECRET || 'berkat-mandiri-pendingin-secret-ganti-di-produksi'
const secret = new TextEncoder().encode(secretString)

export const TOKEN_COOKIE = 'bmp_token'
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 hari

export interface TokenPayload {
  sub: string
  username: string
  name: string
  role: 'ADMIN' | 'SEO'
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    const role = String(payload.role || 'ADMIN')
    return {
      sub: String(payload.sub || ''),
      username: String(payload.username || ''),
      name: String(payload.name || ''),
      role: role === 'SEO' ? 'SEO' : 'ADMIN',
    }
  } catch {
    return null
  }
}

export async function getAdminFromReq(
  req: NextRequest
): Promise<TokenPayload | null> {
  const token = req.cookies.get(TOKEN_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Harus login sebagai ADMIN penuh (SEO Analyst VVIP tidak boleh).
 * Dipakai endpoint manajemen toko: produk, kategori, pesan, dll.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<TokenPayload | null> {
  const auth = await getAdminFromReq(req)
  if (!auth || auth.role !== 'ADMIN') return null
  return auth
}

/**
 * Endpoint SEO Command Center: boleh diakses ADMIN dan SEO Analyst.
 */
export async function requireSeoAccess(
  req: NextRequest
): Promise<TokenPayload | null> {
  return getAdminFromReq(req)
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
    { status: 401 }
  )
}

/** 403 khusus role tidak memenuhi syarat */
export function forbidden(): NextResponse {
  return NextResponse.json(
    { error: 'Akses ditolak. Fitur ini hanya untuk ADMIN.' },
    { status: 403 }
  )
}
