'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Check,
  Copy,
  FileText,
  Images,
  Loader2,
  Search,
  Trash2,
  Upload,
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/client'
import { useApi } from '@/hooks/use-api'
import { formatDateTime } from '@/lib/format'
import type { MediaDTO } from '@/lib/types'

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaManager() {
  const { data, loading, refetch } = useApi<{ items: MediaDTO[] }>('/api/media')
  const [q, setQ] = useState('')
  const [uploading, setUploading] = useState(0)
  const [preview, setPreview] = useState<MediaDTO | null>(null)
  const [copied, setCopied] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const items = data?.items || []
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return items
    return items.filter((m) => m.name.toLowerCase().includes(term))
  }, [items, q])

  const totalBytes = items.reduce((a, m) => a + m.size, 0)

  const copyUrl = async (m: MediaDTO) => {
    try {
      await navigator.clipboard.writeText(m.url)
      setCopied(m.url)
      setTimeout(() => setCopied(''), 2000)
      toast.success('URL gambar tersalin!')
    } catch {
      toast.error('Gagal menyalin URL.')
    }
  }

  const upload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        setUploading((u) => u + 1)
        const fd = new FormData()
        fd.append('file', file)
        await api<{ url: string }>('/api/upload', {
          method: 'POST',
          body: fd,
        })
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setUploading((u) => u - 1)
      }
    }
    toast.success('Unggahan selesai!')
    refetch()
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = async (m: MediaDTO) => {
    try {
      await api(`/api/media?url=${encodeURIComponent(m.url)}`, {
        method: 'DELETE',
      })
      toast.success(`"${m.name}" dihapus.`)
      setPreview(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                <Images className="h-4 w-4 text-primary" />
                Perpustakaan Media
                <Badge variant="outline" className="font-semibold">
                  {items.length} file
                </Badge>
                <Badge variant="outline" className="font-semibold">
                  {fileSize(totalBytes)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Semua gambar yang pernah diunggah (foto produk, logo, konten
                halaman). Salin URL untuk dipakai di mana saja, atau hapus yang
                tidak terpakai.
              </CardDescription>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama file..."
                  className="pl-8"
                  aria-label="Cari media"
                />
              </div>
              <Button
                onClick={() => inputRef.current?.click()}
                disabled={uploading > 0}
              >
                {uploading > 0 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploading} file...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Unggah
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) upload(e.target.files)
            }}
            aria-label="Unggah file media"
          />

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat perpustakaan media...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              {q
                ? `Tidak ada file bernama "${q}".`
                : 'Belum ada media. Klik "Unggah" untuk menambahkan gambar.'}
            </div>
          ) : (
            <div className="scrollbar-thin grid max-h-[560px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-5">
              {filtered.map((m) => (
                <div
                  key={m.url}
                  className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  <button
                    type="button"
                    className="relative block aspect-square w-full cursor-pointer overflow-hidden bg-muted/30"
                    onClick={() => setPreview(m)}
                    aria-label={`Lihat ${m.name}`}
                  >
                    {m.isImage ? (
                      <img
                        src={m.url}
                        alt={m.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                      </span>
                    )}
                  </button>
                  <div className="space-y-1.5 p-2">
                    <div
                      className="truncate text-xs font-medium"
                      title={m.name}
                    >
                      {m.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {fileSize(m.size)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        title="Salin URL"
                        aria-label={`Salin URL ${m.name}`}
                        onClick={() => copyUrl(m)}
                      >
                        {copied === m.url ? (
                          <Check className="h-3 w-3 text-teal-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                        title="Hapus file"
                        aria-label={`Hapus ${m.name}`}
                        onClick={() => remove(m)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pratinjau */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="break-all pr-6 text-base">
              {preview?.name}
            </DialogTitle>
            <DialogDescription>
              {preview && `${fileSize(preview.size)} · ${formatDateTime(preview.mtime)}`}
            </DialogDescription>
          </DialogHeader>
          {preview?.isImage && (
            <div className="relative flex max-h-[55vh] min-h-48 items-center justify-center overflow-hidden rounded-xl border bg-white">
              <img
                src={preview.url}
                alt={preview.name}
                className="max-h-[55vh] w-auto max-w-full object-contain"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs">
              {preview?.url}
            </code>
            {preview && (
              <Button variant="outline" onClick={() => copyUrl(preview)}>
                <Copy className="h-4 w-4" />
                Salin
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
