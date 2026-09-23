import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { getAdminFromReq, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/seo/ai-keywords — Riset keyword bertenaga AI (GLM).
 * Body: { seed: string } — kata kunci induk, mis. "kompresor AC"
 * Return: { items: [{ keyword, intent, reason }] }
 */
export async function POST(req: NextRequest) {
  const auth = await getAdminFromReq(req)
  if (!auth) return unauthorized()

  try {
    const body = await req.json().catch(() => ({}))
    const seed = String(body.seed || '').trim().slice(0, 120)
    if (seed.length < 3) {
      return NextResponse.json(
        { error: 'Tulis kata kunci induk minimal 3 karakter.' },
        { status: 400 }
      )
    }

    const categories = await db.category.findMany({
      take: 8,
      select: { name: true },
    })

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'Kamu konsultan SEO senior untuk pasar Indonesia spesialis produk kompresor & sparepart AC. ' +
            'Tugasmu mencari ide keyword lokal yang benar-benar diketik orang Indonesia di Google. ' +
            'JAWAB HANYA dengan JSON valid tanpa teks lain, format: ' +
            '{"items":[{"keyword":"...","intent":"TRANSAKSIONAL|INFORMASI|NAVIGASI","reason":"..."}]}',
        },
        {
          role: 'user',
          content:
            `Kata kunci induk: "${seed}".\n` +
            `Kategori toko: ${categories.map((c) => c.name).join(', ') || '-'}.\n` +
            `Buat 8 ide keyword: campuran long-tail transaksional (mis. "jual ... murah", "... harga"), ` +
            `varian lokal Indonesia (mis. "... Jakarta", "... terdekat"), dan 1-2 informasional. ` +
            `reason = 1 kalimat pendek bahasa Indonesia menjelaskan peluangnya.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    let raw = completion.choices[0]?.message?.content || ''
    raw = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()

    let parsed: {
      items?: { keyword?: string; intent?: string; reason?: string }[]
    }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'AI memberi jawaban tidak terduga. Coba sekali lagi ya.' },
        { status: 502 }
      )
    }

    const items = (parsed.items || [])
      .map((k) => ({
        keyword: String(k.keyword || '').trim(),
        intent: ['TRANSAKSIONAL', 'INFORMASI', 'NAVIGASI'].includes(
          String(k.intent || '').toUpperCase()
        )
          ? String(k.intent).toUpperCase()
          : 'TRANSAKSIONAL',
        reason: String(k.reason || '').trim(),
      }))
      .filter((k) => k.keyword.length >= 3)
      .slice(0, 8)

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'AI belum menemukan ide. Coba kata kunci induk lain.' },
        { status: 502 }
      )
    }

    await db.seoEvent.create({
      data: {
        actor: auth.username,
        action: 'ai.keywords',
        detail: `AI menelurkan ${items.length} ide keyword dari "${seed}"`,
      },
    })

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { error: 'Layanan AI sedang sibuk. Coba lagi beberapa saat.' },
      { status: 500 }
    )
  }
}
