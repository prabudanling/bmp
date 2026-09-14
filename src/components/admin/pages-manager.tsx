'use client'

import { useState } from 'react'
import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/client'
import { useApi } from '@/hooks/use-api'
import { formatDate, slugify } from '@/lib/format'
import type { PageDTO } from '@/lib/types'
import { RichEditor } from './rich-editor'

/** Bentuk data di dalam dialog editor */
interface DraftPage {
  id: string | null
  title: string
  slug: string
  content: string
  excerpt: string
  isPublished: boolean
  showInMenu: boolean
  sortOrder: number
}

const EMPTY_DRAFT: DraftPage = {
  id: null,
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  isPublished: true,
  showInMenu: false,
  sortOrder: 0,
}

function StatusBadge({ page }: { page: PageDTO }) {
  return page.isPublished ? (
    <Badge className="bg-teal-600 hover:bg-teal-600">Terbit</Badge>
  ) : (
    <Badge variant="secondary">Draft</Badge>
  )
}

export function PagesManager() {
  const { data, loading, refetch } = useApi<{ items: PageDTO[] }>(
    '/api/pages?all=1'
  )
  const [draft, setDraft] = useState<DraftPage | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<PageDTO | null>(null)

  const pages = data?.items || []

  const openNew = () => setDraft({ ...EMPTY_DRAFT })

  const openEdit = async (page: PageDTO) => {
    // Ambil konten lengkap (sudah ada di list ?all=1, tapi aman jika terpotong)
    try {
      const full = await api<PageDTO>(`/api/pages/${page.id}`)
      setDraft({
        id: full.id,
        title: full.title,
        slug: full.slug,
        content: full.content,
        excerpt: full.excerpt,
        isPublished: full.isPublished,
        showInMenu: full.showInMenu,
        sortOrder: full.sortOrder,
      })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const save = async () => {
    if (!draft) return
    if (!draft.title.trim()) {
      toast.error('Judul halaman wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const body = {
        title: draft.title.trim(),
        slug: draft.slug.trim() || slugify(draft.title),
        content: draft.content,
        excerpt: draft.excerpt,
        isPublished: draft.isPublished,
        showInMenu: draft.showInMenu,
        sortOrder: Number(draft.sortOrder) || 0,
      }
      if (draft.id) {
        await api(`/api/pages/${draft.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
        toast.success('Halaman berhasil diperbarui!')
      } else {
        await api('/api/pages', {
          method: 'POST',
          body: JSON.stringify(body),
        })
        toast.success('Halaman baru berhasil dibuat!')
      }
      setDraft(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    try {
      await api(`/api/pages/${deleting.id}`, { method: 'DELETE' })
      toast.success(`Halaman "${deleting.title}" dihapus.`)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Halaman Website
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {pages.length} halaman
                </span>
              </CardTitle>
              <CardDescription>
                Halaman konten bebas seperti &quot;Tentang Kami&quot;,
                &quot;FAQ&quot;, atau &quot;Kebijakan Privasi&quot;. Halaman
                yang ditandai &quot;Tampilkan di Menu&quot; otomatis masuk ke
                menu Informasi website.
              </CardDescription>
            </div>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              Halaman Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat halaman...
            </div>
          ) : pages.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              Belum ada halaman. Klik &quot;Halaman Baru&quot; untuk membuat
              halaman pertama Anda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Menu</TableHead>
                    <TableHead className="hidden md:table-cell">Dilihat</TableHead>
                    <TableHead className="hidden lg:table-cell">Diubah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-56">
                        <div className="truncate font-medium">{p.title}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          /p/{p.slug}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge page={p} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.showInMenu ? (
                          <Badge variant="outline" className="text-primary">
                            Di menu
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {p.views}×
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDate(p.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Lihat halaman"
                            aria-label={`Lihat halaman ${p.title}`}
                            onClick={() =>
                              window.open(`/#/p/${p.slug}`, '_blank')
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                            aria-label={`Edit halaman ${p.title}`}
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                            title="Hapus"
                            aria-label={`Hapus halaman ${p.title}`}
                            onClick={() => setDeleting(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog editor halaman */}
      <Dialog
        open={!!draft}
        onOpenChange={(open) => !open && !saving && setDraft(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? 'Edit Halaman' : 'Halaman Baru'}
            </DialogTitle>
            <DialogDescription>
              Gunakan toolbar untuk memformat teks seperti di Microsoft Word.
              Klik ikon gambar untuk menyisipkan foto ke dalam konten.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pg-title">Judul Halaman *</Label>
                  <Input
                    id="pg-title"
                    value={draft.title}
                    placeholder="Contoh: Cara Pemesanan"
                    onChange={(e) => {
                      const title = e.target.value
                      setDraft((d) =>
                        d
                          ? {
                              ...d,
                              title,
                              // slug otomatis dari judul hanya saat halaman baru
                              slug: d.id
                                ? d.slug
                                : slugify(title),
                            }
                          : d
                      )
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pg-slug">Alamat (slug)</Label>
                  <Input
                    id="pg-slug"
                    value={draft.slug}
                    placeholder="cara-pemesanan"
                    onChange={(e) =>
                      setDraft({ ...draft, slug: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Halaman tampil di: <b>/p/{draft.slug || '...'}</b>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pg-excerpt">Ringkasan Singkat (opsional)</Label>
                <Textarea
                  id="pg-excerpt"
                  rows={2}
                  value={draft.excerpt}
                  placeholder="Satu-dua kalimat yang muncul sebagai gambaran halaman."
                  onChange={(e) =>
                    setDraft({ ...draft, excerpt: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Isi Konten</Label>
                <RichEditor
                  value={draft.content}
                  onChange={(html) => setDraft({ ...draft, content: html })}
                />
              </div>

              <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    Terbitkan
                    <span className="block text-xs font-normal text-muted-foreground">
                      Halaman bisa dilihat pengunjung
                    </span>
                  </span>
                  <Switch
                    checked={draft.isPublished}
                    onCheckedChange={(v) =>
                      setDraft({ ...draft, isPublished: v })
                    }
                    aria-label="Terbitkan halaman"
                  />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    Tampilkan di Menu
                    <span className="block text-xs font-normal text-muted-foreground">
                      Masuk menu &quot;Informasi&quot; website
                    </span>
                  </span>
                  <Switch
                    checked={draft.showInMenu}
                    onCheckedChange={(v) =>
                      setDraft({ ...draft, showInMenu: v })
                    }
                    aria-label="Tampilkan di menu"
                  />
                </label>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pg-order">Urutan Menu</Label>
                  <Input
                    id="pg-order"
                    type="number"
                    className="w-28"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft({ ...draft, sortOrder: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Angka kecil tampil lebih dulu di menu.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setDraft(null)}
            >
              Batal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Halaman'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi hapus */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus halaman ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Halaman &quot;{deleting?.title}&quot; akan dihapus permanen dan
              tautannya tidak bisa dibuka lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={remove}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
