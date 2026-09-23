import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/seo/ai-meta — Generator Meta bertenaga AI (GLM).
 * Body: { routePath: string, catatan?: string }
 * Return: { title, description, keywords, alasan }
 */
export async function POST(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const body = await req.json().catch(() => ({}))
    const routePath = String(body.routePath || '/').slice(0, 120)
    const catatan = String(body.catatan || '').slice(0, 300)

    // Kumpulkan konteks toko nyata agar hasil AI relevan
    const [settings, categories, topProducts] = await Promise.all([
      db.setting.findMany(),
      db.category.findMany({ take: 8, select: { name: true } }),
      db.product.findMany({
        where: { isActive: true },
        orderBy: { views: 'desc' },
        take: 8,
        select: { name: true },
      }),
    ])
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    const storeName = map.storeName?.trim() || 'Berkat Mandiri Pendingin'
    const tagline = map.tagline?.trim() || 'Spesialis Kompresor & Sparepart AC'

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'Kamu SEO copywriter senior spesialis toko sparepart & kompresor AC Indonesia. ' +
            'Tugasmu menulis meta tag yang membuat orang mengklik di hasil pencarian Google. ' +
            'JAWAB HANYA dengan JSON valid tanpa teks lain, format: ' +
            '{"title":"...","description":"...","keywords":"...","alasan":"..."}',
        },
        {
          role: 'user',
          content:
            `Buatkan meta tag untuk halaman "${routePath}" milik toko "${storeName}" (${tagline}).\n` +
            `Kategori yang dijual: ${categories.map((c) => c.name).join(', ') || '-'}.\n` +
            `Produk terpopuler: ${topProducts.map((p) => p.name).join(', ') || '-'}.\n` +
            (catatan ? `Catatan tambahan dari analis: ${catatan}\n` : '') +
            `ATURAN WAJIB:\n` +
            `- title: 40-60 karakter, mengandung nama toko atau kata kunci utama, ada daya jual (mis. "Original", "Bergaransi", "Termurah")\n` +
            `- description: 130-155 karakter, bahasa Indonesia menjual, ada ajakan bertindak (mis. "Pesan sekarang")\n` +
            `- keywords: 5-7 kata kunci dipisah koma, campuran umum + spesifik\n` +
            `- alasan: 1 kalimat penjelasan strategi (bahasa Indonesia)`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    let raw = completion.choices[0]?.message?.content || ''
    // Bersihkan kemungkinan bungkus markdown
    raw = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()

    let parsed: {
      title?: string
      description?: string
      keywords?: string
      alasan?: string
    }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'AI memberi jawaban tidak terduga. Coba sekali lagi ya.' },
        { status: 502 }
      )
    }

    const title = String(parsed.title || '').trim()
    const description = String(parsed.description || '').trim()
    const keywords = String(parsed.keywords || '').trim()
    if (title.length < 10 || description.length < 50) {
      return NextResponse.json(
        { error: 'Hasil AI terlalu pendek. Silakan coba lagi.' },
        { status: 502 }
      )
    }

    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'ai.meta',
        detail: `AI membuat meta untuk "${routePath}"`,
      },
    })

    return NextResponse.json({
      title,
      description,
      keywords,
      alasan: String(parsed.alasan || '').trim(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Layanan AI sedang sibuk. Coba lagi beberapa saat.' },
      { status: 500 }
    )
  }
}
