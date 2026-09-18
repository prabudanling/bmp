'use client'

import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Package,
  Snowflake,
  Star,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryIcon } from '@/components/category-icon'
import { ProductCard, ProductCardSkeleton } from './product-card'
import { ContactSection, TrustRow } from './contact-section'
import { useApi } from '@/hooks/use-api'
import { useSettings } from '@/hooks/use-settings'
import { parsePartners } from '@/lib/settings'
import { waLink } from '@/lib/format'
import { useApp } from '@/lib/store'
import type { CategoryDTO, ProductsResponse } from '@/lib/types'

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Produk Original & Bergaransi',
    desc: 'Semua sparepart 100% baru, bukan rekondisi, dengan garansi resmi toko.',
  },
  {
    icon: Package,
    title: 'Stok Lengkap & Terbaru',
    desc: 'Ribuan item untuk berbagai merek dan tipe AC, dari kompresor hingga aksesoris kecil.',
  },
  {
    icon: ArrowRight,
    title: 'Pengiriman Cepat & Aman',
    desc: 'Packing double untuk barang rapuh, dikirim ke seluruh Indonesia setiap hari.',
  },
  {
    icon: Users,
    title: 'Pengalaman Bertahun-tahun',
    desc: 'Dipercaya teknisi, bengkel AC, dan ribuan pelanggan rumah tangga.',
  },
]

const BRANDS = [
  'Daikin',
  'Panasonic',
  'LG',
  'Gree',
  'Mitsubishi',
  'Sharp',
  'Samsung',
  'Midea',
  'Hitachi',
  'Aqua',
]

export function HomeView() {
  const navigate = useApp((s) => s.navigate)
  const settings = useSettings()
  const partnerLogos = parsePartners(settings?.partnerLogos)
  const { data: categories, loading: catLoading } = useApi<{
    items: CategoryDTO[]
  }>('/api/categories')
  const { data: featured, loading: featLoading } = useApi<ProductsResponse>(
    '/api/products?featured=1&limit=8'
  )
  const { data: allProducts } = useApi<ProductsResponse>('/api/products?limit=1')

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero-pattern relative overflow-hidden bg-slate-900">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-300">
              <Snowflake className="h-3.5 w-3.5" />
              Toko Sparepart AC Terpercaya
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {settings?.heroTitle ||
                'Kompresor & Sparepart AC Original untuk Setiap Kebutuhan'}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {settings?.heroSubtitle ||
                'Menyediakan kompresor AC, motor fan, kapasitor, termostat, freon, dan ratusan sparepart AC lainnya.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-teal-500 text-slate-900 hover:bg-teal-400"
                onClick={() => navigate('/katalog')}
              >
                Lihat Katalog Produk
                <ArrowRight className="h-4 w-4" />
              </Button>
              {settings?.whatsapp && (
                <Button
                  size="lg"
                  className="bg-green-600 text-white hover:bg-green-500"
                  onClick={() =>
                    window.open(
                      waLink(
                        settings.whatsapp,
                        'Halo, saya ingin bertanya tentang produk sparepart AC.'
                      ),
                      '_blank'
                    )
                  }
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat WhatsApp
                </Button>
              )}
            </div>
            <TrustRow />
          </div>

          <div className="relative animate-fade-up delay-1" aria-hidden="true">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src="uploads/hero.png"
                alt="Toko sparepart AC Berkat Mandiri Pendingin"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-4 rounded-xl bg-white p-3 shadow-xl sm:left-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Star className="h-5 w-5 fill-current" />
                </span>
                <span className="leading-tight">
                  <span className="block text-lg font-extrabold text-slate-900">
                    10+ Tahun
                  </span>
                  <span className="block text-xs text-slate-500">
                    Pengalaman industri
                  </span>
                </span>
              </div>
            </div>
            <div className="absolute -top-4 right-4 hidden rounded-xl bg-white p-3 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                  <Package className="h-5 w-5" />
                </span>
                <span className="leading-tight">
                  <span className="block text-lg font-extrabold text-slate-900">
                    {allProducts ? `${allProducts.total}+` : '500+'}
                  </span>
                  <span className="block text-xs text-slate-500">
                    Item ready stok
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KATEGORI ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Kategori
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Belanja per Kategori
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Temukan sparepart yang Anda butuhkan lebih cepat berdasarkan
            kategori produk.
          </p>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(categories?.items || []).map((cat, i) => (
              <button
                key={cat.id}
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => navigate(`/katalog?kat=${cat.slug}`)}
                aria-label={`Kategori ${cat.name}`}
              >
                <Card className="h-full gap-2 py-5 text-center transition-all group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="px-2">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <CategoryIcon name={cat.icon} className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-semibold leading-tight">
                      {cat.name}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {cat.productCount ?? 0} produk
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ===== PRODUK UNGGULAN ===== */}
      <section className="bg-muted/40 py-14">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Produk Pilihan
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Produk Unggulan
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Sparepart yang paling sering dicari dan dipesan pelanggan kami.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/katalog')}
              className="gap-2"
            >
              Lihat Semua Produk
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : (featured?.items || []).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
            {!featLoading && (featured?.items.length || 0) === 0 && (
              <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Belum ada produk unggulan. Admin bisa mengaturnya dari
                dashboard.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== KENAPA KAMI ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Keunggulan
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Kenapa Pilih {settings?.storeName || 'Kami'}?
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className="animate-fade-up gap-3 py-6"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="px-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== TENTANG ===== */}
      <section className="bg-muted/40 py-14" id="tentang">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl shadow-lg">
            <img
              src="uploads/teknisi.png"
              alt="Teknisi sedang memperbaiki AC"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Tentang Kami
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Mitra Terpercaya Teknisi & Pemilik AC
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {settings?.about ||
                'Berkat Mandiri Pendingin adalah toko spesialis kompresor dan sparepart AC yang telah dipercaya ribuan pelanggan.'}
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                'Harga langsung dari distributor, tanpa perantara',
                'Konsultasi gratis untuk mencari part yang tepat',
                'Garansi resmi untuk produk kompresor & motor',
                'Support purna jual — retur mudah jika tidak sesuai',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== MEREK / MITRA ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {partnerLogos.length > 0
            ? 'Mitra & Distributor Kami'
            : 'Sparepart untuk Berbagai Merek AC'}
        </p>
        {partnerLogos.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {partnerLogos.map((p, i) => (
              <div
                key={p.url + i}
                className="group flex flex-col items-center gap-2.5 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="relative flex h-12 w-full items-center justify-center">
                  <img
                    src={p.url}
                    alt={p.name || `Logo mitra ${i + 1}`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
                {p.name && (
                  <p className="text-center text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                    {p.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {BRANDS.map((b) => (
              <span
                key={b}
                className="rounded-full border bg-card px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 lg:px-8">
        <div className="hero-pattern relative overflow-hidden rounded-2xl bg-teal-800 px-6 py-10 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl" />
          <h2 className="relative text-xl font-extrabold text-white sm:text-2xl">
            Tidak Menemukan Sparepart yang Dicari?
          </h2>
          <p className="relative mx-auto mt-2 max-w-xl text-sm text-teal-100/80">
            Kirimkan tipe AC dan nama part yang Anda butuhkan — tim kami akan
            mencarikan dari jaringan distributor kami.
          </p>
          {settings?.whatsapp && (
            <Button
              size="lg"
              className="relative mt-5 bg-white text-teal-800 hover:bg-teal-50"
              onClick={() =>
                window.open(
                  waLink(
                    settings.whatsapp,
                    'Halo, saya mencari sparepart AC dengan detail berikut: '
                  ),
                  '_blank'
                )
              }
            >
              <MessageCircle className="h-5 w-5" />
              Minta Bantuan Pencarian Part
            </Button>
          )}
        </div>
      </section>

      {/* ===== KONTAK ===== */}
      <div className="bg-muted/40">
        <ContactSection />
      </div>
    </>
  )
}
