/**
 * SEED 1000 PRODUK — Berkat Mandiri Pendingin
 * =============================================
 * Mengisi katalog hingga total 1000 produk (produk existing tetap dipertahankan)
 * dengan gambar asli hasil pencarian internet (scripts/imgsearch/image-map.json).
 *
 * Jalankan: bun scripts/seed-1000.ts
 * Aman dijalankan ulang: slug yang sudah ada dilewati, target total selalu 1000.
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const db = new PrismaClient()
const TARGET_TOTAL = 1000

/* ================= UTIL ================= */

let seedNum = 42
function rand(): number {
  // LCG deterministik — hasil stabil antar-run
  seedNum = (seedNum * 1103515245 + 12345) % 2147483648
  return seedNum / 2147483648
}
const ri = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/* ============ KATEGORI (13) ============ */

const CATEGORIES = [
  { slug: 'kompresor-ac', name: 'Kompresor AC Split & Cassette', icon: 'cog' },
  { slug: 'kompresor-kulkas', name: 'Kompresor Kulkas & Freezer', icon: 'snowflake' },
  { slug: 'kompresor-mobil', name: 'Kompresor AC Mobil', icon: 'zap' },
  { slug: 'kompresor-industri', name: 'Kompresor Komersial & Industri', icon: 'layers' },
  { slug: 'kompresor-angin', name: 'Kompresor Angin / Piston', icon: 'gauge' },
  { slug: 'motor-fan', name: 'Motor & Fan', icon: 'fan' },
  { slug: 'kapasitor', name: 'Kapasitor', icon: 'battery-charging' },
  { slug: 'termostat-sensor', name: 'Termostat & Sensor', icon: 'thermometer' },
  { slug: 'freon-gas', name: 'Freon & Gas', icon: 'wind' },
  { slug: 'fitting-aksesoris', name: 'Fitting & Aksesoris', icon: 'wrench' },
  { slug: 'sparepart-kompresor', name: 'Sparepart Kompresor', icon: 'plug' },
  { slug: 'oli-kimia', name: 'Oli & Kimia Pendingin', icon: 'droplets' },
  { slug: 'evaporator-kondensor', name: 'Evaporator & Kondensor', icon: 'filter' },
]

/* ============ POOL GAMBAR ============ */

const POOLS: Record<string, string[]> = (() => {
  const f = join(process.cwd(), 'scripts/imgsearch/image-map.json')
  if (existsSync(f)) {
    try {
      return JSON.parse(readFileSync(f, 'utf8'))
    } catch {
      /* fallback di bawah */
    }
  }
  return {}
})()

const CAT_POOLS: Record<string, string[]> = {
  'kompresor-ac': ['kompresor-rotary', 'kompresor-scroll'],
  'kompresor-kulkas': ['kompresor-kulkas'],
  'kompresor-mobil': ['kompresor-mobil'],
  'kompresor-industri': ['kompresor-industri'],
  'kompresor-angin': ['kompresor-angin'],
  'motor-fan': ['motor-fan', 'motor-outdoor'],
  kapasitor: ['kapasitor'],
  'termostat-sensor': ['termostat'],
  'freon-gas': ['freon'],
  'fitting-aksesoris': ['fitting-tembaga', 'filter-dryer', 'manifold'],
  'sparepart-kompresor': ['relay-overload', 'kompresor-rotary'],
  'oli-kimia': ['oli'],
  'evaporator-kondensor': ['evaporator', 'kondensor'],
}

const FALLBACK_IMGS = [
  '/uploads/kompresor.png',
  '/uploads/kapasitor.png',
  '/uploads/fan-motor.png',
  '/uploads/freon.png',
]

let globalIdx = 0
function imgsFor(cat: string): string[] {
  const poolNames = CAT_POOLS[cat] || []
  const pool = poolNames.flatMap((p) => POOLS[p] || [])
  if (pool.length === 0) return [FALLBACK_IMGS[globalIdx % FALLBACK_IMGS.length]]
  const n = pool.length
  const take = Math.min(3, n)
  const out: string[] = []
  for (let i = 0; i < take; i++) out.push('/uploads/' + pool[(globalIdx + i) % n])
  return out
}

/* ============ TEMPLATE DESKRIPSI ============ */

const GARANSI = [
  'Garansi resmi 6 bulan untuk penggantian unit (bukan sewa mesin).',
  'Garansi tukar unit 1x24 jam jika ada kerusakan pabrik saat barang diterima.',
  'Garansi resmi 3 bulan dan barang 100% original, bukan rekondisi.',
]

const KIRIM = [
  'Pengiriman aman dengan packing bubble wrap + kayu untuk luar kota; order sebelum jam 15.00 kirim hari yang sama.',
  'Siap kirim ke seluruh Indonesia via ekspedisi terpercaya; area Jakarta Timur bisa COD dan dipasang oleh teknisi kami.',
  'Stok selalu tersedia, kirim instan dari gudang Jakarta Timur. Bisa juga ambil langsung di toko.',
]

function descKompresor(brand: string, kap: string, ref: string, jenis: string, aplikasi: string): string {
  const intro = [
    `${jenis} ${brand} ${kap} merupakan jantung utama sistem pendinginan yang berfungsi memompa refrigerant ${ref} dalam siklus kompresi. Produk baru 100% original, bukan rekondisi, sehingga performa pendinginan maksimal dan lebih hemat listrik.`,
    `${jenis} ${brand} ${kap} ini adalah pilihan terbaik untuk penggantian unit rusak. Dibuat dengan standar pabrikan asli ${brand}: suara halus, getaran minimal, dan umur pakai panjang.`,
    `Kami menjual ${jenis.toLowerCase()} ${brand} ${kap} original dengan kualitas terjamin. Setiap unit telah melalui uji tekanan dan vakum sebelum dikirim agar sampai di tangan Anda dalam kondisi prima.`,
  ][Math.floor(rand() * 3)]
  return `${intro}\n\nCocok digunakan untuk ${aplikasi}. Setiap pengiriman dilengkapi plug pengaman dan dikemas dengan standar packing khusus agar komponen internal tidak bergeser selama perjalanan.\n\n${GARANSI[Math.floor(rand() * GARANSI.length)]}\n\nPenting: pemasangan sebaiknya dilakukan oleh teknisi berpengalaman dengan vacuum pump minimal 30 menit dan flushing nitrogen agar kotoran dalam sirkulasi terbuang — sehingga keawetan kompresor terjaga.\n\n${KIRIM[Math.floor(rand() * KIRIM.length)]}`
}

function descGeneric(nama: string, fungsi: string, aplikasi: string): string {
  const intro = [
    `${nama} merupakan ${fungsi} yang wajib tersedia di setiap bengkel dan toko sparepart pendingin. Kualitas original dengan material pilihan sehingga tahan lama.`,
    `${nama} — komponen penting untuk ${aplikasi}. Produk yang kami jual sudah terseleksi dan teruji, siap pakai tanpa perlu modifikasi.`,
    `Sedang mencari ${nama.toLowerCase()} yang berkualitas? Produk ini jawabannya: presisi bagus, material kuat, dan harga bersahabat untuk tukang maupun pembelian grosir.`,
  ][Math.floor(rand() * 3)]
  return `${intro}\n\nAplikasi: ${aplikasi}.\n\n${GARANSI[Math.floor(rand() * GARANSI.length)]}\n\n${KIRIM[Math.floor(rand() * KIRIM.length)]}\n\nDapatkan harga grosir untuk pembelian dalam jumlah banyak — silakan hubungi kami via WhatsApp untuk penawaran terbaik.`
}

/* ============ GENERATOR PRODUK ============ */

type Gen = {
  name: string
  slug: string
  sku: string
  brand: string
  categoryId: string
  price: number | null
  unit: string
  stock: number
  shortDesc: string
  description: string
  specs: string
  images: string
  isFeatured: boolean
  isActive: boolean
  views: number
}

type Item = {
  name: string
  cat: string
  code: string
  sku: string
  brand: string
  price: number | null
  unit: string
  shortDesc: string
  description: string
  specs: { k: string; v: string }[]
}

function build(it: Item, catId: string, slugSet: Set<string>): Gen {
  let slug = slugify(it.name)
  if (slugSet.has(slug)) slug = `${slug}-${it.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  if (slugSet.has(slug)) slug = `${slug}-${ri(100, 999)}`
  slugSet.add(slug)
  globalIdx++
  const stock = rand() < 0.06 ? 0 : ri(3, 60)
  return {
    name: it.name,
    slug,
    sku: it.sku,
    brand: it.brand,
    categoryId: catId,
    price: it.price,
    unit: it.unit,
    stock,
    shortDesc: it.shortDesc,
    description: it.description,
    specs: JSON.stringify(it.specs),
    images: JSON.stringify(imgsFor(it.cat)),
    isFeatured: globalIdx % 20 === 1,
    isActive: true,
    views: ri(0, 380),
  }
}

const specsOf = (pairs: [string, string][]) => pairs.map(([k, v]) => ({ k, v }))

function* genSemua(): Generator<Item> {
  let no = 0
  const sku = (p: string, b: string) =>
    `${p}-${b.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'GEN'}-${String(++no).padStart(4, '0')}`
  const hargaMap = (base: number) => Math.round((base + ri(0, 12) * 5000) / 1000) * 1000

  /* ---------- 1. KOMPRESOR AC SPLIT (20×9 = 180) ---------- */
  const brandsAC = ['Daikin', 'Panasonic', 'LG', 'Gree', 'Sharp', 'Mitsubishi Electric', 'Samsung', 'Toshiba', 'Hitachi', 'Sanyo', 'Midea', 'TCL', 'Changhong', 'Aqua', 'Polytron', 'Hisense', 'Haier', 'Electrolux', 'Denpatsu', 'Kulthorn']
  const pks = ['1/2', '3/4', '1', '1.5', '2', '2.5', '3', '4', '5']
  const priceAC: Record<string, number> = { '1/2': 1150000, '3/4': 1450000, '1': 1850000, '1.5': 2450000, '2': 3200000, '2.5': 4450000, '3': 5350000, '4': 7250000, '5': 8950000 }
  for (const b of brandsAC) {
    for (const pk of pks) {
      const besar = pk === '2.5' || pk === '3' || pk === '4' || pk === '5'
      const jenis = besar ? 'Kompresor Scroll' : 'Kompresor Rotary'
      const ref = besar ? 'R410A / R32' : rand() < 0.5 ? 'R32' : 'R410A'
      const model = `${b.slice(0, 2).toUpperCase()}${ri(100, 999)}${String.fromCharCode(65 + ri(0, 25))}${ri(1, 9)}`
      yield {
        name: `${jenis} ${b} ${pk} PK (${model})`,
        cat: 'kompresor-ac',
        code: model,
        sku: sku('KAC', b),
        brand: b,
        price: hargaMap(priceAC[pk]),
        unit: 'pcs',
        shortDesc: `${jenis} ${b} ${pk} PK original untuk AC split ${ref}. Baru, bergaransi, langsung dingin.`,
        description: descKompresor(b, `${pk} PK`, ref, jenis, `AC split rumah tangga, kantor, ruko, dan ruang server berkapasitas ${pk} PK`),
        specs: specsOf([
          ['Merek', b],
          ['Tipe', `${model} (${besar ? 'Scroll' : 'Rotary'})`],
          ['Kapasitas', `${pk} PK`],
          ['Refrigerant', ref],
          ['Voltase', '220V / 50Hz'],
          ['Aplikasi', 'AC Split & Cassette'],
        ]),
      }
    }
  }

  /* ---------- 2. KOMPRESOR KULKAS & FREEZER (12×7 = 84) ---------- */
  const brandsKulkas = ['Embraco', 'Danfoss', 'LG', 'Matsushita', 'Sanyo', 'Samsung', 'Tecumseh', 'Kulthorn', 'Wanbao', 'Donper', 'Zanussi', 'Frigidaire']
  const kapKulkas = ['1/8', '1/6', '1/5', '1/4', '1/3', '1/2', '3/4']
  const priceKulkas: Record<string, number> = { '1/8': 450000, '1/6': 550000, '1/5': 650000, '1/4': 780000, '1/3': 950000, '1/2': 1250000, '3/4': 1650000 }
  for (const b of brandsKulkas) {
    for (const k of kapKulkas) {
      const lbp = rand() < 0.6
      const model = `${b.slice(0, 2).toUpperCase()}K${ri(1000, 9999)}${String.fromCharCode(75 + ri(0, 10))}`
      yield {
        name: `Kompresor Kulkas ${b} ${k} PK (${model})`,
        cat: 'kompresor-kulkas',
        code: model,
        sku: sku('KKL', b),
        brand: b,
        price: hargaMap(priceKulkas[k]),
        unit: 'pcs',
        shortDesc: `Kompresor kulkas & freezer ${b} ${k} PK ${lbp ? 'LBP (R134a/R600a)' : 'MBP'}, original & bergaransi.`,
        description: descKompresor(b, `${k} PK`, lbp ? 'R134a / R600a' : 'R290 / R404A', 'Kompresor Hermetik', `kulkas 1 pintu, kulkas 2 pintu, showcase, dan chest freezer (${lbp ? 'LBP — tekanan rendah/suhu beku' : 'MBP — tekanan sedang'})`),
        specs: specsOf([
          ['Merek', b],
          ['Tipe', `${model} (Hermetik)`],
          ['Kapasitas', `${k} PK`],
          ['Kelas', lbp ? 'LBP — Low Back Pressure' : 'MBP — Medium Back Pressure'],
          ['Refrigerant', lbp ? 'R134a / R600a' : 'R290 / R404A'],
          ['Voltase', '220V / 50Hz'],
        ]),
      }
    }
  }

  /* ---------- 3. KOMPRESOR AC MOBIL (12×7 = 84) ---------- */
  const brandsMobil = ['Sanden', 'Denso', 'Calsonic', 'Zexel', 'Seltec', 'Mitsubishi', 'Delphi', 'Visteon', 'Behr', 'Valeo', 'Kysor', 'Kenlowe']
  const seriMobil = ['7H13', '5H09', 'SD7V16', '10PA15C', '6SEU12', 'CRS18', 'TRSE07']
  const mobilList = ['Toyota Avanza', 'Daihatsu Xenia', 'Toyota Innova', 'Honda Brio', 'Honda Jazz', 'Suzuki Ertiga', 'Suzuki APV', 'Mitsubishi Pajero', 'Toyota Fortuner', 'Nissan X-Trail', 'Honda CRV', 'Toyota Vios']
  for (const b of brandsMobil) {
    for (let i = 0; i < seriMobil.length; i++) {
      const mobil = mobilList[(i + brandsMobil.indexOf(b)) % mobilList.length]
      const model = seriMobil[i]
      yield {
        name: `Kompresor AC Mobil ${b} ${model} — ${mobil}`,
        cat: 'kompresor-mobil',
        code: model,
        sku: sku('KMB', b),
        brand: b,
        price: Math.round((1250000 + ri(2, 24) * 90000) / 1000) * 1000,
        unit: 'pcs',
        shortDesc: `Kompresor AC mobil ${b} seri ${model}, pas untuk ${mobil}. New original, dingin langsung!`,
        description: descKompresor(b, model, 'R134a', 'Kompresor AC Mobil', `sistem pendingin kabin ${mobil} (refrigerant R134a, belt-driven dengan electromagnetic clutch)`),
        specs: specsOf([
          ['Merek', b],
          ['Seri', model],
          ['Aplikasi', mobil],
          ['Refrigerant', 'R134a'],
          ['Oli', 'PAG 46 (± 80 ml)'],
          ['Clutch', 'Electromagnetic 12V'],
        ]),
      }
    }
  }

  /* ---------- 4. KOMPRESOR KOMERSIAL & INDUSTRI (12×7 = 84) ---------- */
  const brandsInd = ['Copeland', 'Bitzer', 'Maneurop', 'Frascold', 'Dorin', 'Refcomp', 'Bristol', 'Carlyle', 'Trane', 'Carrier', 'Hitachi', 'Mycom']
  const hpInd = ['2', '3', '5', '7', '10', '15', '20']
  const seriInd: Record<string, string> = { Copeland: 'ZB/ZF', Bitzer: '4T/6H', Maneurop: 'MT/MTZ', Frascold: 'A/VRKS', Dorin: '4P/D', Refcomp: 'SP/SR', Bristol: 'H2/H7', Carlyle: '06D/06E', Trane: 'SH/XH', Carrier: '06D/5F', Hitachi: 'E/SM', Mycom: 'N/W' }
  for (const b of brandsInd) {
    for (const hp of hpInd) {
      const seri = seriInd[b] || 'STD'
      const model = `${seri.split('/')[0]}${hp}${ri(10, 99)}`
      const mahal = parseInt(hp) >= 10
      yield {
        name: `Kompresor Semi-Hermetik ${b} ${hp} HP (${model})`,
        cat: 'kompresor-industri',
        code: model,
        sku: sku('KIN', b),
        brand: b,
        price: mahal && rand() < 0.4 ? null : Math.round((8500000 + parseInt(hp) * 2100000 + ri(0, 9) * 100000) / 1000) * 1000,
        unit: 'unit',
        shortDesc: `Kompresor semi-hermetik industri ${b} ${hp} HP untuk showcase, cold storage, dan chiller. Heavy duty.`,
        description: descKompresor(b, `${hp} HP`, 'R404A / R507 / R22', 'Kompresor Semi-Hermetik', `cold storage, ruang pendingin industri, showcase minimarket, ice maker, dan sistem chiller kapasitas ${hp} HP`),
        specs: specsOf([
          ['Merek', b],
          ['Seri', `${seri} — ${model}`],
          ['Kapasitas', `${hp} HP`],
          ['Refrigerant', 'R404A / R507 / R22'],
          ['Pendinginan', 'Udara / suksi'],
          ['Aplikasi', 'Komersial & Industri'],
        ]),
      }
    }
  }

  /* ---------- 5. KOMPRESOR ANGIN / PISTON (12×6 = 72) ---------- */
  const brandsAngin = ['Shark', 'Mitsuyama', 'Energi', 'Falcon', 'Abbott', 'Kyk', 'Tekiro', 'Proquip', 'Krisbow', 'Stanley', 'Broco', 'Machinatech']
  const specsAngin: [string, string, number][] = [
    ['1/2', '25', 750000], ['1', '35', 1150000], ['1.5', '40', 1650000],
    ['2', '60', 2450000], ['3', '90', 3850000], ['5.5', '150', 6100000],
  ]
  for (const b of brandsAngin) {
    for (const [hp, liter, base] of specsAngin) {
      const model = `${b.slice(0, 2).toUpperCase()}-${hp.replace('.', '')}${liter}`
      yield {
        name: `Kompresor Angin ${b} ${hp} HP Tangki ${liter} L (${model})`,
        cat: 'kompresor-angin',
        code: model,
        sku: sku('KAG', b),
        brand: b,
        price: Math.round((base + ri(0, 15) * 25000) / 1000) * 1000,
        unit: 'unit',
        shortDesc: `Kompresor angin piston ${b} ${hp} HP, tangki ${liter} liter, 8 bar. Untuk bengkel, spray cat, dan tiup debu.`,
        description: descKompresor(b, `${hp} HP — Tangki ${liter}L`, 'Udara Bertekanan', 'Kompresor Angin Piston', `bengkel motor/mobil, spray painting, pneumatic tool, dan peniupan debu AC — tekanan kerja 8 bar dengan tangki ${liter} liter`),
        specs: specsOf([
          ['Merek', b],
          ['Daya', `${hp} HP`],
          ['Kapasitas Tangki', `${liter} Liter`],
          ['Tekanan Maks', '8 Bar (116 PSI)'],
          ['Tipe', 'Piston, belt / direct drive'],
          ['Pelumas', 'Oli (sesuai tipe)'],
        ]),
      }
    }
  }

  /* ---------- 6. MOTOR & FAN (8×10 = 80) ---------- */
  const brandsMotor = ['Subur', 'Jayafit', 'FMI', 'Tatung', 'Teco', 'Bloktech', 'Elite', 'G-Fast', 'Mitsumi', 'Nippon']
  const tipeMotor = ['Motor Fan Indoor AC Split', 'Motor Fan Outdoor AC Split', 'Motor Blower AHU', 'Motor Fan Cassette AC', 'Motor Exhaust Fan Industrial', 'Motor Fan Cooling Tower', 'Motor Blower Air Curtain', 'Motor Fan Unit Cooler']
  const rpmMotor = ['850', '1050', '1300', '1550']
  const priceMotor: Record<string, number> = { '1/16': 145000, '1/12': 175000, '1/10': 205000, '1/8': 245000, '1/6': 295000, '1/4': 395000, '1/3': 495000, '1/2': 695000 }
  for (const t of tipeMotor) {
    for (const b of brandsMotor) {
      const hp = pickStr(['1/16', '1/12', '1/10', '1/8', '1/6', '1/4', '1/3', '1/2'])
      const rpm = pickStr(rpmMotor)
      const model = `YFK${ri(1000, 9999)}`
      yield {
        name: `${t} ${b} ${hp} HP ${rpm} RPM (${model})`,
        cat: 'motor-fan',
        code: model,
        sku: sku('MTR', b),
        brand: b,
        price: hargaMap(priceMotor[hp]),
        unit: 'pcs',
        shortDesc: `${t} merek ${b}, ${hp} HP, ${rpm} RPM. Ball bearing halus, awet & tidak berisik.`,
        description: descGeneric(`${t} ${b} ${hp} HP ${rpm} RPM`, 'penggerak fan/blower pada sistem pendingin', 'AC split indoor/outdoor, air handling unit, exhaust fan, dan unit cooler'),
        specs: specsOf([
          ['Merek', b],
          ['Tipe', t],
          ['Daya', `${hp} HP`],
          ['Kecepatan', `${rpm} RPM`],
          ['Bearing', 'Ball bearing (lifelong lubrication)'],
          ['Voltase', '220V / 50Hz'],
        ]),
      }
    }
  }

  /* ---------- 7. KAPASITOR (12×3 + 4×2 + 9 = 53) ---------- */
  const nilaiRun = ['10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '70']
  for (const v of nilaiRun) {
    for (const jenis of ['Running CBB65', 'Running Dual 2-in-1', 'Running CBB65 Heavy Duty']) {
      const model = `CAP${v}${jenis === 'Running CBB65' ? 'A' : jenis.includes('Dual') ? 'D' : 'H'}`
      yield {
        name: `Kapasitor ${jenis} ${v} µF 450VAC (${model})`,
        cat: 'kapasitor',
        code: model,
        sku: sku('KAP', jenis),
        brand: jenis.includes('Heavy') ? 'Havells' : 'Genteq',
        price: Math.round((18000 + parseInt(v) * 950 + ri(0, 5) * 1500) / 500) * 500,
        unit: 'pcs',
        shortDesc: `Kapasitor ${jenis} ${v} µF 450VAC — penyebab paling umum AC tidak mau dingin. Ganti, langsung nyala!`,
        description: descGeneric(`Kapasitor ${jenis} ${v} µF 450VAC`, 'penyimpan muatan listrik untuk memulai & menjaga putaran kompresor/fan', 'AC split, kulkas, showcase, mesin cuci, dan motor fan 220V'),
        specs: specsOf([
          ['Tipe', jenis],
          ['Kapasitansi', `${v} µF ± 5%`],
          ['Voltase', '450VAC'],
          ['Frekuensi', '50/60 Hz'],
          ['Material', 'Metallized polypropylene film'],
          ['Standar', 'CQC / UL / TUV'],
        ]),
      }
    }
  }
  for (const v of ['100', '150', '216', '250']) {
    for (const t of ['Starting CD60', 'Starting Kit Hard Start']) {
      const model = `CAPS${v}${t.includes('CD60') ? 'C' : 'H'}`
      yield {
        name: `Kapasitor ${t} ${v} µF 250V (${model})`,
        cat: 'kapasitor',
        code: model,
        sku: sku('KPS', t),
        brand: 'GE',
        price: Math.round((22000 + parseInt(v) * 180 + ri(0, 6) * 2000) / 500) * 500,
        unit: 'pcs',
        shortDesc: `Kapasitor starting ${t} ${v} µF untuk membantu kompresor malas start.`,
        description: descGeneric(`Kapasitor ${t} ${v} µF 250V`, 'penguat torsi awal saat kompresor mulai berputar', 'kulkas, freezer, AC window, dan kompresor hermetik 1/8-1/2 PK'),
        specs: specsOf([
          ['Tipe', t],
          ['Kapasitansi', `${v} µF ± 15%`],
          ['Voltase', '250V'],
          ['Duty', 'Short time (3-5 detik)'],
          ['Terminal', '2 spade quick connect'],
        ]),
      }
    }
  }
  for (const v of ['1.2', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6']) {
    const model = `CAPF${v.replace('.', '')}`
    yield {
      name: `Kapasitor Fan CBB61 ${v} µF 450V (${model})`,
      cat: 'kapasitor',
      code: model,
      sku: sku('KPF', 'CBB61'),
      brand: 'Ningguo',
      price: Math.round((9000 + parseFloat(v) * 2200 + ri(0, 4) * 1000) / 500) * 500,
      unit: 'pcs',
      shortDesc: `Kapasitor fan motor CBB61 ${v} µF — untuk motor fan yang lemah atau mati total.`,
      description: descGeneric(`Kapasitor Fan CBB61 ${v} µF 450V`, 'pemicu putaran motor fan (kutub tunggal)', 'motor fan indoor AC split, outdoor, kipas angin, dan exhaust fan'),
      specs: specsOf([
        ['Tipe', 'CBB61 (fan motor)'],
        ['Kapasitansi', `${v} µF ± 5%`],
        ['Voltase', '450VAC'],
        ['Bentuk', 'Kotak resin, 2-4 kabel'],
      ]),
    }
  }

  /* ---------- 8. TERMOSTAT & SENSOR (6×10 = 60) ---------- */
  const brandsT = ['KFE', 'Saginomiya', 'Ranco', 'Danfoss', 'Kangtai', 'Elite', 'Suva', 'Universal', 'Digital-tec', 'Wancheng']
  const tipeT = ['Termostat Analog AC', 'Termostat Digital Universal AC', 'Sensor Thermistor 10K', 'Pressure Switch HP', 'Pressure Switch LP', 'Timer Delay AC 3 Menit']
  for (const t of tipeT) {
    for (const b of brandsT) {
      const model = `TH-${b.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}${ri(100, 999)}`
      yield {
        name: `${t} ${b} (${model})`,
        cat: 'termostat-sensor',
        code: model,
        sku: sku('THR', b),
        brand: b,
        price: Math.round((35000 + ri(0, 20) * 6500) / 500) * 500,
        unit: 'pcs',
        shortDesc: `${t} merek ${b} — pengatur suhu & proteksi sistem pendingin yang akurat.`,
        description: descGeneric(`${t} ${b} (${model})`, 'pengendali otomatis suhu/tekanan pada sistem pendingin', 'AC split, showcase, chiller, cold storage, dan kulkas komersial'),
        specs: specsOf([
          ['Merek', b],
          ['Tipe', t],
          ['Rentang Suhu', t.includes('Analog') ? '-5°C s/d 30°C' : '-40°C s/d 120°C'],
          ['Voltase', '220V / 50Hz'],
          ['Probe', t.includes('Thermistor') ? 'NTC 10K' : '-'],
        ]),
      }
    }
  }

  /* ---------- 9. FREON & GAS (8×3×2 = 48) ---------- */
  const gas: [string, number, string][] = [
    ['R32', 65000, 'AC split generasi baru, ramah lingkungan & efisien'],
    ['R410A', 85000, 'AC split & cassette inverter'],
    ['R22', 45000, 'AC split lama & unit komersial klasik'],
    ['R134A', 55000, 'AC mobil, kulkas, dan chiller'],
    ['R404A', 95000, 'cold storage & showcase suhu rendah'],
    ['R407C', 90000, 'pengganti R22 pada unit komersial'],
    ['R600A', 45000, 'kulkas rumah tangga modern'],
    ['R290', 55000, 'freezer & AC ramah lingkungan'],
  ]
  const brandsFreon = ['Meilian', 'Priori']
  const kemasan: [string, number, string][] = [
    ['220gr', 1, 'kaleng'],
    ['3.4kg', 8, 'tabung kecil'],
    ['13.6kg', 30, 'tabung'],
  ]
  for (const [g, base, aplikasi] of gas) {
    for (const [k, faktor, unit] of kemasan) {
      for (const b of brandsFreon) {
        yield {
          name: `Freon ${g} ${k} ${b} — Export Quality`,
          cat: 'freon-gas',
          code: `FRN${g}${k.replace(/[^0-9a-z]/gi, '')}${b.slice(0, 2)}`,
          sku: sku('FRN', g + b),
          brand: b,
          price: Math.round((base * faktor + ri(0, 9) * 5000) / 1000) * 1000,
          unit,
          shortDesc: `Freon ${g} ${k} merek ${b}, kemurnian 99.9% untuk ${aplikasi}.`,
          description: descGeneric(`Freon ${g} kemasan ${k} merek ${b}`, 'refrigerant berkemurnian tinggi (≥ 99.9%) untuk siklus pendinginan', aplikasi),
          specs: specsOf([
            ['Jenis Gas', g],
            ['Kemasan', k],
            ['Merek', b],
            ['Kemurnian', '≥ 99.9% (export grade)'],
            ['Aplikasi', aplikasi],
            ['Sertifikat', 'DOT / CE / ISO'],
          ]),
        }
      }
    }
  }

  /* ---------- 10. FITTING & AKSESORIS (40×2 = 80) ---------- */
  const fitting: [string, number, string, string][] = [
    ['Flare Nut Tembaga 1/4 inch (isi 10)', 18000, 'pcs', 'sambungan pipa AC R22/R410A'],
    ['Flare Nut Tembaga 3/8 inch (isi 10)', 20000, 'pcs', 'sambungan pipa AC'],
    ['Flare Nut Tembaga 1/2 inch (isi 10)', 24000, 'pcs', 'sambungan pipa AC kapasitas besar'],
    ['Flare Nut Tembaga 5/8 inch (isi 10)', 32000, 'pcs', 'AC 2 PK ke atas'],
    ['Flare Nut Tembaga 3/4 inch (isi 5)', 38000, 'pcs', 'AC 5 PK / ducting'],
    ['Pipa Tembaga R410A 1/4 inch — per meter', 42000, 'meter', 'instalasi AC split'],
    ['Pipa Tembaga R410A 3/8 inch — per meter', 68000, 'meter', 'instalasi AC split 1-2 PK'],
    ['Pipa Tembaga R410A 1/2 inch — per meter', 95000, 'meter', 'instalasi AC 2.5-3 PK'],
    ['Pipa Tembaga R410A 5/8 inch — per meter', 135000, 'meter', 'instalasi AC 4-5 PK'],
    ['Pipa Tembaga Roll 15 Meter 1/4+3/8 inch', 485000, 'roll', 'paket instalasi 1 PK lengkap'],
    ['Kawat Las Tembaga Phos-Copper 25% (isi 5)', 65000, 'pack', 'penyambungan pipa tembaga'],
    ['Sight Glass Refrigerasi 1/4 inch', 85000, 'pcs', 'cek kondisi freon sistem'],
    ['Solenoid Valve 1/4 inch 220V', 145000, 'pcs', 'pemutus aliran freon otomatis'],
    ['Solenoid Valve 3/8 inch 220V', 175000, 'pcs', 'sistem defrost & bypass'],
    ['Schrader Valve R410A (isi 5)', 25000, 'set', 'titik pengisian freon'],
    ['Selang Isi Freon 3-Way 150cm', 95000, 'set', 'pengisian freon via manifold'],
    ['Adaptor Isi Freon Mobil R134a', 45000, 'pcs', 'pengisian AC mobil'],
    ['Manifold Gauge Set R22/R410A 2-Way', 385000, 'set', 'alat ukur tekanan bengkel'],
    ['Manifold Gauge Digital 4-Way', 1250000, 'set', 'teknisi profesional'],
    ['Vacuum Pump 2-Stage 1.5 CFM', 1150000, 'unit', 'vacuum pipa sebelum isi freon'],
    ['Vacuum Pump 4 CFM 2-Stage', 1850000, 'unit', 'instalasi AC besar & cold storage'],
    ['Nitrogen Regulator + Selang Set', 985000, 'set', 'pressure test & flushing sirkulasi'],
    ['Filter Dryer 1/4 inch (Brazing)', 48000, 'pcs', 'serapan uap air sirkulasi'],
    ['Filter Dryer 3/8 inch (Brazing)', 62000, 'pcs', 'sistem kapasitas menengah'],
    ['Filter Dryer 1/2 inch (Brazing)', 85000, 'pcs', 'sistem komersial'],
    ['Filter Drier Birok 1/4 Solder', 55000, 'pcs', 'kulkas & showcase'],
    ['Quick Coupler Sambungan Split-Nut', 65000, 'pcs', 'pemasangan tanpa las'],
    ['Klem Pipa Tembaga (isi 20)', 35000, 'pack', 'merapikan jalur pipa AC'],
    ['Insulasi Pipa Evaflex 3/8 — per meter', 12000, 'meter', 'pelindung pipa freon'],
    ['Insulasi Pipa Evaflex 1/2 — per meter', 15000, 'meter', 'pelindung pipa freon'],
    ['Trunking Pipa AC 60cm', 35000, 'pcs', 'saluran pipa rapi'],
    ['Selang Drain Pembuangan 5 Meter', 28000, 'roll', 'jalur air kondensasi'],
    ['Drain Pump AC 40W Otomatis', 425000, 'unit', 'buang kondensat ke ketinggian'],
    ['Kabel Kontrol AC 3×1.5 — per meter', 11000, 'meter', 'wiring indoor-outdoor'],
    ['Terminal Listrik Outdoor AC', 25000, 'pcs', 'sambungan daya outdoor'],
    ['Cover Pipa Outdoor AC Universal', 185000, 'set', 'proteksi sambungan pipa'],
    ['Bracket Dinding Outdoor AC 1-2 PK', 145000, 'pasang', 'gantung outdoor di dinding'],
    ['Bracket Lantai Heavy Duty 5 PK', 285000, 'pasang', 'outdoor kapasitas besar'],
    ['Gauge Manifold Selang Isi Freon Spare', 28000, 'pcs', 'cadangan selang manifold'],
    ['Torque Wrench Flare 5-55Nm', 425000, 'pcs', 'pengerungan flare presisi'],
  ]
  const brandsFit = ['Sanhua', 'General']
  for (const [nm, pr, un, app] of fitting) {
    for (const b of brandsFit) {
      yield {
        name: `${nm} — ${b}`,
        cat: 'fitting-aksesoris',
        code: `FIT${no + 1}`,
        sku: sku('FIT', nm),
        brand: b,
        price: Math.round((pr + ri(0, 6) * 500) / 500) * 500,
        unit: un,
        shortDesc: `${nm} merek ${b} — kebutuhan instalasi & perbaikan ${app}. Kualitas bengkel!`,
        description: descGeneric(`${nm} merek ${b}`, 'komponen aksesoris instalasi pendinginan', app),
        specs: specsOf([
          ['Merek', b],
          ['Kategori', 'Fitting & Aksesoris'],
          ['Aplikasi', app],
        ]),
      }
    }
  }

  /* ---------- 11. SPAREPART KOMPRESOR (30×2 = 60) ---------- */
  const spareparts: [string, number][] = [
    ['Karet Peredam Kompresor AC Split (isi 3)', 25000],
    ['Karet Peredam Kompresor Heavy Duty (isi 3)', 45000],
    ['Relay PTC Kompresor Kulkas 1/8-1/6 PK', 22000],
    ['Relay PTC Kompresor Kulkas 1/4-1/3 PK', 28000],
    ['Overload Protector Kompresor 1/8 PK', 18000],
    ['Overload Protector Kompresor 1/4-1/2 PK', 25000],
    ['Overload Protector Kompresor 3/4-1 PK', 35000],
    ['Starting Kit PTC + Kapasitor Kulkas', 45000],
    ['Starting Kit Hard Start CSR-U1 AC', 85000],
    ['Starting Kit Hard Start CSR-U2 AC 2 PK', 105000],
    ['Terminal Cover Kompresor AC Split', 15000],
    ['Terminal Plug Karet Kompresor Kulkas', 12000],
    ['Kabel Terminal Kompresor 3 Pin (isi 5)', 20000],
    ['Kontaktor AC 2 Pole 25A', 85000],
    ['Kontaktor AC 3 Pole 32A', 145000],
    ['Kontaktor AC 3 Pole 40A Heavy Duty', 195000],
    ['Protector Termal Motor Fan', 15000],
    ['Bushing Bronze Fan Motor', 12000],
    ['Ball Bearing 608ZZ Fan Motor (isi 2)', 18000],
    ['Ball Bearing 6200 Motor Blower', 25000],
    ['Fan Blade Outdoor 24 inch', 145000],
    ['Fan Blade Outdoor 26 inch', 165000],
    ['Fan Blade Outdoor 30 inch', 225000],
    ['Blower Crossflow Indoor 1 PK', 95000],
    ['Blower Crossflow Indoor 2 PK', 115000],
    ['Blower Crossflow Indoor 3 PK', 145000],
    ['Pompa Drainase Inline 12W', 285000],
    ['Pressure Switch 4 Wire HP-LP', 125000],
    ['Crankcase Heater 220V', 85000],
    ['Gasket Terminal Kompresor (isi 10)', 18000],
    ['Sight Glass Kompresor Hermetik 1/4', 32000],
    ['Baut Kaki Kompresor Set (isi 3)', 15000],
    ['Karet Kaki Fan Outdoor (isi 4)', 18000],
  ]
  const brandsSpt = ['Titan', 'Universal']
  for (const [nm, pr] of spareparts) {
    for (const b of brandsSpt) {
      yield {
        name: `${nm} — ${b}`,
        cat: 'sparepart-kompresor',
        code: `SPT${no + 1}`,
        sku: sku('SPT', nm),
        brand: b,
        price: Math.round((pr + ri(0, 5) * 1000) / 500) * 500,
        unit: 'pcs',
        shortDesc: `${nm} merek ${b} — solusi perbaikan cepat tanpa ganti unit besar.`,
        description: descGeneric(`${nm} merek ${b}`, 'sparepart pengganti untuk perbaikan sistem pendingin', 'perbaikan AC split, kulkas, showcase, dan unit komersial'),
        specs: specsOf([
          ['Merek', b],
          ['Kategori', 'Sparepart Kompresor'],
          ['Kualitas', 'Grade A — tested'],
        ]),
      }
    }
  }

  /* ---------- 12. OLI & KIMIA (24×~2 = 48) ---------- */
  const oliKimia: [string, number, string][] = [
    ['Oli Kompresor SUNISO 4GSD — 1 Liter', 145000, 'kompresor AC & refrigerasi R22/R134a'],
    ['Oli Kompresor SUNISO 5GS — 1 Liter', 155000, 'sistem kapasitas besar'],
    ['Oli Kompresor POE VG68 — 1 Liter', 185000, 'kompresor R410A/R404A'],
    ['Oli Kompresor POE VG100 — 1 Liter', 195000, 'semi-hermetik industri'],
    ['Oli Kompresor PAG 46 — 250ml (AC Mobil)', 65000, 'kompresor AC mobil R134a'],
    ['Oli Kompresor PAG 100 — 250ml', 68000, 'kompresor mobil torsi besar'],
    ['Oli Kompresor Angin SAE 30 — 1 Liter', 55000, 'kompresor angin piston'],
    ['Oli Kompresor Angin SAE 20W-50 — 4L', 165000, 'kompresor bengkel heavy duty'],
    ['Coil Cleaner AC Foamy 500ml', 75000, 'cuci evaporator & kondensor'],
    ['Coil Cleaner AC Concentrate 5L', 285000, 'cuci AC bengkel & kontraktor'],
    ['Foamy AC + Disinfektan 600ml', 95000, 'cuci AC anti bakteri'],
    ['Nitrogen Gas High Purity — Tabung 1m³', 385000, 'pressure test & flushing'],
    ['Nitrogen Regulator Presisi', 485000, 'alat pressure test'],
    ['Leak Detector Bubble Solution 500ml', 45000, 'deteksi kebocoran pipa'],
    ['Electronic Leak Detector HLD-100+', 685000, 'deteksi kebocoran presisi'],
    ['UV Leak Detection Kit + Lampu', 425000, 'deteksi bocor dengan pewarna'],
    ['Sealant Pipa Tembaga Thread 50gr', 35000, 'penyegel sambungan'],
    ['Anti-Vibration Pad Outdoor (set 4)', 55000, 'kurangi getaran outdoor'],
    ['Deodorizer AC Spray 300ml', 65000, 'pengharum & anti bau AC'],
    ['Fungicide Spray Evaporator 250ml', 55000, 'anti jamur indoor unit'],
    ['Contact Cleaner Elektrik 400ml', 65000, 'PCB & terminal'],
    ['Rust Converter Outdoor Coil 1L', 125000, 'anti korosi kondensor'],
    ['Alu Foil Tape Ducting 48mm', 35000, 'sealing ducting'],
    ['Kabel Tie Besar (isi 100)', 25000, 'merapikan instalasi'],
  ]
  for (const [nm, pr, app] of oliKimia) {
    const brands = nm.includes('SUNISO') ? ['Suniso'] : ['Suniso', 'Berkat Chem']
    for (const b of brands) {
      yield {
        name: nm.includes('SUNISO') ? nm : `${nm} — ${b}`,
        cat: 'oli-kimia',
        code: `OLI${no + 1}`,
        sku: sku('OLI', nm),
        brand: b,
        price: Math.round((pr + ri(0, 6) * 1000) / 500) * 500,
        unit: nm.includes('Liter') || nm.endsWith('4L') ? 'botol' : 'pcs',
        shortDesc: `${nm} — kebutuhan rutin bengkel pendingin. Aplikasi: ${app}.`,
        description: descGeneric(nm.includes('SUNISO') ? nm : `${nm} merek ${b}`, 'oli/kimia perawatan sistem pendingin', app),
        specs: specsOf([
          ['Merek', b],
          ['Kategori', 'Oli & Kimia'],
          ['Aplikasi', app],
        ]),
      }
    }
  }

  /* ---------- 13. EVAPORATOR & KONDENSOR (30 + 24 = 54) ---------- */
  const brandsEK = ['Sanhua', 'Dunham', 'Jaga', 'Elite', 'BerkatCool']
  const priceEK: Record<string, number> = { '1/2': 450000, '3/4': 550000, '1': 750000, '1.5': 950000, '2': 1250000, '2.5': 1450000, '3': 1650000, '5': 2650000 }
  const pksEK = ['1/2', '3/4', '1', '1.5', '2', '2.5', '3', '5']
  for (let i = 0; i < 30; i++) {
    const pk = pksEK[i % pksEK.length]
    const jenis = i % 2 === 0 ? 'Evaporator' : 'Kondensor'
    const b = brandsEK[i % brandsEK.length]
    const model = `${jenis.slice(0, 2).toUpperCase()}${ri(1000, 9999)}`
    yield {
      name: `${jenis} AC ${pk} PK ${b} (${model})`,
      cat: 'evaporator-kondensor',
      code: model,
      sku: sku('EVK', jenis + i),
      brand: b,
      price: hargaMap(priceEK[pk]),
      unit: 'unit',
      shortDesc: `${jenis} ${pk} PK ${b} untuk perbaikan unit bocor — dingin kembali tanpa ganti unit penuh!`,
      description: descGeneric(`${jenis} ${pk} PK ${b} (${model})`, jenis === 'Evaporator' ? 'penyerap panas di sisi indoor (coil sirkulasi udara dingin)' : 'pembuang panas di sisi outdoor (coil kondensasi)', `perbaikan AC split ${pk} PK yang coil-nya bocor atau berkarat`),
      specs: specsOf([
        ['Merek', b],
        ['Tipe', `${jenis} coil ${model}`],
        ['Kapasitas', `${pk} PK`],
        ['Material', 'Tembaga + fin aluminium hydrophilic'],
        ['Uji', 'Nitrogen 300 PSI (bebas bocor)'],
      ]),
    }
  }
  const brandsUC = ['Zanotti', 'Embraco', 'Tecumseh', 'Danfoss', 'Kulthorn', 'Embraco']
  const priceUC: Record<string, number> = { '1/4': 2850000, '1/3': 3250000, '1/2': 3650000, '3/4': 4250000, '1': 4850000, '1.5': 5850000, '2': 6850000, '3': 8850000 }
  const kapUC = ['1/4', '1/3', '1/2', '3/4', '1', '1.5', '2', '3']
  for (let i = 0; i < 24; i++) {
    const jenis = i % 2 === 0 ? 'Unit Cooler' : 'Condensing Unit'
    const kap = kapUC[i % kapUC.length]
    const b = brandsUC[i % brandsUC.length]
    const model = `${jenis.slice(0, 2).toUpperCase()}${ri(1000, 9999)}`
    yield {
      name: `${jenis} Showcase/Chiller ${kap} PK ${b} (${model})`,
      cat: 'evaporator-kondensor',
      code: model,
      sku: sku('UCU', jenis + i),
      brand: b,
      price: rand() < 0.3 ? null : hargaMap(priceUC[kap]),
      unit: 'unit',
      shortDesc: `${jenis} ${kap} PK ${b} — jantung pendingin showcase, chiller & freezer komersial.`,
      description: descGeneric(`${jenis} ${kap} PK ${b} (${model})`, jenis === 'Unit Cooler' ? 'evaporator forced-air untuk ruang pendingin' : 'rangkaian kompresor + kondensor siap pakai', `showcase minimarket, chiller resto, freezer industri berkapasitas ${kap} PK`),
      specs: specsOf([
        ['Merek', b],
        ['Tipe', jenis],
        ['Kapasitas', `${kap} PK`],
        ['Refrigerant', 'R134a / R404A'],
        ['Voltase', '220V / 50Hz'],
      ]),
    }
  }
}

/* pilih acak deterministik dari array string */
function pickStr<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

/* ================= MAIN ================= */

async function main() {
  console.log('❄️  SEED 1000 PRODUK — Berkat Mandiri Pendingin\n')

  // 1. Kategori (upsert; existing tetap)
  const catMap = new Map<string, string>()
  for (const c of CATEGORIES) {
    const existing = await db.category.findUnique({ where: { slug: c.slug } })
    const row = existing
      ? await db.category.update({ where: { id: existing.id }, data: { name: c.name, icon: c.icon } })
      : await db.category.create({ data: { name: c.name, slug: c.slug, icon: c.icon } })
    catMap.set(c.slug, row.id)
  }
  console.log(`✅ Kategori siap: ${catMap.size}`)

  // 2. Hitung kebutuhan
  const existingCount = await db.product.count()
  const need = Math.max(0, TARGET_TOTAL - existingCount)
  console.log(`📦 Produk existing: ${existingCount} — perlu ditambah: ${need}`)

  if (need === 0) {
    console.log('🎯 Total sudah 1000. Tidak ada yang perlu ditambahkan.')
    return
  }

  // 3. Generate + dedupe slug
  const existingSlugs = new Set((await db.product.findMany({ select: { slug: true } })).map((p) => p.slug))
  const slugSet = new Set(existingSlugs)
  const batch: Gen[] = []
  for (const it of genSemua()) {
    if (batch.length >= need) break
    batch.push(build(it, catMap.get(it.cat)!, slugSet))
  }
  console.log(`🔧 Generator menghasilkan: ${batch.length} produk baru`)

  // 4. Insert bertahap
  const BATCH = 200
  for (let i = 0; i < batch.length; i += BATCH) {
    const chunk = batch.slice(i, i + BATCH)
    await db.product.createMany({ data: chunk })
    console.log(`   ...insert ${Math.min(i + BATCH, batch.length)}/${batch.length}`)
  }

  // 5. Pastikan jumlah featured secukupnya
  const featCount = await db.product.count({ where: { isFeatured: true } })
  if (featCount < 12) {
    const toFeat = await db.product.findMany({ where: { isFeatured: false }, take: 12 - featCount, select: { id: true } })
    await db.product.updateMany({ where: { id: { in: toFeat.map((p) => p.id) } }, data: { isFeatured: true } })
  }

  const total = await db.product.count()
  const withImg = await db.product.count({ where: { images: { not: '[]' } } })
  console.log(`\n🎉 SELESAI! Total produk: ${total} | dengan gambar: ${withImg}`)
  console.log(`📊 Pool gambar: ${Object.keys(POOLS).length} family → ${Object.values(POOLS).flat().length} foto internet`)
}

main()
  .catch((e) => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
