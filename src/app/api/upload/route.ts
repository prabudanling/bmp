import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getAdminFromReq } from '@/lib/auth'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 3 * 1024 * 1024 // 3MB

const ALLOWED = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'svg',
  'ico',
  'avif',
])

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function sanitizeName(name: string): string {
  const ext = path.extname(name).toLowerCase()
  const base = path
    .basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'file'}${ext}`
}

// POST /api/upload — unggah gambar (admin) → public/uploads/, balas { url }
export async function POST(req: NextRequest) {
  const admin = await getAdminFromReq(req)
  if (!admin) {
    return bad('Tidak memiliki akses. Silakan login terlebih dahulu.', 401)
  }

  try {
    const form = await req.formData()
    const file = form.get('file')

    if (!file || typeof file === 'string') {
      return bad('Tidak ada file yang dikirim.')
    }

    if (file.size > MAX_SIZE) {
      return bad('File terlalu besar (maksimal 3MB).')
    }

    const ext = path.extname(file.name).toLowerCase().replace('.', '')
    if (!ext || !ALLOWED.has(ext)) {
      return bad(
        'Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, SVG, ICO, atau AVIF.'
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}-${sanitizeName(file.name)}`

    await fs.mkdir(UPLOAD_ROOT, { recursive: true })
    await fs.writeFile(path.join(UPLOAD_ROOT, filename), buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch {
    return bad('Gagal mengunggah file.', 500)
  }
}
