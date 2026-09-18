import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { requireAdmin } from '@/lib/auth'
import type { MediaDTO } from '@/lib/types'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads')

function unauthorized() {
  return NextResponse.json(
    { error: 'Tidak memiliki akses. Silakan login terlebih dahulu.' },
    { status: 401 }
  )
}

const IMAGE_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.ico',
  '.avif',
])

async function listDir(rel: string): Promise<MediaDTO[]> {
  const abs = path.join(UPLOAD_ROOT, rel)
  let entries
  try {
    entries = await fs.readdir(abs, { withFileTypes: true })
  } catch {
    return []
  }
  const out: MediaDTO[] = []
  for (const e of entries) {
    if (!e.isFile()) continue
    if (e.name.startsWith('.')) continue
    const full = path.join(abs, e.name)
    try {
      const st = await fs.stat(full)
      const ext = path.extname(e.name).toLowerCase()
      out.push({
        name: e.name,
        url: `/uploads/${rel ? rel + '/' : ''}${e.name}`,
        size: st.size,
        mtime: st.mtime.toISOString(),
        isImage: IMAGE_EXT.has(ext),
      })
    } catch {
      /* file hilang saat dibaca */
    }
  }
  return out
}

// GET /api/media — daftar semua file di folder uploads (admin)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return unauthorized()

  try {
    const [root, products] = await Promise.all([
      listDir(''),
      listDir('products'),
    ])
    const items = [...root, ...products].sort(
      (a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime()
    )
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { error: 'Gagal membaca perpustakaan media.' },
      { status: 500 }
    )
  }
}

// DELETE /api/media?url=/uploads/xxx.png — hapus file (admin)
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return unauthorized()

  try {
    const url = new URL(req.url).searchParams.get('url') || ''
    if (!url.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'URL media tidak valid.' },
        { status: 400 }
      )
    }
    // Cegah path traversal keluar dari folder uploads
    const rel = path.normalize(url.replace('/uploads/', ''))
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      return NextResponse.json(
        { error: 'URL media tidak valid.' },
        { status: 400 }
      )
    }
    const abs = path.join(UPLOAD_ROOT, rel)
    if (!abs.startsWith(UPLOAD_ROOT)) {
      return NextResponse.json(
        { error: 'URL media tidak valid.' },
        { status: 400 }
      )
    }
    await fs.unlink(abs)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Gagal menghapus file (mungkin sudah terhapus).' },
      { status: 500 }
    )
  }
}
