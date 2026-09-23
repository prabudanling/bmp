'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Ban,
  Bug,
  CheckCircle2,
  EyeOff,
  Loader2,
  RotateCcw,
  ScanSearch,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EASE } from '@/components/motion'
import { useApi } from '@/hooks/use-api'
import { api } from '@/lib/client'
import type { SeoIssueDTO } from '@/lib/types'

/** Respons POST /api/seo/audit */
interface AuditResult {
  total: number
  critical: number
  warning: number
  info: number
  checkedProducts: number
  checkedCategories: number
  checkedPages: number
}

type IssueStatus = SeoIssueDTO['status']
type FilterKey = 'all' | IssueStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'OPEN', label: 'Terbuka' },
  { key: 'FIXED', label: 'Selesai' },
  { key: 'IGNORED', label: 'Diabaikan' },
]

const SEVERITY_BADGE: Record<SeoIssueDTO['severity'], string> = {
  CRITICAL: 'bg-rose-100 text-rose-700',
  WARNING: 'bg-amber-100 text-amber-700',
  INFO: 'bg-sky-100 text-sky-700',
}

const SEVERITY_LABEL: Record<SeoIssueDTO['severity'], string> = {
  CRITICAL: 'Kritis',
  WARNING: 'Peringatan',
  INFO: 'Info',
}

const STATUS_BADGE: Record<IssueStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-700',
  FIXED: 'bg-emerald-100 text-emerald-700',
  IGNORED: 'bg-slate-200 text-slate-600',
}

const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: 'Terbuka',
  FIXED: 'Selesai',
  IGNORED: 'Diabaikan',
}

export function AuditPanel({ onChanged }: { onChanged?: () => void }) {
  const { data, loading, refetch } = useApi<{ items: SeoIssueDTO[] }>(
    '/api/seo/issues'
  )
  const [filter, setFilter] = useState<FilterKey>('all')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const items = useMemo(() => data?.items ?? [], [data])

  const counts = useMemo(
    () => ({
      all: items.length,
      OPEN: items.filter((i) => i.status === 'OPEN').length,
      FIXED: items.filter((i) => i.status === 'FIXED').length,
      IGNORED: items.filter((i) => i.status === 'IGNORED').length,
    }),
    [items]
  )

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  )

  /* ── Jalankan audit penuh ─────────────────────────────────── */
  const runAudit = async () => {
    setRunning(true)
    try {
      const res = await api<AuditResult>('/api/seo/audit', { method: 'POST' })
      setResult(res)
      toast.success(
        res.total > 0
          ? `Audit selesai — ${res.total} temuan ditemukan.`
          : 'Audit selesai — situs bersih!'
      )
      refetch()
      onChanged?.()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setRunning(false)
    }
  }

  /* ── Ubah status temuan ───────────────────────────────────── */
  const setStatus = async (issue: SeoIssueDTO, status: IssueStatus) => {
    setBusyId(issue.id)
    try {
      await api('/api/seo/issues', {
        method: 'PUT',
        body: JSON.stringify({ id: issue.id, status }),
      })
      toast.success(
        status === 'FIXED'
          ? 'Temuan ditandai selesai.'
          : status === 'IGNORED'
            ? 'Temuan diabaikan.'
            : 'Temuan dibuka kembali.'
      )
      refetch()
      onChanged?.()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Kartu pemicu audit ─────────────────────────────────── */}
      <Card className="overflow-hidden border-amber-200/70">
        <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                <ScanSearch className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <CardTitle className="text-base">Audit Situs Lengkap</CardTitle>
                <CardDescription>
                  Pindai seluruh produk, kategori &amp; halaman untuk menemukan
                  masalah SEO
                </CardDescription>
              </div>
            </div>
            <Button
              size="lg"
              disabled={running}
              onClick={runAudit}
              className="h-11 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memeriksa seluruh situs...
                </>
              ) : (
                <>
                  <ScanSearch className="h-4 w-4" />
                  Jalankan Audit Penuh
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {result && (
          <CardContent className="pt-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  Total: {result.total}
                </span>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                  Kritis: {result.critical}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  Peringatan: {result.warning}
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                  Info: {result.info}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Memeriksa <b className="text-foreground">{result.checkedProducts}</b>{' '}
                produk, <b className="text-foreground">{result.checkedCategories}</b>{' '}
                kategori, <b className="text-foreground">{result.checkedPages}</b>{' '}
                halaman.
              </p>
            </motion.div>
          </CardContent>
        )}
      </Card>

      {/* ── Filter status ──────────────────────────────────────── */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter status temuan"
      >
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? 'default' : 'outline'}
            onClick={() => setFilter(f.key)}
            className={
              filter === f.key
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 hover:from-amber-300 hover:to-amber-400'
                : 'text-muted-foreground'
            }
          >
            {f.label}
            <span className="ml-0.5 rounded-full bg-black/10 px-1.5 text-[10px] font-bold tabular-nums">
              {counts[f.key]}
            </span>
          </Button>
        ))}
      </div>

      {/* ── Daftar temuan ──────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </span>
            <p className="mt-3 text-sm font-bold text-emerald-800">
              Situs bersih tanpa temuan ✨
            </p>
            <p className="mt-1 max-w-sm text-xs text-emerald-700/80">
              Semua halaman lolos pemeriksaan SEO. Pertahankan kualitasnya!
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Bug className="h-4 w-4 opacity-40" />
            Tidak ada temuan pada filter ini.
          </CardContent>
        </Card>
      ) : (
        <div className="scrollbar-thin max-h-[36rem] space-y-3 overflow-y-auto pr-1">
          {filtered.map((i) => (
            <div
              key={i.id}
              className="rounded-xl border bg-card p-4 transition-colors hover:border-amber-300/70"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SEVERITY_BADGE[i.severity]}`}
                    >
                      {SEVERITY_LABEL[i.severity]}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      {i.type}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold leading-snug">
                    {i.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {i.detail}
                  </p>
                  <code className="mt-2 inline-block max-w-full truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/70">
                    {i.target}
                  </code>
                </div>
                {i.status !== 'OPEN' && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[i.status]}`}
                  >
                    {STATUS_LABEL[i.status]}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                {i.status === 'OPEN' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === i.id}
                      onClick={() => setStatus(i, 'FIXED')}
                      className="h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {busyId === i.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Tandai Selesai
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === i.id}
                      onClick={() => setStatus(i, 'IGNORED')}
                      className="h-7 text-muted-foreground"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Abaikan
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === i.id}
                    onClick={() => setStatus(i, 'OPEN')}
                    className="h-7"
                  >
                    {busyId === i.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Buka Kembali
                  </Button>
                )}
                {i.status === 'IGNORED' && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                    <Ban className="h-3 w-3" />
                    Tidak dihitung dalam skor
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
