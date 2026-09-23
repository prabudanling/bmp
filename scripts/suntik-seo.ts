/**
 * suntik-seo.ts — Suntikan meta SEO optimal + keyword monitoring ke DB.
 * Target: dominasi pencarian lokal Glodok / Jakarta Barat untuk
 * kompresor & sparepart AC. Idempotent (upsert), aman diulang.
 */
import { PrismaClient } from '@prisma/client'

const META_ROUTES = [
  {
    routePath: '/',
    title: 'Kompresor & Sparepart AC Glodok | Berkat Mandiri Pendingin',
    description:
      'Toko kompresor & sparepart AC original di New Harco Glodok, Jakarta Barat. 1000+ item ready stok: kompresor rotary/scroll, kapasitor, motor fan, freon. Kirim seluruh Indonesia.',
    keywords:
      'toko sparepart AC glodok, jual kompresor AC glodok, kompresor AC jakarta barat, sparepart AC original glodok, toko kompresor pendingin glodok, kapasitor AC original, motor fan AC jakarta, freon AC murah glodok, sparepart AC harco glodok, jual kompresor AC jakarta',
    robots: 'index,follow',
    priority: 1,
  },
  {
    routePath: '/katalog',
    title: 'Katalog 1000+ Sparepart & Kompresor AC Glodok | Harga Grosir',
    description:
      'Katalog lengkap kompresor AC, kapasitor, motor fan, termostat, freon & fitting di Glodok Jakarta Barat. Harga jujur, stok terupdate, pesan mudah via WhatsApp.',
    keywords:
      'katalog sparepart AC, harga kompresor AC, katalog kompresor AC glodok, harga kompresor AC 1 pk, jual kapasitor AC glodok, grosir sparepart AC jakarta, harga freon AC jakarta barat',
    robots: 'index,follow',
    priority: 0.9,
  },
  {
    routePath: '/kontak',
    title: 'Kontak & Lokasi Toko AC Glodok | Berkat Mandiri Pendingin',
    description:
      'Kunjungi toko kami di New Harco Glodok Lantai 1 Blok C 45, Jakarta Barat, atau hubungi Mr. Encep (WA +62 812-5000-3323). Konsultasi part, cek stok, harga grosir.',
    keywords:
      'alamat toko sparepart AC glodok, lokasi toko kompresor AC jakarta barat, kontak sparepart AC glodok, toko AC harco glodok, telp toko sparepart AC jakarta',
    robots: 'index,follow',
    priority: 0.8,
  },
]

/** Keyword prioritas untuk dipantau posisinya di SEO Command Center */
const KEYWORDS = [
  { keyword: 'toko sparepart AC glodok', targetUrl: '/', volume: 210 },
  { keyword: 'jual kompresor AC glodok', targetUrl: '/katalog', volume: 320 },
  { keyword: 'kompresor AC jakarta barat', targetUrl: '/katalog', volume: 480 },
  { keyword: 'sparepart AC harco glodok', targetUrl: '/', volume: 170 },
  { keyword: 'toko kompresor pendingin glodok', targetUrl: '/', volume: 140 },
  { keyword: 'kapasitor AC original glodok', targetUrl: '/katalog', volume: 110 },
  { keyword: 'freon AC murah glodok', targetUrl: '/katalog', volume: 190 },
  { keyword: 'grosir sparepart AC jakarta', targetUrl: '/katalog', volume: 260 },
  { keyword: 'harga kompresor AC 1 pk', targetUrl: '/katalog', volume: 720 },
  { keyword: 'toko AC harco glodok', targetUrl: '/kontak', volume: 150 },
]

const db = new PrismaClient()

async function main() {
  for (const m of META_ROUTES) {
    await db.seoPageMeta.upsert({
      where: { routePath: m.routePath },
      update: { ...m },
      create: { ...m, ogImage: '' },
    })
    console.log(`✓ SeoPageMeta ${m.routePath} = ${m.title}`)
  }

  for (const k of KEYWORDS) {
    const existing = await db.seoKeyword.findUnique({
      where: { keyword: k.keyword },
    })
    if (existing) {
      await db.seoKeyword.update({
        where: { keyword: k.keyword },
        data: { targetUrl: k.targetUrl, volume: k.volume },
      })
      console.log(`• Keyword sudah ada, diperbarui: ${k.keyword}`)
    } else {
      await db.seoKeyword.create({ data: { ...k } })
      console.log(`✓ Keyword baru: ${k.keyword}`)
    }
  }

  await db.seoEvent.create({
    data: {
      actor: 'system',
      action: 'SUNTIK-SEO',
      detail: `Suntikan meta ${META_ROUTES.length} route + ${KEYWORDS.length} keyword lokal Glodok/Jakarta Barat`,
    },
  })
  console.log('Selesai — suntikan SEO tersimpan.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
