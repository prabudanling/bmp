/**
 * Seed database Berkat Mandiri Pendingin
 * Jalankan: bun scripts/seed.ts
 * Aman dijalankan berulang (idempotent) - data hanya dibuat jika belum ada.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const CATEGORIES = [
  { name: 'Kompresor AC', slug: 'kompresor-ac', icon: 'cog' },
  { name: 'Motor & Fan', slug: 'motor-fan', icon: 'fan' },
  { name: 'Kapasitor', slug: 'kapasitor', icon: 'battery-charging' },
  { name: 'Termostat & Sensor', slug: 'termostat-sensor', icon: 'thermometer' },
  { name: 'Freon & Gas', slug: 'freon-gas', icon: 'wind' },
  { name: 'Fitting & Aksesoris', slug: 'fitting-aksesoris', icon: 'wrench' },
]

const SPECS_COMPRESSOR = (merek: string, tipe: string, pk: string, ref: string) => [
  { k: 'Merek', v: merek },
  { k: 'Tipe', v: tipe },
  { k: 'Kapasitas', v: pk },
  { k: 'Refrigerant', v: ref },
  { k: 'Voltase', v: '220V / 50Hz' },
  { k: 'Garansi', v: '6 bulan (sewa mesin tidak termasuk)' },
]

const DESKRIPSI_KOMPRESOR = (merek: string, pk: string, ref: string) =>
  `Kompresor AC ${merek} ${pk} merupakan jantung utama unit AC split yang berfungsi memompa refrigerant ${ref} dalam sistem pendinginan. Produk baru 100% original, bukan rekondisi, sehingga performa pendinginan maksimal dan lebih hemat listrik.\n\nCocok digunakan untuk penggantian kompresor AC split rumah tangga, kantor, maupun ruko. Setiap kompresor yang kami kirim telah melalui proses pengecekan kualitas dan disertai garansi resmi.\n\nPenting: Pemasangan kompresor sebaiknya dilakukan oleh teknisi berpengalaman dengan vacuum pump dan penambahan nitrogen agar keawetan kompresor terjaga.`

const PRODUCTS = [
  {
    name: 'Kompresor Rotary Daikin 1 PK (JT125BAY1L)',
    cat: 'kompresor-ac',
    brand: 'Daikin',
    sku: 'CMP-DKN-1PK',
    price: 1850000,
    stock: 12,
    unit: 'pcs',
    featured: true,
    img: '/uploads/kompresor.png',
    short:
      'Kompresor rotary Daikin 1 PK original untuk AC split R32/R410A. Baru, bergaransi 6 bulan.',
    desc: DESKRIPSI_KOMPRESOR('Daikin', '1 PK', 'R32 / R410A'),
    specs: SPECS_COMPRESSOR('Daikin', 'JT125BAY1L (Rotary)', '1 PK (9000 BTU/h)', 'R32 / R410A'),
  },
  {
    name: 'Kompresor Rotary Panasonic 1/2 PK (2PS118DAA02)',
    cat: 'kompresor-ac',
    brand: 'Panasonic',
    sku: 'CMP-PAN-12PK',
    price: 1250000,
    stock: 8,
    unit: 'pcs',
    featured: false,
    img: '/uploads/kompresor.png',
    short:
      'Kompresor rotary Panasonic 1/2 PK original untuk AC split kecil, hemat listrik dan langsung dingin.',
    desc: DESKRIPSI_KOMPRESOR('Panasonic', '1/2 PK', 'R22 / R410A'),
    specs: SPECS_COMPRESSOR('Panasonic', '2PS118DAA02 (Rotary)', '1/2 PK (5000 BTU/h)', 'R22 / R410A'),
  },
  {
    name: 'Kompresor Scroll Gree 2 PK (QXR231)',
    cat: 'kompresor-ac',
    brand: 'Gree',
    sku: 'CMP-GRE-2PK',
    price: 2950000,
    stock: 5,
    unit: 'pcs',
    featured: true,
    img: '/uploads/kompresor.png',
    short:
      'Kompresor scroll Gree 2 PK untuk AC split 2 PK, pendinginan kuat dan senyap.',
    desc: DESKRIPSI_KOMPRESOR('Gree', '2 PK', 'R410A / R32'),
    specs: SPECS_COMPRESSOR('Gree', 'QXR231 (Scroll)', '2 PK (18000 BTU/h)', 'R410A / R32'),
  },
  {
    name: 'Kompresor AC LG 3/4 PK (QK118VAG)',
    cat: 'kompresor-ac',
    brand: 'LG',
    sku: 'CMP-LG-34PK',
    price: 1590000,
    stock: 0,
    unit: 'pcs',
    featured: false,
    img: '/uploads/kompresor.png',
    short:
      'Kompresor rotary LG 3/4 PK original. Stok sedang kosong - hubungi kami untuk pre-order.',
    desc: DESKRIPSI_KOMPRESOR('LG', '3/4 PK', 'R32'),
    specs: SPECS_COMPRESSOR('LG', 'QK118VAG (Rotary)', '3/4 PK (7000 BTU/h)', 'R32'),
  },
  {
    name: 'Motor Fan Outdoor AC 1 PK (20 Watt)',
    cat: 'motor-fan',
    brand: 'Mitsubishi',
    sku: 'FAN-OUT-20W',
    price: 385000,
    stock: 15,
    unit: 'pcs',
    featured: false,
    img: '/uploads/fan-motor.png',
    short:
      'Motor fan outdoor 20W untuk condenser AC split 1 PK. Tahan panas dan hujan.',
    desc:
      'Motor fan outdoor AC 1 PK 20 Watt adalah komponen yang memutar baling-baling condenser untuk membuang panas dari refrigerant. Motor ini menggunakan bearing berkualitas sehingga rotasi stabil, senyap, dan tidak mudah panas.\n\nProduk ini kompatibel dengan berbagai merek AC split seperti Daikin, Panasonic, Sharp, LG, dan Gree (sesuaikan diameter shaft dan kaki motor). Dilengkapi kabel dengan panjang standar pabrikan.\n\nTips perawatan: bersihkan baling-baling dari debu secara rutin dan pastikan kaki motor tidak berkarat agar umur motor lebih panjang.',
    specs: [
      { k: 'Merek', v: 'Mitsubishi' },
      { k: 'Daya', v: '20 Watt' },
      { k: 'Kapasitas AC', v: '1 PK' },
      { k: 'Diameter Shaft', v: '12.7 mm' },
      { k: 'Putaran', v: '930 RPM' },
      { k: 'Garansi', v: '3 bulan' },
    ],
  },
  {
    name: 'Kipas Fan Motor Indoor AC 12 Inci',
    cat: 'motor-fan',
    brand: null,
    sku: 'FAN-IN-12',
    price: 210000,
    stock: 20,
    unit: 'pcs',
    featured: false,
    img: '/uploads/fan-motor.png',
    short:
      'Motor fan indoor 12 inci untuk evaporator AC split. Senyap, dan awet.',
    desc:
      'Kipas fan motor indoor 12 inci berfungsi meniupkan udara dingin dari evaporator ke ruangan. Motor ini dirancang senyap sehingga tidak mengganggu kenyamanan saat tidur atau bekerja.\n\nMudah dipasang pada bracket indoor unit dan cocok untuk berbagai merek AC split. Ideal untuk penggantian motor yang sudah berisik, lemah, atau mati total.',
    specs: [
      { k: 'Ukuran', v: '12 inci' },
      { k: 'Daya', v: '8 Watt' },
      { k: 'Putaran', v: '1250 RPM' },
      { k: 'Garansi', v: '3 bulan' },
    ],
  },
  {
    name: 'Kapasitor Fan AC 35uF CBB65',
    cat: 'kapasitor',
    brand: null,
    sku: 'KAP-FAN-35',
    price: 45000,
    stock: 50,
    unit: 'pcs',
    featured: true,
    img: '/uploads/kapasitor.png',
    short:
      'Kapasitor running 35uF 450VAC untuk motor fan AC. Penyebab paling umum AC mati total.',
    desc:
      'Kapasitor fan AC 35uF tipe CBB65 adalah sparepart yang paling sering dibutuhkan saat AC mendadak mati atau hanya berbunyi tanpa kipas berputar. Kapasitor yang bocor/lemah membuat motor fan tidak bisa start.\n\nKapasitor CBB65 ini memiliki tegangan kerja 450VAC dengan bahan metallized polypropylene yang tahan panas dan tahan lama. Mudah dipasang, cukup ganti sesuai terminal lama.\n\nCara cek: gunakan multimeter capacitance - jika hasil di bawah 90% dari nilai nominal, segera ganti kapasitor.',
    specs: [
      { k: 'Kapasitansi', v: '35 uF ± 5%' },
      { k: 'Tegangan', v: '450 VAC' },
      { k: 'Tipe', v: 'CBB65 (Running)' },
      { k: 'Frekuensi', v: '50/60 Hz' },
      { k: 'Garansi', v: 'Tukar baru 7 hari' },
    ],
  },
  {
    name: 'Kapasitor Kompresor AC 60uF',
    cat: 'kapasitor',
    brand: null,
    sku: 'KAP-KMP-60',
    price: 95000,
    stock: 2,
    unit: 'pcs',
    featured: false,
    img: '/uploads/kapasitor.png',
    short:
      'Kapasitor kompresor 60uF 450VAC untuk AC 1 PK - 1.5 PK. Stok terbatas!',
    desc:
      'Kapasitor kompresor 60uF berfungsi memberikan torsi awal saat kompresor AC mulai bekerja. Jika kompresor hanya berbunyi "ngung" tapi tidak mau dingin, biasanya kapasitor ini sudah lemah.\n\nCocok untuk AC split 1 PK sampai 1.5 PK. Kualitas CBB65 dengan tegangan kerja 450VAC yang aman untuk fluktuasi listrik di Indonesia.',
    specs: [
      { k: 'Kapasitansi', v: '60 uF ± 5%' },
      { k: 'Tegangan', v: '450 VAC' },
      { k: 'Tipe', v: 'CBB65 (Running)' },
      { k: 'Cocok untuk', v: 'AC 1 PK - 1.5 PK' },
      { k: 'Garansi', v: 'Tukar baru 7 hari' },
    ],
  },
  {
    name: 'Termostat AC Split Universal',
    cat: 'termostat-sensor',
    brand: null,
    sku: 'TRM-SPL-01',
    price: 85000,
    stock: 25,
    unit: 'pcs',
    featured: false,
    img: '/uploads/termostat.png',
    short:
      'Termostat universal untuk AC split dan window. Mengatur suhu ruangan presisi.',
    desc:
      'Termostat AC split universal berfungsi sebagai sensor dan pengatur suhu ruangan. Ketika suhu ruangan sudah mencapai titik yang diinginkan, termostat memutus arus ke kompresor sehingga listrik lebih hemat.\n\nProduk ini kompatibel untuk berbagai merek AC split dan window. Dilengkapi capillary sensor yang sensitif terhadap perubahan suhu.\n\nGejala termostat rusak: AC hidup-mati terus menerus (short cycling), suhu tidak sesuai setting, atau AC sama sekali tidak mau menyala.',
    specs: [
      { k: 'Tipe', v: 'Universal mechanical' },
      { k: 'Rentang Suhu', v: '-5°C s/d 30°C' },
      { k: 'Voltase', v: '250 VAC / 16A' },
      { k: 'Panjang Capillary', v: '60 cm' },
      { k: 'Garansi', v: 'Tukar baru 7 hari' },
    ],
  },
  {
    name: 'Freon R32 Kantong 1 kg',
    cat: 'freon-gas',
    brand: null,
    sku: 'FRN-R32-1KG',
    price: 185000,
    stock: 30,
    unit: 'kg',
    featured: true,
    img: '/uploads/freon.png',
    short:
      'Freon R32 original 1 kg untuk AC split generasi baru. Ramah lingkungan, dingin maksimal.',
    desc:
      'Freon R32 adalah refrigerant generasi terbaru yang digunakan pada AC split produksi 2016 ke atas. Dibanding R22 dan R410A, R32 lebih ramah lingkungan (ODP 0, GWP rendah) dan mampu menyerap panas lebih baik sehingga AC lebih cepat dingin dan hemat listrik.\n\nSatu kantong berisi 1 kg, cukup untuk pengisian 1-2 unit AC split 1 PK tergantung panjang pipa. Hanya untuk diisi oleh teknisi yang memiliki alat manifold dan vacuum pump.\n\nPerhatian: Jangan mencampur R32 dengan refrigerant lain. Pastikan tekanan pengisian sesuai standar pabrikan (sekitar 115-145 PSI).',
    specs: [
      { k: 'Tipe Refrigerant', v: 'R32 (HFC-32)' },
      { k: 'Isi Bersih', v: '1 kg' },
      { k: 'ODP', v: '0 (nol)' },
      { k: 'GWP', v: '675 (rendah)' },
      { k: 'Kemasan', v: 'Kaleng disposable' },
    ],
  },
  {
    name: 'Freon R410A Kantong 1 kg',
    cat: 'freon-gas',
    brand: null,
    sku: 'FRN-R410-1KG',
    price: 210000,
    stock: 18,
    unit: 'kg',
    featured: false,
    img: '/uploads/freon.png',
    short:
      'Freon R410A original 1 kg untuk AC split inverter. Pendinginan stabil dan awet.',
    desc:
      'Freon R410A merupakan campuran refrigerant R32 dan R125 yang banyak digunakan pada AC split non-inverter dan inverter produksi 2010-2018. Memiliki kapasitas pendinginan tinggi dan tekanan kerja stabil.\n\nSatu kantong berisi 1 kg. Pengisian harus dilakukan teknisi dengan alat yang sesuai karena R410A bekerja pada tekanan lebih tinggi dari R22.\n\nCatatan: R410A tidak dapat menggantikan langsung R22 tanpa flush sistem. Konsultasikan dengan teknisi kami jika ragu.',
    specs: [
      { k: 'Tipe Refrigerant', v: 'R410A (R32/R125)' },
      { k: 'Isi Bersih', v: '1 kg' },
      { k: 'ODP', v: '0 (nol)' },
      { k: 'Kemasan', v: 'Kaleng disposable' },
    ],
  },
  {
    name: 'Filter Dryer AC 16 Gram',
    cat: 'fitting-aksesoris',
    brand: null,
    sku: 'FLT-DRY-16',
    price: 35000,
    stock: 40,
    unit: 'pcs',
    featured: false,
    img: '/uploads/filter-dryer.png',
    short:
      'Filter dryer 16 gram untuk menyaring kotoran dan kelembapan pada pipa AC.',
    desc:
      'Filter dryer AC 16 gram adalah komponen wajib yang dipasang pada pipa antara condenser dan evaporator. Fungsinya menyaring kotoran halus dan menyerap kelembapan sisa proses servis agar tidak menyumbat kapiler dan merusak kompresor.\n\nSangat disarankan untuk dipasang setiap kali ganti kompresor baru agar garansi tidak gugur. Mudah disolder dengan torch dan flux standar.\n\nWajib dipasang dengan arah aliran yang benar (perhatikan tanda panah pada badan filter dryer).',
    specs: [
      { k: 'Ukuran', v: '16 gram' },
      { k: 'Sambungan', v: 'Pipa tembaga 1/4 - 3/8 inci' },
      { k: 'Fungsi', v: 'Saring kotoran + serap air' },
      { k: 'Bahan', v: 'Brass / tembaga' },
    ],
  },
  {
    name: 'Karet Kaki Kompresor AC (Set 4 pcs)',
    cat: 'fitting-aksesoris',
    brand: null,
    sku: 'KRT-KMP-4',
    price: 25000,
    stock: 60,
    unit: 'set',
    featured: false,
    img: '/uploads/filter-dryer.png',
    short:
      'Karet anti-getar kaki kompresor AC. Bikin AC senyap dan tidak bergetar.',
    desc:
      'Karet kaki kompresor berfungsi meredam getaran mesin saat kompresor bekerja. Karet yang sudah keras atau rusak membuat AC bergetar dan berisik, serta dapat merusak pipa kapiler.\n\nSatu set berisi 4 pcs karet premium yang elastis dan tahan oli. Cocok untuk hampir semua kompresor AC split rotary dan scroll.\n\nPemasangan mudah: cukup lepas baut lama, pasang karet baru, dan kencangkan kembali.',
    specs: [
      { k: 'Isi', v: '4 pcs per set' },
      { k: 'Bahan', v: 'Karet elastomer tahan oli' },
      { k: 'Diameter Lubang', v: '8 mm' },
    ],
  },
  {
    name: 'Relay Kompresor AC 3 Pin (Overload Protector)',
    cat: 'fitting-aksesoris',
    brand: null,
    sku: 'RLY-KMP-3P',
    price: 38000,
    stock: 3,
    unit: 'pcs',
    featured: false,
    img: '/uploads/kompresor.png',
    short:
      'Relay & overload 3 pin untuk melindungi kompresor dari arus berlebih. Stok tinggal sedikit.',
    desc:
      'Relay kompresor 3 pin berfungsi sekaligus sebagai starter dan overload protector - memutus listrik otomatis saat kompresor overheat atau kelebihan arus sehingga kompresor tidak terbakar.\n\nGejala relay rusak: kompresor tidak mau start, mati nyala berulang cepat, atau MCB sering trip saat AC dinyalakan.\n\nPastikan membeli sesuai nomor jenis relay kompresor Anda (tertera pada badan relay lama). Hubungi kami jika ragu.',
    specs: [
      { k: 'Tipe', v: '3 pin (PTC starter + overload)' },
      { k: 'Fungsi', v: 'Starter + proteksi arus' },
      { k: 'Cocok untuk', v: 'Kompresor rotary 0.5 - 1.5 PK' },
    ],
  },
]

async function main() {
  console.log('Mulai seeding database...')

  // 1. Admin
  const adminExists = await db.admin.findUnique({ where: { username: 'admin' } })
  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10)
    await db.admin.create({
      data: { username: 'admin', password: hash, name: 'Admin Berkat Mandiri' },
    })
    console.log('✓ Admin dibuat: username=admin password=admin123')
  } else {
    console.log('• Admin sudah ada, lewati')
  }

  // 2. Kategori
  for (const cat of CATEGORIES) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    })
  }
  console.log(`✓ ${CATEGORIES.length} kategori siap`)

  // 3. Produk (hanya jika belum ada produk)
  const productCount = await db.product.count()
  if (productCount === 0) {
    for (const p of PRODUCTS) {
      const category = await db.category.findUnique({ where: { slug: p.cat } })
      await db.product.create({
        data: {
          name: p.name,
          slug: p.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, ''),
          sku: p.sku,
          brand: p.brand,
          categoryId: category?.id || null,
          price: p.price,
          unit: p.unit,
          stock: p.stock,
          shortDesc: p.short,
          description: p.desc,
          specs: JSON.stringify(p.specs),
          images: JSON.stringify([p.img]),
          isFeatured: p.featured,
          isActive: true,
        },
      })
    }
    console.log(`✓ ${PRODUCTS.length} produk contoh dibuat`)
  } else {
    console.log('• Produk sudah ada, lewati')
  }

  // 4. Pesan contoh
  const msgCount = await db.message.count()
  if (msgCount === 0) {
    await db.message.createMany({
      data: [
        {
          name: 'Budi Santoso',
          phone: '081234567890',
          email: 'budi@example.com',
          message:
            'Halo, saya mau tanya kompresor Daikin 1PK ready untuk AC Daikin tipe FTV15? Terima kirim ke Bandung?',
          isRead: false,
        },
        {
          name: 'Teknisi AC Maju Jaya',
          phone: '087812345678',
          message:
            'Bang, freon R32 harganya berapa kalau ambil grosir 10kg? Untuk servis rutin bengkel. Terima kasih.',
          isRead: true,
        },
      ],
    })
    console.log('✓ 2 pesan contoh dibuat')
  } else {
    console.log('• Pesan sudah ada, lewati')
  }

  console.log('Selesai! Database siap digunakan.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
