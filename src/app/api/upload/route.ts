import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { getAdminFromReq } from '@/lib/auth'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_SIZE = 3 * 1024 * 1024 // 3MB

// POST /api/upload — upload gambar produk (admin)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromReq(req)
  if (!admin) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan.' },
        { status: 400 }
      )
    }
    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'Format harus JPG, PNG, WEBP, atau GIF.' },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 3MB.' },
        { status: 400 }
      )
    }

    const baseName = slugify(file.name.replace(/\.[^.]+$/, '')).slice(0, 40)
    const filename = `${Date.now()}-${baseName || 'gambar'}.${ext}`
    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    await writeFile(
      path.join(dir, filename),
      Buffer.from(await file.arrayBuffer())
    )

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengunggah gambar.' },
      { status: 500 }
    )
  }
}

// GET /api/upload — hitung jumlah file (tidak dipakai, placeholder)
export async function GET() {
  const count = await db.product.count()
  return NextResponse.json({ ok: true, count })
}
