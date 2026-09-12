'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Eye,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/client'
import { formatRupiah } from '@/lib/format'
import { useApi } from '@/hooks/use-api'
import { useApp } from '@/lib/store'
import type { CategoryDTO, ProductDTO, ProductsResponse } from '@/lib/types'

export function ProductsManager() {
  const navigate = useApp((s) => s.navigate)
  const [q, setQ] = useState('')
  const [debQ, setDebQ] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<ProductDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebQ(q)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [category, status])

  const { data: cats } = useApi<{ items: CategoryDTO[] }>('/api/categories')

  const url = useMemo(() => {
    const params = new URLSearchParams({
      status,
      page: String(page),
      limit: '10',
    })
    if (debQ) params.set('q', debQ)
    if (category !== 'all') params.set('category', category)
    return `/api/products?${params.toString()}`
  }, [debQ, category, status, page])

  const { data, loading, refetch } = useApi<ProductsResponse>(url)

  const toggleField = async (
    p: ProductDTO,
    field: 'isActive' | 'isFeatured',
    value: boolean
  ) => {
    try {
      await api(`/api/products/${p.id}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: value }),
      })
      toast.success(
        field === 'isActive'
          ? value
            ? 'Produk ditayangkan di katalog.'
            : 'Produk disembunyikan dari katalog.'
          : value
            ? 'Ditandai sebagai produk unggulan.'
            : 'Dihapus dari produk unggulan.'
      )
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success(`Produk "${deleteTarget.name}" dihapus.`)
      setDeleteTarget(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari nama / SKU / merek produk..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cari produk"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter kategori">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {(cats?.items || []).map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/admin/produk/baru')}>
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Tabel */}
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Daftar Produk</CardTitle>
          <CardDescription>
            {loading
              ? 'Memuat...'
              : `${data?.total || 0} produk • Halaman ${data?.page || 1} dari ${data?.pages || 1}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead>Unggulan</TableHead>
                  <TableHead className="pr-5 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="py-3 pl-5">
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (data?.items.length || 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-14 text-center">
                      <Package className="mx-auto h-10 w-10 text-muted-foreground/30" />
                      <p className="mt-3 text-sm font-semibold">
                        Belum ada produk
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Klik tombol &quot;Tambah&quot; untuk menambahkan produk
                        pertama Anda.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data!.items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                            {p.images[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                width={44}
                                height={44}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block max-w-[260px] truncate text-sm font-semibold">
                              {p.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {p.sku ? `SKU: ${p.sku}` : p.brand || '-'}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.category?.name || '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-semibold">
                        {formatRupiah(p.price)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            p.stock === 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.stock <= 3
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={p.isActive}
                          onCheckedChange={(v) => toggleField(p, 'isActive', v)}
                          aria-label={`Aktifkan produk ${p.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleField(p, 'isFeatured', !p.isFeatured)
                          }
                          aria-label="Toggle unggulan"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              p.isFeatured
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Menu aksi produk"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/produk/${p.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit Produk
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/produk/${p.slug}`)}
                            >
                              <Eye className="h-4 w-4" />
                              Lihat di Website
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              onClick={() => setDeleteTarget(p)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus Produk
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginasi */}
          {(data?.pages || 1) > 1 && (
            <div className="flex items-center justify-between border-t px-5 py-3">
              <span className="text-xs text-muted-foreground">
                Halaman {data?.page} dari {data?.pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data?.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Konfirmasi hapus */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>{' '}
              akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
