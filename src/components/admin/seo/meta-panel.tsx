'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarClock,
  FileText,
  Gauge,
  Globe,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EASE } from '@/components/motion'
import { useApi } from '@/hooks/use-api'
import { api } from '@/lib/client'
import { formatDateTime } from '@/lib/format'
import type { SeoMetaDTO, SeoOverviewDTO } from '@/lib/types'

const ROBOTS_OPTIONS = [
  'index,follow',
  'noindex,follow',
  'index,nofollow',
  'noindex,nofollow',
]

const EMPTY_DRAFT = {
  title: '',
  description: '',
  keywords: '',
  ogImage: '',
  robots: 'index,follow',
  priority: '0.5',
}

type Draft = typeof EMPTY_DRAFT

/** Warna counter title: hijau ideal, amber hati-hati, merah di luar batas */
function titleTone(len: number): string {
  if (len >= 30 && len <= 60) return 'text-emerald-600'
  if ((len >= 20 && len < 30) || (len > 60 && len <= 65)) return 'text-amber-600'
  return 'text-rose-600'
}

function descTone(len: number): string {
  if (len >= 120 && len <= 160) return 'text-emerald-600'
  if (len >= 70 && len < 120) return 'text-amber-600'
  return 'text-rose-600'
}

/** Potong teks persis seperti Google menampilkan snippet */
function cut(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

/* ── Preview SERP gaya Google (fitur premium utama) ─────────── */
function SerpPreview({
  siteUrl,
  routePath,
  title,
  description,
}: {
  siteUrl: string
  routePath: string
  title: string
  description: string
}) {
  const shownTitle = title.trim() || 'Judul halaman akan tampil di sini'
  const shownDesc =
    description.trim() ||
    'Deskripsi meta belum diisi. Tulis deskripsi menarik agar pengguna memilih halaman ini di hasil pencarian.'
  const host = siteUrl.replace(/^https?:\/\//, '')

  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        Preview hasil pencarian Google
      </p>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <Globe className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-medium text-gray-800">
              Berkat Mandiri Pendingin
            </p>
            <p className="truncate text-xs text-[#006621]">
              {host}
              {routePath === '/' ? '' : routePath}
            </p>
          </div>
        </div>
        <p className="mt-2 truncate text-lg leading-snug text-[#1a0dab]">
          {cut(shownTitle, 60)}
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-gray-600">
          {cut(shownDesc, 160)}
        </p>
      </div>
    </div>
  )
}

export function MetaPanel() {
  const { data, loading, error, refetch } = useApi<{ items: SeoMetaDTO[] }>(
    '/api/seo/meta'
  )
  // siteUrl diambil sekali untuk preview SERP
  const { data: overview } = useApi<SeoOverviewDTO>('/api/seo/overview')
  const siteUrl = overview?.siteUrl || 'https://berkatmandiripendingin.com'

  const [editing, setEditing] = useState<SeoMetaDTO | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiNote, setAiNote] = useState<string | null>(null)

  const items = data?.items ?? []

  const openEdit = (m: SeoMetaDTO) => {
    setEditing(m)
    setAiNote(null)
    setDraft({
      title: m.title,
      description: m.description,
      keywords: m.keywords,
      ogImage: m.ogImage,
      robots: m.robots,
      priority: String(m.priority),
    })
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const priorityNum =
        draft.priority.trim() === '' || Number.isNaN(Number(draft.priority))
          ? 0.5
          : Number(draft.priority)
      await api('/api/seo/meta', {
        method: 'PUT',
        body: JSON.stringify({
          routePath: editing.routePath,
          title: draft.title,
          description: draft.description,
          keywords: draft.keywords,
          ogImage: draft.ogImage,
          robots: draft.robots,
          priority: priorityNum,
        }),
      })
      toast.success(`Meta tersimpan untuk ${editing.routePath}.`)
      setEditing(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const resetMeta = async (m: SeoMetaDTO) => {
    setResettingId(m.id)
    try {
      await api(`/api/seo/meta?routePath=${encodeURIComponent(m.routePath)}`, {
        method: 'DELETE',
      })
      toast.success(`Meta ${m.routePath} direset ke default.`)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setResettingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="flex items-center justify-between gap-3 p-4 text-sm text-rose-700">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={refetch}>
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-semibold">Belum ada meta halaman</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Daftar meta setiap route akan muncul di sini beserta status dan
              preview hasil pencarian.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(i * 0.05, 0.35),
                ease: EASE,
              }}
            >
              <Card className="h-full gap-0 py-0">
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {m.routePath}
                    </Badge>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        m.isDefault
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {m.isDefault ? 'Default' : 'Tersimpan'}
                    </span>
                  </div>

                  <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">
                    {m.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      className={`border-transparent font-mono text-[10px] ${
                        m.robots === 'index,follow'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.robots}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      <Gauge className="h-3 w-3" />
                      Priority {m.priority.toFixed(1)}
                    </Badge>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
                    <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarClock className="h-3 w-3 shrink-0" />
                      {m.isDefault
                        ? 'Belum pernah disimpan'
                        : formatDateTime(m.updatedAt)}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      {!m.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                          disabled={resettingId === m.id}
                          onClick={() => resetMeta(m)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog edit meta + preview SERP live */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && !saving && setEditing(null)}>
        <DialogContent className="scrollbar-thin max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              Edit Meta
              {editing && (
                <Badge variant="outline" className="font-mono text-[11px]">
                  {editing.routePath}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Atur title, description, dan robots agar halaman bersaing di
              Google. Preview di bawah berubah real-time.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <SerpPreview
                siteUrl={siteUrl}
                routePath={editing.routePath}
                title={draft.title}
                description={draft.description}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="meta-title">Title</Label>
                  <span
                    className={`text-[11px] font-bold tabular-nums ${titleTone(draft.title.length)}`}
                  >
                    {draft.title.length}/60 karakter
                  </span>
                </div>
                <Input
                  id="meta-title"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  placeholder="mis. Jual Kompresor AC Original & Bergaransi"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="meta-description">Description</Label>
                  <span
                    className={`text-[11px] font-bold tabular-nums ${descTone(draft.description.length)}`}
                  >
                    {draft.description.length}/160 karakter
                  </span>
                </div>
                <Textarea
                  id="meta-description"
                  rows={3}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  placeholder="Deskripsi menarik yang memancing klik pengguna..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="meta-keywords">
                    Keywords (pisahkan dengan koma)
                  </Label>
                  <Input
                    id="meta-keywords"
                    value={draft.keywords}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, keywords: e.target.value }))
                    }
                    placeholder="kompresor AC, sparepart AC, freon"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="meta-ogimage">OG Image (URL)</Label>
                  <Input
                    id="meta-ogimage"
                    value={draft.ogImage}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, ogImage: e.target.value }))
                    }
                    placeholder="https://.../og-image.png (opsional)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meta-robots">Robots</Label>
                  <Select
                    value={draft.robots}
                    onValueChange={(v) => setDraft((d) => ({ ...d, robots: v }))}
                  >
                    <SelectTrigger id="meta-robots" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROBOTS_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meta-priority">Priority (0-1)</Label>
                  <Input
                    id="meta-priority"
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={draft.priority}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, priority: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan Meta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
