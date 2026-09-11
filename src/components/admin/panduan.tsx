'use client'

import { Info } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'

const GUIDES: { q: string; steps: string[] }[] = [
  {
    q: 'Cara menambah produk baru',
    steps: [
      'Buka menu "Produk" di sidebar, lalu klik tombol "Tambah".',
      'Isi nama produk sejelas mungkin, contoh: "Kompresor Rotary Daikin 1 PK (JT125BAY1L)" — sertakan tipe/kode part agar mudah dicari.',
      'Pilih kategori (misal: Kompresor AC), isi merek dan SKU jika ada.',
      'Tulis deskripsi singkat (muncul di kartu produk) dan deskripsi lengkap (muncul di halaman detail).',
      'Isi harga dalam Rupiah tanpa titik/koma. Kosongkan jika harga hanya diberikan lewat chat.',
      'Atur stok — jika stok 0, produk otomatis diberi label "Stok Habis".',
      'Upload foto produk, lalu klik "Simpan Produk".',
    ],
  },
  {
    q: 'Cara upload foto produk yang bagus',
    steps: [
      'Gunakan foto asli barang Anda dengan latar polos (putih/abu terang).',
      'Rasio ideal 1:1 (persegi) — foto akan tampil rapi di kartu produk.',
      'Ukuran maksimal 3MB per foto, format JPG, PNG, WEBP, atau GIF.',
      'Foto pertama yang diunggah otomatis menjadi foto utama; Anda bisa menambah beberapa foto untuk detail sudut lain.',
      'Hindari foto blur, gelap, atau ber-watermark toko lain.',
    ],
  },
  {
    q: 'Cara mengelola kategori',
    steps: [
      'Buka menu "Kategori" di sidebar.',
      'Klik "Tambah Kategori", beri nama (contoh: "Kompresor AC"), lalu pilih ikon yang sesuai.',
      'Kategori yang masih memiliki produk tidak dapat dihapus — pindahkan dulu produknya ke kategori lain.',
      'Ubah nama kategori kapan saja; alamat web (slug) akan menyesuaikan otomatis.',
    ],
  },
  {
    q: 'Cara membaca dan membalas pesan masuk',
    steps: [
      'Setiap pengunjung yang mengisi form kontak akan tampil di menu "Pesan".',
      'Pesan baru ditandai badge "Baru" dan ditampilkan juga di halaman Ringkasan.',
      'Klik ikon ampul terbuka untuk menandai pesan sudah dibaca.',
      'Klik "Balas via WhatsApp" untuk langsung chat ke nomor pengirim dengan template balasan.',
      'Hapus pesan spam lewat ikon tempat sampah.',
    ],
  },
  {
    q: 'Cara mengubah informasi toko (nama, WA, alamat, dll)',
    steps: [
      'Buka menu "Pengaturan" di sidebar.',
      'Ubah nama toko, tagline, judul banner, nomor WhatsApp, telepon, email, alamat, jam operasional, dan teks "Tentang Kami".',
      'Klik "Simpan Pengaturan" — perubahan langsung tampil di semua halaman website.',
      'PENTING: pastikan nomor WhatsApp benar karena semua tombol pesan mengarah ke nomor ini.',
    ],
  },
  {
    q: 'Cara mengganti password admin',
    steps: [
      'Buka menu "Pengaturan", cari kartu "Ubah Password Admin".',
      'Masukkan password saat ini, password baru (minimal 6 karakter), dan konfirmasinya.',
      'Klik "Ubah Password". Login berikutnya gunakan password baru.',
      'Segera ganti password default (admin123) sebelum website dipublikasikan!',
    ],
  },
  {
    q: 'Arti status "Aktif" dan "Unggulan" pada produk',
    steps: [
      'Aktif = produk tampil di katalog publik. Matikan switch ini untuk menyembunyikan produk sementara tanpa menghapusnya.',
      'Unggulan = produk tampil di bagian "Produk Unggulan" di halaman beranda. Gunakan untuk 4-8 produk terlaris Anda.',
      'Kedua switch ini bisa diubah langsung dari tabel daftar produk tanpa membuka form edit.',
    ],
  },
  {
    q: 'Tips menjual lebih banyak lewat website ini',
    steps: [
      'Lengkapi deskripsi & spesifikasi tiap produk — makin detail, makin dipercaya pembeli.',
      'Selalu update stok agar pelanggan tidak kecewa.',
      'Balas pesan masuk secepatnya — kecepatan respons adalah kunci closing.',
      'Bagikan tautan produk (tombol "Salin Tautan" di halaman produk) ke grup WhatsApp / status WhatsApp Anda.',
      'Atur nomor WhatsApp di Pengaturan dengan nomor yang aktif setiap hari.',
    ],
  },
]

export function PanduanView() {
  return (
    <div className="space-y-5">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Ini panduan singkat penggunaan dashboard. Untuk tutorial lengkap
          (termasuk cara deploy ke shared hosting), lihat file{' '}
          <span className="font-mono font-semibold">TUTORIAL.md</span> di
          folder proyek.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="rounded-xl border bg-card px-5">
        {GUIDES.map((g, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-sm font-semibold">
              {g.q}
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {g.steps.map((s, j) => (
                  <li key={j}>{s}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
