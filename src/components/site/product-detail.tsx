'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageOff,
  Link2,
  MessageCircle,
  Package,
  PackageSearch,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from './product-card'
import { useApi } from '@/hooks/use-api'
import { useSettings } from '@/hooks/use-settings'
import { formatRupiah, waLink } from '@/lib/format'
import { useApp } from '@/lib/store'
import type { ProductsResponse } from '@/lib/types'

export function ProductDetailView({ slug }: { slug: string }) {
  const navigate = useApp((s) => s.navigate)
  const settings = useSettings()
  const [imgIdx, setImgIdx] = useState(0)
  const {
    data: product,
    loading,
    error,
  } = useApi<import('@/lib/types').ProductDTO>(`/api/products/${slug}?view=1`)

  const relatedUrl = useMemo(() => {
    if (!product?.category?.slug) return null
    return `/api/products?category=${product.category.slug}&exclude=${product.id}&limit=4`
  }, [product])

  const { data: related } = useApi<ProductsResponse>(relatedUrl)

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-56" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-24 text-center lg:px-8">
        <PackageSearch className="h-14 w-14 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-bold">Produk tidak ditemukan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Produk mungkin sudah dihapus atau tautan salah.
        </p>
        <Button className="mt-5" onClick={() => navigate('/katalog')}>
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Button>
      </div>
    )
  }

  const images = product.images.length
    ? product.images
    : []
  const mainImg = images[imgIdx] || images[0]

  const orderMsg = `Halo ${settings?.storeName || 'Berkat Mandiri Pendingin'}, saya tertarik dengan produk *${product.name}*${
    product.price != null ? ` (${formatRupiah(product.price)})` : ''
  }. Apakah stoknya masih tersedia?`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Tautan produk berhasil disalin!')
    } catch {
      toast.error('Gagal menyalin tautan.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => navigate('/')}
            >
              Beranda
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => navigate('/katalog')}
            >
              Katalog
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-md">
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Galeri foto */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted/30">
            {mainImg ? (
              <Image
                src={mainImg}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            {product.isFeatured && (
              <Badge className="absolute left-3 top-3 bg-amber-500 text-white hover:bg-amber-500">
                ⭐ Produk Unggulan
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="scrollbar-thin mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === imgIdx ? 'border-primary' : 'border-transparent'
                  }`}
                  aria-label={`Foto ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} foto ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info produk */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => navigate(`/katalog?kat=${product.category!.slug}`)}
              >
                {product.category.name}
              </Badge>
            )}
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
            {product.stock > 0 ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Stok Tersedia ({product.stock} {product.unit})
              </Badge>
            ) : (
              <Badge variant="destructive">Stok Habis</Badge>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            {product.name}
          </h1>

          {product.shortDesc && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {product.shortDesc}
            </p>
          )}

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-primary">
              {formatRupiah(product.price)}
            </span>
            {product.price != null && (
              <span className="pb-1 text-sm text-muted-foreground">
                / {product.unit}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-green-600 text-white hover:bg-green-500"
              onClick={() =>
                window.open(waLink(settings?.whatsapp || '', orderMsg), '_blank')
              }
            >
              <MessageCircle className="h-5 w-5" />
              Pesan / Tanya via WhatsApp
            </Button>
            <Button size="lg" variant="outline" onClick={copyLink}>
              <Link2 className="h-5 w-5" />
              Salin Tautan
            </Button>
          </div>

          {/* Info singkat */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            {[
              { label: 'SKU', value: product.sku || '-' },
              { label: 'Merek', value: product.brand || '-' },
              {
                label: 'Kategori',
                value: product.category?.name || '-',
              },
              { label: 'Satuan', value: product.unit },
              { label: 'Stok', value: `${product.stock} ${product.unit}` },
              {
                label: 'Dilihat',
                value: `${product.views}x`,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-lg border bg-card p-2.5"
              >
                <div className="text-muted-foreground">{row.label}</div>
                <div className="mt-0.5 truncate font-semibold" title={row.value}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Konsultasi gratis — pastikan part sesuai dengan tipe AC Anda
            sebelum memesan.
          </p>
        </div>
      </div>

      {/* Deskripsi & spesifikasi */}
      <div className="mt-10">
        <Tabs defaultValue="deskripsi">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="deskripsi">Deskripsi Produk</TabsTrigger>
            <TabsTrigger value="spesifikasi">Spesifikasi</TabsTrigger>
          </TabsList>
          <TabsContent value="deskripsi" className="mt-4">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {product.description ||
                    'Belum ada deskripsi untuk produk ini. Silakan hubungi kami via WhatsApp untuk info lebih detail.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="spesifikasi" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {product.specs.length > 0 ? (
                  <div className="divide-y">
                    {product.specs.map((s, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-[140px_1fr] gap-4 px-5 py-3 text-sm sm:grid-cols-[220px_1fr] sm:px-6 ${
                          i % 2 === 1 ? 'bg-muted/40' : ''
                        }`}
                      >
                        <span className="font-semibold text-muted-foreground">
                          {s.k}
                        </span>
                        <span>{s.v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Spesifikasi belum tersedia. Hubungi kami untuk detail
                      produk.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Produk terkait */}
      {related && related.items.length > 0 && (
        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
              Produk Terkait
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/katalog?kat=${product.category?.slug || ''}`)}
            >
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
