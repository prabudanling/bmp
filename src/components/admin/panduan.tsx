'use client'

import { useState } from 'react'
import {
  AlignLeft,
  Camera,
  Check,
  ClipboardCopy,
  Coins,
  FileText,
  HelpCircle,
  ImagePlus,
  Info,
  MousePointerClick,
  PenLine,
  Ruler,
  Tags,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/* ---------------------------------- data ---------------------------------- */

const STEPS: {
  icon: typeof PenLine
  title: string
  desc: string
  tip?: string
}[] = [
  {
    icon: MousePointerClick,
    title: 'Buka Form Produk',
    desc: 'Menu "Produk" di sidebar → klik tombol "Tambah" di kanan atas tabel.',
  },
  {
    icon: PenLine,
    title: 'Tulis Nama Produk',
    desc: 'Formula: [Jenis Barang] [Merek] [Kapasitas/Tipe] ([Kode Part]). Contoh: "Kompresor Rotary Daikin 1 PK (JT125BAY1L)".',
    tip: 'Nama lengkap = mudah ditemukan di pencarian katalog.',
  },
  {
    icon: Tags,
    title: 'Merek, SKU & Kategori',
    desc: 'Isi merek (mis: Daikin), kode internal toko (mis: CMP-DKN-1PK), lalu pilih kategori yang paling cocok dari dropdown.',
  },
  {
    icon: AlignLeft,
    title: 'Deskripsi Singkat (≤160)',
    desc: '1–2 kalimat yang tampil di kartu katalog: apa barangnya + untuk apa + keunggulan utama. Penghitung karakter sudah tersedia.',
  },
  {
    icon: FileText,
    title: 'Deskripsi Lengkap',
    desc: 'Tulis 4 paragraf dipisah Enter: fungsi part, kompatibilitas tipe AC, keunggulan/ kondisi, garansi & pengiriman.',
    tip: 'Gunakan template siap salin di bawah!',
  },
  {
    icon: Ruler,
    title: 'Spesifikasi Teknis',
    desc: 'Klik "Tambah Baris" untuk setiap detail — kolom kiri nama (mis: Voltase), kolom kanan isi (mis: 220V / 50Hz). Minimal 5 baris.',
  },
  {
    icon: Coins,
    title: 'Harga, Satuan & Stok',
    desc: 'Harga tulis angka polos tanpa titik: 1850000. Kosongkan untuk "Hubungi Kami". Stok 0 = otomatis label "Stok Habis".',
  },
  {
    icon: Camera,
    title: 'Foto & Simpan',
    desc: 'Klik area putus-putus, pilih 3–6 foto sekaligus (JPG/PNG/WEBP, maks 3MB). Foto pertama jadi foto "Utama". Terakhir klik "Simpan Produk".',
    tip: 'Tombol Simpan abu-abu? Tunggu spinner foto selesai dulu.',
  },
]

const DO_FOTO = [
  'Foto barang asli dengan latar polos (tembok putih / abu terang)',
  'Cahaya jendela siang hari, tanpa flash',
  'Rasio persegi 1:1, barang memenuhi ±80% frame',
  'Sertakan foto label tipe / kode part (zoom jelas)',
  'Kompres >3MB lewat tinypng.com sebelum upload',
]

const DONT_FOTO = [
  'Foto ambil-an internet milik toko lain / ber-watermark',
  'Foto blur, gelap, atau miring',
  'Foto iPhone format HEIC — konversi ke JPG dulu',
  'Foto berantakan dengan latar penuh barang lain',
  'Hanya 1 foto untuk sparepart (pembeli perlu cek label & port)',
]

const TEMPLATE_NAMA = `[Jenis Barang] [Merek] [Kapasitas/Tipe] ([Kode Part])
Contoh: Kompresor Rotary Daikin 1 PK (JT125BAY1L)`

const TEMPLATE_SINGKAT = `{Nama barang} untuk {aplikasi}. {Keunggulan 1 frasa} — garansi {X} bulan, stok ready.
Contoh: Kompresor rotary Daikin 1 PK untuk AC split. Original, test OK — garansi 6 bulan, stok ready.`

const TEMPLATE_LENGKAP = `{Nama barang} original untuk {jenis alat}. Berfungsi untuk {fungsi
utama part} dan cocok digunakan pada {daftar tipe}.

Spesifikasi lengkap ada di bagian spesifikasi. Barang dikirim hari yang
sama untuk order sebelum jam 15.00, dikemas bubble wrap + kayu pelapis.

Kondisi: {baru 100% / original / aftermarket}. Semua unit {dicek & ditest
sebelum dikirim}. Stok fisik ready di toko — silakan order atau
tanya-tanya dulu via WhatsApp.

Garansi {6 bulan / sesuai nota} {tukar unit / ganti baru} untuk kerusakan
pabrik. Harga langsung dari toko, makin banyak makin murah!`

const ACCORDION: { q: string; steps: string[] }[] = [
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
    q: 'Foto gagal diunggah — solusi cepat',
    steps: [
      'Pesan "melebihi 3MB" → kompres dulu di tinypng.com / squoosh.app, lalu unggah ulang.',
      'Pesan "Format harus JPG, PNG, WEBP, atau GIF" → foto iPhone biasanya HEIC: kirim ke chat WhatsApp lalu simpan dari sana (otomatis jadi JPG), atau ubah Pengaturan Kamera iPhone ke "Most Compatible".',
      'Pesan "bukan file gambar" → file yang dipilih bukan gambar (mis. PDF).',
      'Tombol "Simpan Produk" abu-abu → foto masih mengunggah; tunggu spinner "Mengunggah N foto..." selesai.',
      'Foto tidak berubah di katalog → refresh keras browser (Ctrl+F5 / tutup-buka tab).',
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

/* ------------------------------- komponen --------------------------------- */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} tersalin ke clipboard!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Gagal menyalin otomatis. Silakan salin manual.')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={copy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-teal-600" />
      ) : (
        <ClipboardCopy className="h-3.5 w-3.5" />
      )}
      {copied ? 'Tersalin' : 'Salin'}
    </Button>
  )
}

function TemplateBlock({
  title,
  desc,
  text,
  label,
}: {
  title: string
  desc: string
  text: string
  label: string
}) {
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <CopyButton text={text} label={label} />
      </div>
      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-card p-3 font-mono text-xs leading-relaxed text-muted-foreground">
        {text}
      </pre>
    </div>
  )
}

/* ---------------------------------- view ---------------------------------- */

export function PanduanView() {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Panduan singkat penggunaan dashboard. Tutorial super lengkap (dengan
          template &amp; cheat sheet cetak) ada di file{' '}
          <span className="font-mono font-semibold">
            TUTORIAL-UPLOAD-PRODUK.md
          </span>{' '}
          dan{' '}
          <span className="font-mono font-semibold">TUTORIAL.md</span> di folder
          proyek.
        </AlertDescription>
      </Alert>

      {/* Stepper: upload produk dalam 8 langkah */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">
              Upload Barang dalam 8 Langkah
            </CardTitle>
            <Badge variant="secondary">± 3 menit per barang</Badge>
          </div>
          <CardDescription>
            Alur standar menambahkan produk baru dari nol sampai tampil di
            katalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="flex gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    #{i + 1}
                  </span>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold leading-snug">
                    {s.title}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                  {s.tip && (
                    <p className="text-xs italic text-teal-600 dark:text-teal-400">
                      💡 {s.tip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standar foto produk */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-teal-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-teal-600 dark:text-teal-400">
              <ImagePlus className="h-4 w-4" />
              Standar Foto — LAKUKAN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {DO_FOTO.map((t) => (
              <div key={t} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15">
                  <Check className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-rose-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-rose-600 dark:text-rose-400">
              <ImagePlus className="h-4 w-4" />
              Standar Foto — HINDARI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {DONT_FOTO.map((t) => (
              <div key={t} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15">
                  <Check className="hidden h-3 w-3" />
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    ✕
                  </span>
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Template siap salin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Template Siap Salin untuk Kolom Form
          </CardTitle>
          <CardDescription>
            Klik &quot;Salin&quot;, tempel di kolom yang sesuai, lalu ganti kata
            di dalam {"{kurung kerawal}"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <TemplateBlock
            title="1. Nama Produk"
            desc="Kolom 'Nama Produk' — formula penamaan agar mudah dicari."
            text={TEMPLATE_NAMA}
            label="Template nama produk"
          />
          <TemplateBlock
            title="2. Deskripsi Singkat (maks 160 karakter)"
            desc="Kolom 'Deskripsi Singkat' — tampil di kartu katalog."
            text={TEMPLATE_SINGKAT}
            label="Template deskripsi singkat"
          />
          <TemplateBlock
            title="3. Deskripsi Lengkap (4 paragraf)"
            desc="Kolom 'Deskripsi Lengkap' — tampil di halaman detail produk."
            text={TEMPLATE_LENGKAP}
            label="Template deskripsi lengkap"
          />
        </CardContent>
      </Card>

      {/* Topik lainnya */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          Topik Lainnya
        </h3>
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border bg-card px-5"
        >
          {ACCORDION.map((g, i) => (
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
    </div>
  )
}
