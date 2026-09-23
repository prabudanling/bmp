/**
 * Seed logo merek ke Setting.partnerLogos (mengganti data demo lama).
 * Sumber: public/logos/brands/manifest.json
 * Jalankan: bun scripts/seed-brand-logos.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const manifest = JSON.parse(
  readFileSync(join(process.cwd(), 'public', 'logos', 'brands', 'manifest.json'), 'utf8')
)

const value = JSON.stringify(
  manifest.map((m) => ({ url: m.url, name: m.name }))
)

await db.setting.upsert({
  where: { key: 'partnerLogos' },
  update: { value },
  create: { key: 'partnerLogos', value },
})

console.log(`✔ Setting 'partnerLogos' diperbarui dengan ${manifest.length} logo merek.`)
await db.$disconnect()
