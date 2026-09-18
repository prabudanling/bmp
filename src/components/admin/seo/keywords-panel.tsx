'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarClock,
  Crosshair,
  KeyRound,
  Minus,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EASE } from '@/components/motion'
import { useApi } from '@/hooks/use-api'
import { api } from '@/lib/client'
import { formatDateTime, formatNumber } from '@/lib/format'
import type { SeoKeywordDTO } from '@/lib/types'

const EMPTY_FORM = { keyword: '', targetUrl: '/', volume: '', position: '' }

type HistoryPoint = { d: string; p: number }

/* ── Badge posisi: kecil = bagus ────────────────────────────── */
function positionBadge(position: number | null): { label: string; cls: string } {
  if (position == null)
    return { label: 'Belum dicatat', cls: 'bg-slate-100 text-slate-600' }
  if (position <= 3)
    return { label: `Top #${position}`, cls: 'bg-emerald-100 text-emerald-700' }
  if (position <= 10)
    return { label: `#${position}`, cls: 'bg-amber-100 text-amber-700' }
  return { label: `#${position}`, cls: 'bg-rose-100 text-rose-700' }
}

/* ── Sparkline premium: posisi kecil = garis naik (normalisasi terbalik) ── */
function Sparkline({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) {
    return (
      <svg
        width={96}
        height={28}
        viewBox="0 0 96 28"
        className="shrink-0"
        role="img"
        aria-label="Belum cukup data tren"
      >
        <line
          x1="2"
          y1="14"
          x2="94"
          y2="14"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
      </svg>
    )
  }

  const ps = history.map((h) => h.p)
  const min = Math.min(...ps)
  const max = Math.max(...ps)
  const range = max - min
  const pts = ps.map((p, i) => {
    const x = (i / (ps.length - 1)) * 96
    // t = 0 saat posisi terbaik (terkecil) → berada di atas grafik
    const t = range === 0 ? 0.5 : (p - min) / range
    const y = 2 + t * 24
    return { x, y }
  })
  const line = pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]

  return (
    <svg
      width={96}
      height={28}
      viewBox="0 0 96 28"
      className="shrink-0 text-teal-600"
      role="img"
      aria-label="Grafik tren posisi keyword"
    >
      <polygon points={`${line} 96,28 0,28`} fill="currentColor" opacity={0.08} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="2.5" fill="currentColor" />
    </svg>
  )
}

/* ── Ikon tren: bandingkan dua catatan posisi terakhir ──────── */
function trendTitle(history: HistoryPoint[]): string {
  if (history.length < 2) return 'Belum cukup data untuk tren'
  const last = history[history.length - 1].p
  const prev = history[history.length - 2].p
  if (last < prev) return `Membaik: #${prev} → #${last}`
  if (last > prev) return `Memburuk: #${prev} → #${last}`
  return `Stabil di #${last}`
}

function TrendIcon({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) return <Minus className="h-4 w-4 text-slate-400" />
  const last = history[history.length - 1].p
  const prev = history[history.length - 2].p
  if (last < prev) return <TrendingUp className="h-4 w-4 text-emerald-600" />
  if (last > prev) return <TrendingDown className="h-4 w-4 text-rose-600" />
  return <Minus className="h-4 w-4 text-slate-400" />
}

export function KeywordsPanel() {
  const { data, loading, error, refetch } = useApi<{ items: SeoKeywordDTO[] }>(
    '/api/seo/keywords'
  )
  const items = data?.items ?? []

  // Form tambah keyword
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)

  // Catat posisi
  const [logTarget, setLogTarget] = useState<SeoKeywordDTO | null>(null)
  const [logPos, setLogPos] = useState('')
  const [logging, setLogging] = useState(false)

  // Hapus dengan konfirmasi
  const [deleteTarget, setDeleteTarget] = useState<SeoKeywordDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const addKeyword = async (e: React.FormEvent) => {
    e.preventDefault()
    const kw = form.keyword.trim()
    if (kw.length < 3) {
      toast.error('Keyword minimal 3 karakter.')
      return
    }
    setAdding(true)
    try {
      await api('/api/seo/keywords', {
        method: 'POST',
        body: JSON.stringify({
          keyword: kw,
          targetUrl: form.targetUrl.trim() || '/',
          volume: Number(form.volume) || 0,
          position:
            form.position.trim() !== '' && !Number.isNaN(Number(form.position))
              ? Number(form.position)
              : undefined,
        }),
      })
      toast.success(`Keyword "${kw}" kini masuk daftar pantauan.`)
      setForm(EMPTY_FORM)
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setAdding(false)
    }
  }

  const openLog = (k: SeoKeywordDTO) => {
    setLogTarget(k)
    setLogPos(k.position != null ? String(k.position) : '')
  }

  const submitLog = async () => {
    if (!logTarget) return
    const pos = Number(logPos)
    if (logPos.trim() === '' || Number.isNaN(pos) || pos < 1 || pos > 100) {
      toast.error('Isi posisi valid antara 1 sampai 100.')
      return
    }
    setLogging(true)
    try {
      await api('/api/seo/keywords', {
        method: 'PUT',
        body: JSON.stringify({ id: logTarget.id, position: pos }),
      })
      toast.success(`Posisi "${logTarget.keyword}" dicatat: #${pos}.`)
      setLogTarget(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLogging(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api(`/api/seo/keywords?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      })
      toast.success(`Keyword "${deleteTarget.keyword}" dihapus dari pantauan.`)
      setDeleteTarget(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Form pantau keyword baru ─────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-amber-500" />
            Pantau Keyword Baru
          </CardTitle>
          <CardDescription>
            Pantau posisi Google untuk kata kunci utama toko — catat posisinya
            rutin agar tren terlihat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={addKeyword}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="kw-keyword">Keyword</Label>
              <Input
                id="kw-keyword"
                value={form.keyword}
                onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                placeholder="mis. jual kompresor AC murah"
                minLength={3}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kw-target">Target URL</Label>
              <Input
                id="kw-target"
                value={form.targetUrl}
                onChange={(e) => setForm((f) => ({ ...f, targetUrl: e.target.value }))}
                placeholder="/"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kw-volume">Volume pencarian/bulan</Label>
              <Input
                id="kw-volume"
                type="number"
                min={0}
                value={form.volume}
                onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}
                placeholder="mis. 1200"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kw-position">Posisi awal (opsional)</Label>
              <Input
                id="kw-position"
                type="number"
                min={1}
                max={100}
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                placeholder="mis. 12"
              />
            </div>
            <div className="flex items-end sm:col-span-1 lg:col-span-3">
              <Button
                type="submit"
                disabled={adding}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                {adding ? 'Menambahkan...' : 'Pantau Keyword'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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

      {/* ── Daftar keyword (kartu, bisa discroll) ────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <KeyRound className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-semibold">Belum ada keyword dipantau</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Tambahkan keyword di atas untuk mulai melacak peringkat Google
              halaman toko Anda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="scrollbar-thin max-h-[32rem] overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((k, i) => {
              const badge = positionBadge(k.position)
              return (
                <motion.div
                  key={k.id}
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{k.keyword}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {k.targetUrl}
                          </p>
                        </div>
                        <Badge
                          className={`shrink-0 border-transparent text-[10px] ${badge.cls}`}
                        >
                          {badge.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <Sparkline history={k.history} />
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60"
                          title={trendTitle(k.history)}
                        >
                          <TrendIcon history={k.history} />
                        </span>
                        <div className="text-right text-[11px] leading-tight text-muted-foreground">
                          <p>
                            Best:{' '}
                            <b className="text-foreground">
                              {k.bestPosition != null ? `#${k.bestPosition}` : '—'}
                            </b>
                          </p>
                          <p>
                            Volume:{' '}
                            <b className="text-foreground">
                              {formatNumber(k.volume)}
                            </b>
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
                        <span className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
                          <CalendarClock className="h-3 w-3 shrink-0" />
                          {formatDateTime(k.updatedAt)}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          <Button size="sm" variant="outline" onClick={() => openLog(k)}>
                            <Crosshair className="h-3.5 w-3.5" />
                            Catat Posisi
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                            aria-label={`Hapus keyword ${k.keyword}`}
                            onClick={() => setDeleteTarget(k)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Dialog catat posisi */}
      <Dialog open={!!logTarget} onOpenChange={(o) => !o && setLogTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Catat Posisi</DialogTitle>
            <DialogDescription>
              Posisi Google terbaru untuk{' '}
              <b className="font-mono text-foreground">{logTarget?.keyword}</b> —
              angka kecil berarti makin bagus (1 = peringkat teratas).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="log-pos">Posisi (1-100)</Label>
            <Input
              id="log-pos"
              type="number"
              min={1}
              max={100}
              value={logPos}
              onChange={(e) => setLogPos(e.target.value)}
              placeholder="mis. 7"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submitLog()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogTarget(null)} disabled={logging}>
              Batal
            </Button>
            <Button onClick={submitLog} disabled={logging}>
              {logging ? 'Menyimpan...' : 'Simpan Posisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi hapus keyword */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus keyword ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Keyword <b className="font-mono">{deleteTarget?.keyword}</b> beserta
              seluruh riwayat posisinya akan dihapus permanen dari pantauan.
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
