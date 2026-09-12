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
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      sub: String(payload.sub || ''),
      username: String(payload.username || ''),
      name: String(payload.name || ''),
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

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
    { status: 401 }
  )
}
