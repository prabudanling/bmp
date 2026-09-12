'use client'

import { useState } from 'react'
import {
  Package,
  Pencil,
  Plus,
  Tags,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from '@/components/category-icon'
import { api } from '@/lib/client'
import { useApi } from '@/hooks/use-api'
import type { CategoryDTO } from '@/lib/types'

interface EditState {
  id?: string
  name: string
  icon: string
}

export function CategoriesManager() {
  const { data, loading, refetch } = useApi<{ items: CategoryDTO[] }>(
    '/api/categories'
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [edit, setEdit] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openNew = () => {
    setEdit({ name: '', icon: 'package' })
    setDialogOpen(true)
  }

  const openEdit = (c: CategoryDTO) => {
    setEdit({ id: c.id, name: c.name, icon: c.icon })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!edit?.name.trim()) {
      toast.error('Nama kategori wajib diisi.')
      return
    }
    setSaving(true)
    try {
      if (edit.id) {
        await api(`/api/categories/${edit.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: edit.name, icon: edit.icon }),
        })
        toast.success('Kategori diperbarui.')
      } else {
        await api('/api/categories', {
          method: 'POST',
          body: JSON.stringify({ name: edit.name, icon: edit.icon }),
        })
        toast.success('Kategori baru ditambahkan.')
      }
      setDialogOpen(false)
      setEdit(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success(`Kategori "${deleteTarget.name}" dihapus.`)
      setDeleteTarget(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Kategori memudahkan pelanggan menelusuri produk Anda.
        </p>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (data?.items.length || 0) === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <Tags className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-semibold">Belum ada kategori</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Buat kategori seperti &quot;Kompresor AC&quot; atau
              &quot;Kapasitor&quot;.
            </p>
            <Button className="mt-4" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data!.items.map((c) => (
            <Card key={c.id} className="gap-3 py-5">
              <CardContent className="px-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CategoryIcon name={c.icon} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      /{c.slug}
                    </p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      <Package className="h-3 w-3" />
                      {c.productCount ?? 0} produk
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(c)}
                      aria-label={`Edit kategori ${c.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`Hapus kategori ${c.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog tambah/edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {edit?.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </DialogTitle>
            <DialogDescription>
              Nama kategori akan otomatis menjadi alamat web yang rapi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">
                Nama Kategori <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="Contoh: Kompresor AC"
                value={edit?.name || ''}
                onChange={(e) =>
                  setEdit(edit ? { ...edit, name: e.target.value } : edit)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Ikon</Label>
              <div className="grid grid-cols-8 gap-2">
                {CATEGORY_ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() =>
                      setEdit(edit ? { ...edit, icon } : edit)
                    }
                    className={`flex h-10 items-center justify-center rounded-lg border transition-colors ${
                      edit?.icon === icon
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:border-primary/40'
                    }`}
                    aria-label={`Ikon ${icon}`}
                  >
                    <CategoryIcon name={icon} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi hapus */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>{' '}
              akan dihapus. Kategori yang masih memiliki produk tidak bisa
              dihapus.
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
