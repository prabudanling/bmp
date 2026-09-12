import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromReq } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromReq(req)
  if (!admin) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({
    user: { id: admin.sub, username: admin.username, name: admin.name },
  })
}
