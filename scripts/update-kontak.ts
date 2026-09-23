/**
 * update-kontak.ts — Sinkronisasi kontak & alamat toko (Task: ganti kontak person)
 * Data sumber: permintaan pemilik (Mr. Encep Sihabudin) — 24 Sep 2026
 * Idempotent: upsert per key, aman dijalankan berulang.
 */
import { PrismaClient } from '@prisma/client'

const KONTAK_BARU: Record<string, string> = {
  contactPerson: 'Mr. Encep Sihabudin',
  whatsapp: '+62 812-5000-3323', // waDigits() → 6281250003323 untuk link wa.me
  phone: '(021) 22682617',
  email: 'berkatmandiripendingin@gmail.com',
  address:
    'Jalan Hayam Wuruk No.2 - 5 Gedung New Harco Glodok Lantai 1 Blok C 45, Jakarta Barat, DKI Jakarta, Indonesia, 11180',
}

const db = new PrismaClient()

async function main() {
  for (const [key, value] of Object.entries(KONTAK_BARU)) {
    await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    console.log(`✓ ${key} = ${value}`)
  }
  console.log('Selesai — kontak toko diperbarui.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
