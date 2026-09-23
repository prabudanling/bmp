/**
 * Seed halaman CMS demo — idempotent (upsert by slug).
 * Jalankan: bun run scripts/seed-pages.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const PAGES = [
  {
    title: 'Tentang Kami',
    slug: 'tentang-kami',
    showInMenu: true,
    sortOrder: 1,
    excerpt:
      'Mengenal Berkat Mandiri Pendingin — toko spesialis kompresor & sparepart AC yang dipercaya ribuan teknisi di seluruh Indonesia.',
    content: `<h2>Siapa Kami</h2>
<p><strong>Berkat Mandiri Pendingin</strong> adalah toko spesialis kompresor dan sparepart AC yang telah berpengalaman lebih dari 10 tahun melayani teknisi, bengkel AC, kontraktor, hotel, hingga pemilik rumah di seluruh Indonesia.</p>
<p>Kami memahami betul betapa menyebalkannya AC mati total — apalagi saat musim panas. Karena itu kami berkomitmen menyediakan <strong>part original, stok lengkap, dan harga bersahabat</strong> agar perbaikan Anda selesai di hari yang sama.</p>
<h2>Apa yang Membuat Kami Berbeda</h2>
<ul>
<li><strong>Stok paling lengkap</strong> — lebih dari 1.000 item aktif mulai kompresor rotary/scroll, motor fan, kapasitor, termostat, freon, hingga fitting tembaga.</li>
<li><strong>100% original &amp; bergaransi</strong> — semua part disuplai dari distributor resmi. Garansi tukar jika ada kerusakan pabrik.</li>
<li><strong>Gratis konsultasi teknisi</strong> — bingung part yang rusak? Kirim foto/tipe AC Anda, tim kami bantu carikan yang pas.</li>
<li><strong>Packing aman &amp; kirim same-day</strong> — bubble wrap berlapis + kayu untuk kompresor. Pengiriman ke seluruh Indonesia.</li>
</ul>
<h2>Mitra &amp; Distributor</h2>
<p>Kami merupakan agen resmi dan mitra distribusi untuk merek-merek ternama seperti Daikin, Panasonic, Gree, Mitsubishi, Sanden, dan lainnya — baik untuk unit komersial maupun residensial.</p>
<blockquote>Kepuasan teknisi adalah iklan kami yang paling efektif. 8 dari 10 pelanggan kami datang dari rekomendasi.</blockquote>
<h2>Kunjungi Toko Kami</h2>
<p>Langsung mampir ke toko untuk melihat sendiri stok kami, atau pesan lewat WhatsApp — pesan sebelum jam 15.00 dikirim di hari yang sama (Wilayah Jabodetabek).</p>`,
  },
  {
    title: 'Cara Pemesanan',
    slug: 'cara-pemesanan',
    showInMenu: true,
    sortOrder: 2,
    excerpt:
      'Panduan singkat memesan sparepart AC di Berkat Mandiri Pendingin — dari tanya stok sampai barang tiba di tangan Anda.',
    content: `<h2>4 Langkah Mudah Memesan</h2>
<h3>1. Cari Part yang Anda Butuhkan</h3>
<p>Buka halaman <strong>Katalog</strong> lalu gunakan kolom pencarian atau filter kategori. Setiap produk dilengkapi foto asli, spesifikasi, dan status stok.</p>
<h3>2. Konfirmasi via WhatsApp</h3>
<p>Klik tombol <strong>Chat WhatsApp</strong> pada produk yang diinginkan. Sebutkan nama part, tipe, dan kapasitas AC Anda agar tim kami memastikan kompatibilitas — <em>gratis, tanpa biaya konsultasi</em>.</p>
<h3>3. Pembayaran</h3>
<p>Kami menerima transfer bank (BCA, Mandiri, BRI), QRIS, dan COD untuk wilayah Jabodetabek. Setelah pembayaran terkonfirmasi, barang langsung kami packing.</p>
<h3>4. Pengiriman</h3>
<ul>
<li><strong>Jabodetabek</strong> — same day / kurir instan.</li>
<li><strong>Luar Jawa</strong> — JNE, J&amp;T, SiCepat (1-3 hari).</li>
<li><strong>Kompresor &amp; barang besar</strong> — dikemas rangka kayu khusus, cargo laut/udara.</li>
</ul>
<h2>Retur &amp; Garansi</h2>
<p>Part salah beli? Bisa ditukar maksimal <strong>3 hari</strong> sejak barang diterima, syarat masih segel dan tidak terpasang. Kerusakan pabrik diganti baru 100%.</p>
<hr>
<p>Ada pertanyaan lain? Tim kami online setiap hari kerja pukul 08.00–17.00 WIB. Klik tombol WhatsApp hijau di bawah halaman ini!</p>`,
  },
  {
    title: 'Pertanyaan yang Sering Diajukan (FAQ)',
    slug: 'faq',
    showInMenu: true,
    sortOrder: 3,
    excerpt:
      'Jawaban atas pertanyaan yang paling sering masuk ke kami: garansi, keaslian barang, ongkir, sampai cara cek kompresor rusak.',
    content: `<h2>Produk &amp; Stok</h2>
<h3>Apakah semua barang original?</h3>
<p>Ya. Kami hanya menjual part dari distributor resmi. Jika kami tidak yakin dengan keaslian suatu item, kami akan jujur mengatakannya sebelum Anda membeli.</p>
<h3>Kenapa status "Stok Habis" padahal dulu pernah ada?</h3>
<p>Stok bergerak cepat. Part yang habis biasanya kembali 3-7 hari kerja — chat kami untuk minta di-prioritaskan.</p>
<h2>Harga &amp; Pembayaran</h2>
<h3>Kenapa beberapa produk tertulis "Hubungi Kami"?</h3>
<p>Harga part tertentu berubah mengikuti kurs/rate distributor, sehingga kami pasang harga terbaik lewat WhatsApp — biasanya lebih murah dari harga pasaran.</p>
<h3>Ada harga grosir?</h3>
<p>Ada. Pembelian di atas 10 unit atau paket bengkel mendapat harga khusus reseller. Hubungi kami untuk daftar harga grosir.</p>
<h2>Pengiriman &amp; Garansi</h2>
<h3>Kompresor dikirim aman tidak?</h3>
<p>Aman. Kami bungkus 3 lapis (bubble wrap + kardus ganda + rangka kayu) dan sertakan video unboxing sebelum dikirim.</p>
<h3>Garansi berapa lama?</h3>
<p>Bergantung produk: umumnya 1-3 bulan garansi tukar untuk kerusakan pabrik. Detail garansi tercantum di deskripsi tiap produk.</p>`,
  },
  {
    title: 'Kebijakan Privasi',
    slug: 'kebijakan-privasi',
    showInMenu: false,
    sortOrder: 0,
    excerpt:
      'Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pelanggan Berkat Mandiri Pendingin.',
    content: `<h2>Data yang Kami Kumpulkan</h2>
<p>Saat Anda mengisi form kontak atau memesan, kami mengumpulkan: nama, nomor WhatsApp/telepon, email (opsional), dan alamat pengiriman. <strong>Kami tidak pernah menjual atau membagikan data Anda kepada pihak ketiga</strong> di luar kebutuhan pengiriman.</p>
<h2>Penggunaan Data</h2>
<ul>
<li>Memproses pesanan dan pengiriman.</li>
<li>Menghubungi Anda terkait ketersediaan part atau konfirmasi alamat.</li>
<li>Mengirim info promo — hanya jika Anda mengizinkan.</li>
</ul>
<h2>Keamanan</h2>
<p>Data tersimpan di server dengan akses terbatas. Dashboard admin dilindungi password terenkripsi dan sesi login otomatis kedaluwarsa.</p>
<h2>Hak Anda</h2>
<p>Anda berhak meminta salinan, koreksi, atau penghapusan data pribadi Anda kapan saja — cukup hubungi kami lewat WhatsApp atau email yang tercantum di footer.</p>`,
  },
  {
    title: 'Syarat & Ketentuan',
    slug: 'syarat-ketentuan',
    showInMenu: false,
    sortOrder: 0,
    excerpt:
      'Ketentuan berbelanja di Berkat Mandiri Pendingin: harga, pembayaran, garansi, tukar barang, dan pembatalan pesanan.',
    content: `<h2>Harga &amp; Ketersediaan</h2>
<p>Semua harga dalam Rupiah dan dapat berubah tanpa pemberitahuan. Produk tertulis <strong>"Hubungi Kami"</strong> wajib konfirmasi harga via WhatsApp. Stok yang tampil di website diperbarui manual — konfirmasi akhir tetap dilakukan saat pemesanan.</p>
<h2>Pembayaran</h2>
<ol>
<li>Pesanan dianggap sah setelah bukti transfer diterima dan diverifikasi.</li>
<li>Rekening tujuan hanya yang diinformasikan oleh admin resmi kami — <strong>waspadai penipuan atas nama toko</strong>.</li>
<li>Pesanan dibatalkan otomatis bila pembayaran tidak diterima 1×24 jam.</li>
</ol>
<h2>Garansi &amp; Retur</h2>
<ul>
<li>Garansi produk mengikuti ketentuan pada halaman masing-masing produk.</li>
<li>Retur karena salah beli diperbolehkan maksimal 3 hari, barang segel utuh dan tidak terpasang. Biaya kirim retur ditanggung pembeli.</li>
<li>Kerusakan akibat kesalahan pemasangan, listrik tegangan tidak stabil, atau kekeliruan penggunaan <strong>tidak termasuk garansi</strong>.</li>
</ul>
<h2>Force Majeure</h2>
<p>Kami tidak bertanggung jawab atas keterlambatan akibat bencana alam, kebakaran, huru-hara, atau kebijakan pemerintah yang berada di luar kendali kami.</p>`,
  },
]

async function main() {
  console.log('Seeding halaman CMS...')
  for (const p of PAGES) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        showInMenu: p.showInMenu,
        sortOrder: p.sortOrder,
      },
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        showInMenu: p.showInMenu,
        sortOrder: p.sortOrder,
        isPublished: true,
      },
    })
    console.log(`  ✓ ${p.title} (/p/${p.slug})`)
  }
  const total = await db.page.count()
  console.log(`Selesai. Total halaman: ${total}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
