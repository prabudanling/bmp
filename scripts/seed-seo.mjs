/**
 * seed-seo.mjs — Seed SEO Command Center Super VVIP
 * ============================================================
 * 1. Akun SEO Analyst VVIP: seo.vvip / VvipSeo#2025 (role: SEO)
 * 2. Pastikan akun admin lama ber-role ADMIN
 * 3. Keyword contoh siap pantau
 * 4. Meta beranda tersimpan (agar langsung terindeks rapi)
 *
 * Jalankan: node scripts/seed-seo.mjs  (idempotent)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const VVIP_USERNAME = 'seo.vvip'
const VVIP_PASSWORD = 'VvipSeo#2025'
const VVIP_NAME = 'SEO Analyst VVIP'

async function main() {
  console.log('🔐 Seed SEO Command Center VVIP...')

  // 1. Pastikan admin lama ber-role ADMIN
  await db.admin.updateMany({
    where: { role: { notIn: ['ADMIN', 'SEO'] } },
    data: { role: 'ADMIN' },
  })
  await db.admin.updateMany({
    where: { username: 'admin' },
    data: { role: 'ADMIN' },
  })

  // 2. Buat / perbarui akun VVIP
  const hash = bcrypt.hashSync(VVIP_PASSWORD, 10)
  await db.admin.upsert({
    where: { username: VVIP_USERNAME },
    update: { role: 'SEO', name: VVIP_NAME, password: hash },
    create: {
      username: VVIP_USERNAME,
      password: hash,
      name: VVIP_NAME,
      role: 'SEO',
    },
  })
  console.log(`  ✔ Akun VVIP siap → ${VVIP_USERNAME} / ${VVIP_PASSWORD} (role SEO)`)

  // 3. Keyword contoh
  const sampleKeywords = [
    {
      keyword: 'kompresor AC 1PK original',
      targetUrl: '/katalog',
      volume: 720,
      position: 14,
      history: [
        { d: '2025-01-05T00:00:00.000Z', p: 22 },
        { d: '2025-01-12T00:00:00.000Z', p: 18 },
        { d: '2025-01-19T00:00:00.000Z', p: 14 },
      ],
    },
    {
      keyword: 'jual kapasitor AC jakarta',
      targetUrl: '/katalog',
      volume: 480,
      position: 8,
      history: [
        { d: '2025-01-05T00:00:00.000Z', p: 12 },
        { d: '2025-01-12T00:00:00.000Z', p: 10 },
        { d: '2025-01-19T00:00:00.000Z', p: 8 },
      ],
    },
    {
      keyword: 'sparepart AC terlengkap',
      targetUrl: '/',
      volume: 350,
      position: 6,
      history: [
        { d: '2025-01-05T00:00:00.000Z', p: 9 },
        { d: '2025-01-12T00:00:00.000Z', p: 7 },
        { d: '2025-01-19T00:00:00.000Z', p: 6 },
      ],
    },
    {
      keyword: 'kompresor rotary panasonic',
      targetUrl: '/katalog',
      volume: 260,
      position: 11,
      history: [
        { d: '2025-01-12T00:00:00.000Z', p: 15 },
        { d: '2025-01-19T00:00:00.000Z', p: 11 },
      ],
    },
    { keyword: 'freon R32 original', targetUrl: '/katalog', volume: 890, position: null, history: [] },
    {
      keyword: 'servis kompresor AC terdekat',
      targetUrl: '/kontak',
      volume: 540,
      position: null,
      history: [],
    },
  ]

  for (const k of sampleKeywords) {
    await db.seoKeyword.upsert({
      where: { keyword: k.keyword },
      update: {}, // tidak menimpa data asli bila sudah diedit
      create: {
        keyword: k.keyword,
        targetUrl: k.targetUrl,
        volume: k.volume,
        position: k.position,
        bestPosition: k.position,
        history: JSON.stringify(k.history),
      },
    })
  }
  console.log(`  ✔ ${sampleKeywords.length} keyword contoh siap dipantau`)

  // 4. Meta beranda tersimpan agar langsung maksimal
  await db.seoPageMeta.upsert({
    where: { routePath: '/' },
    update: {},
    create: {
      routePath: '/',
      title: 'Berkat Mandiri Pendingin — Kompresor & Sparepart AC Terlengkap',
      description:
        'Toko spesialis kompresor dan sparepart AC: kompresor rotary & scroll, motor fan, kapasitor, termostat, freon, dan aksesoris AC lainnya. Original, bergaransi, kirim ke seluruh Indonesia.',
      keywords:
        'kompresor AC, sparepart AC, jual kompresor AC, kapasitor AC, motor fan AC, freon AC',
      robots: 'index,follow',
      priority: 1,
    },
  })
  console.log('  ✔ Meta beranda tersimpan')

  // 5. Catat event
  const existing = await db.seoEvent.count()
  if (existing === 0) {
    await db.seoEvent.create({
      data: {
        actor: 'system',
        action: 'seo.init',
        detail: 'SEO Command Center Super VVIP diaktifkan',
      },
    })
  }

  console.log('✅ Seed SEO VVIP selesai.')
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
