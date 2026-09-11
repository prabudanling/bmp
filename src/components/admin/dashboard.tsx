'use client'

import {
  Eye,
  Inbox,
  Package,
  PackageCheck,
  PackagePlus,
  Plus,
  Tags,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/hooks/use-api'
import { useApp } from '@/lib/store'
import { formatNumber, formatRupiah, formatDateTime } from '@/lib/format'
import type { StatsDTO } from '@/lib/types'

export function Dashboard() {
  const navigate = useApp((s) => s.navigate)
  const { data: stats, loading } = useApi<StatsDTO>('/api/stats')

  const cards = [
    {
      label: 'Total Produk',
      value: stats?.productTotal,
      icon: Package,
      color: 'bg-teal-100 text-teal-700',
    },
    {
      label: 'Produk Aktif',
      value: stats?.productActive,
      icon: PackageCheck,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Pesan Belum Dibaca',
      value: stats?.unreadMessages,
      icon: Inbox,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Total Dilihat',
      value: stats ? formatNumber(stats.totalViews) : undefined,
      icon: Eye,
      color: 'bg-violet-100 text-violet-700',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Aksi cepat */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/admin/produk/baru')}>
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/kategori')}>
          <Tags className="h-4 w-4" />
          Kelola Kategori
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/produk')}>
          <PackagePlus className="h-4 w-4" />
          Daftar Produk
        </Button>
      </div>

      {/* Kartu statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="gap-2 py-5">
            <CardContent className="flex items-center gap-4 px-5">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.color}`}
              >
                <c.icon className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                <span className="block text-2xl font-extrabold">
                  {loading ? (
                    <Skeleton className="h-7 w-14" />
                  ) : (
                    c.value ?? '0'
                  )}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {c.label}
                </span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pesan terbaru */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Pesan Terbaru</CardTitle>
              <CardDescription>
                Pertanyaan masuk dari form kontak website
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/pesan')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : (stats?.recentMessages.length || 0) === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada pesan masuk.
              </p>
            ) : (
              stats!.recentMessages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate('/admin/pesan')}
                  className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40"
                >
                  <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {m.name.charAt(0).toUpperCase()}
                    {!m.isRead && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          m.isRead ? 'font-medium' : 'font-bold'
                        }`}
                      >
                        {m.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatDateTime(m.createdAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                      {m.message}
                    </span>
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Stok menipis */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Stok Menipis</CardTitle>
              <CardDescription>
                Produk aktif dengan stok 3 atau kurang
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/produk')}
            >
              Kelola
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : (stats?.lowStock.length || 0) === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Semua stok aman. 👍
              </p>
            ) : (
              stats!.lowStock.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/admin/produk/${p.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {p.name}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      p.stock === 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {p.stock === 0 ? 'Habis' : `Sisa ${p.stock}`}
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Produk terbaru */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Produk Terbaru</CardTitle>
              <CardDescription>5 produk yang terakhir ditambahkan</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/produk')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : (stats?.recentProducts.length || 0) === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada produk. Klik &quot;Tambah Produk&quot; untuk mulai
                berjualan.
              </p>
            ) : (
              stats!.recentProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/admin/produk/${p.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {p.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {p.category?.name || 'Tanpa kategori'} • {formatRupiah(p.price)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      p.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
