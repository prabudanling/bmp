'use client'

import { Quote, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'

interface Testimonial {
  name: string
  role: string
  city: string
  text: string
  rating: number
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rudi Hartono',
    role: 'Pemilik Bengkel AC',
    city: 'Bekasi',
    text: 'Kompresor pesan pagi, sampai sorenya juga. Packing rapi banget dan barang original. Teknisi saya sekarang langganan tetap di sini.',
    rating: 5,
  },
  {
    name: 'Sari Wulandari',
    role: 'Purchasing CV Sumber Dingin',
    city: 'Jakarta',
    text: 'Sudah 3 tahun supply sparepart dari toko ini. Harga kompetitif, stok lengkap, dan selalu bisa minta invoice untuk laporan perusahaan.',
    rating: 5,
  },
  {
    name: 'Andi Pratama',
    role: 'Teknisi Pendingin Freelance',
    city: 'Tangerang',
    text: 'Sering bingung cari part AC lama yang sudah tidak diproduksi. CS-nya fast respon dan bisa bantu carikan dari jaringan distributornya.',
    rating: 5,
  },
  {
    name: 'Joko Santoso',
    role: 'Pemilik Toko Listrik Jaya',
    city: 'Surabaya',
    text: 'Kirim ke Surabaya aman, kompresor sampai tanpa cacat sedikit pun. Packing double memang beda. Recommended untuk rekan bisnis!',
    rating: 5,
  },
  {
    name: 'Maya Kusuma',
    role: 'Admin PT Anugerah Tehnik',
    city: 'Medan',
    text: 'Pembelian grosir jalan terus di sini karena harga distributor dan garansi resminya jelas. Proses retur juga tidak ribet.',
    rating: 5,
  },
  {
    name: 'Hendra Gunawan',
    role: 'Pemilik Bengkel Dingin Makmur',
    city: 'Bandung',
    text: 'Kapasitor, termostat, sampai freon R32 semua ada. Satu pintu, nggak pusing cari ke mana-mana. Harga toko pun masih bersahabat.',
    rating: 5,
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating ${n} dari 5 bintang`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < n ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function TestimonialsSection() {
  return (
    <section className="bg-muted/40 py-14" id="testimoni">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <Reveal className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Testimoni
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Kata Mereka tentang Kami
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Kepercayaan teknisi, bengkel AC, dan perusahaan di seluruh
            Indonesia adalah aset terbesar kami.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-semibold shadow-sm">
            <Stars n={5} />
            <span>4.9/5 dari 1.200+ pelanggan</span>
          </div>
        </Reveal>

        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6" gap={0.08}>
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name} from="up">
              <Card className="group relative h-full gap-3 py-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-lg">
                <CardContent className="px-5">
                  <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/10 transition-colors duration-300 group-hover:text-primary/20" />
                  <Stars n={t.rating} />
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t pt-4">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary"
                    >
                      {initials(t.name)}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-bold">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {t.role} — {t.city}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
