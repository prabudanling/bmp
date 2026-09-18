'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion'
import { ProductCard, ProductCardSkeleton } from './product-card'
import { useApi } from '@/hooks/use-api'
import type { CategoryDTO, ProductsResponse } from '@/lib/types'

function getParam(query: string, key: string): string {
  const m = query.match(new RegExp(`[?&]${key}=([^&]*)`))
  return m ? decodeURIComponent(m[1]) : ''
}

export function CatalogView({ query }: { query: string }) {
  const [inputQ, setInputQ] = useState(() => getParam(query, 'q'))
  const [q, setQ] = useState(() => getParam(query, 'q'))
  const [category, setCategory] = useState(() => getParam(query, 'kat'))
  const [sort, setSort] = useState('terbaru')
  const [page, setPage] = useState(1)

  // Debounce pencarian
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(inputQ)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [inputQ])

  const changeCategory = (slug: string) => {
    setCategory(slug)
    setPage(1)
  }

  const changeSort = (v: string) => {
    setSort(v)
    setPage(1)
  }

  const { data: categories } = useApi<{ items: CategoryDTO[] }>('/api/categories')

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    params.set('sort', sort)
    params.set('page', String(page))
    params.set('limit', '12')
    return `/api/products?${params.toString()}`
  }, [q, category, sort, page])

  const { data, loading } = useApi<ProductsResponse>(url)

  // Gulir halus ke atas saat filter/pagination berubah (bukan saat load pertama)
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, category, sort, q])

  const resetFilter = () => {
    setInputQ('')
    setQ('')
    setCategory('')
    setSort('terbaru')
    setPage(1)
  }

  const pageNumbers = useMemo(() => {
    const pages = data?.pages || 1
    const current = data?.page || 1
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
    const arr = new Set<number>([1, pages, current - 1, current, current + 1])
    return Array.from(arr)
      .filter((n) => n >= 1 && n <= pages)
      .sort((a, b) => a - b)
  }, [data])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Katalog Produk
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {loading
            ? 'Memuat produk...'
            : `Menampilkan ${data?.items.length || 0} dari ${data?.total || 0} produk`}
        </p>
      </div>

      {/* Kontrol */}
      <Reveal>
        <Card className="mb-6 gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama produk, merek, atau SKU..."
              className="pl-9"
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              aria-label="Cari produk"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />
            <Select
              value={sort}
              onValueChange={(v) => changeSort(v)}
            >
              <SelectTrigger className="w-full sm:w-[190px]" aria-label="Urutkan produk">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terbaru">Terbaru</SelectItem>
                <SelectItem value="populer">Terpopuler</SelectItem>
                <SelectItem value="harga-asc">Harga: Rendah → Tinggi</SelectItem>
                <SelectItem value="harga-desc">Harga: Tinggi → Rendah</SelectItem>
                <SelectItem value="nama">Nama A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chip kategori */}
        <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => changeCategory('')}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              category === ''
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-primary'
            }`}
          >
            Semua
          </button>
          {(categories?.items || []).map((c) => (
            <button
              key={c.id}
              onClick={() => changeCategory(c.slug)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                category === c.slug
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-primary'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </Card>
      </Reveal>

      {/* Grid produk */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (data?.items.length || 0) === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed py-16 text-center">
          <PackageSearch className="h-12 w-12 animate-float text-muted-foreground/40" />
          <h3 className="mt-4 font-bold">Produk tidak ditemukan</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Coba ubah kata kunci pencarian atau filter kategori Anda.
          </p>
          <Button variant="outline" className="mt-4" onClick={resetFilter}>
            <RotateCcw className="h-4 w-4" />
            Reset Filter
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {data!.items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {/* Paginasi */}
          {data!.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((n, idx) => (
                <span key={n} className="flex items-center">
                  {idx > 0 && n - pageNumbers[idx - 1] > 1 && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}
                  <motion.button
                    onClick={() => setPage(n)}
                    aria-label={`Halaman ${n}`}
                    aria-current={n === page ? 'page' : undefined}
                    whileTap={{ scale: 0.85 }}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      n === page
                        ? 'text-primary-foreground'
                        : 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {/* Pil aktif meluncur halus ke nomor halaman baru */}
                    {n === page && (
                      <motion.span
                        layoutId="pg-active"
                        className="absolute inset-0 rounded-md bg-primary shadow-sm"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 34,
                        }}
                      />
                    )}
                    <span className="relative">{n}</span>
                  </motion.button>
                </span>
              ))}
              <Button
                variant="outline"
                size="icon"
                disabled={page >= (data?.pages || 1)}
                onClick={() =>
                  setPage((p) => Math.min(data?.pages || 1, p + 1))
                }
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
