'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CheckCircle2,
  Download,
  FileJson,
  Loader2,
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
import { formatDateTime } from '@/lib/format'
import type { SeoOverviewDTO } from '@/lib/types'

const LAPORAN_ITEMS = [
  'Skor & breakdown SEO',
  'Semua meta halaman',
  'Keyword + riwayat posisi',
  'Seluruh temuan audit & statusnya',
  '100 aktivitas terakhir',
  'Ringkasan produk',
]

export function ReportPanel() {
  const { data: overview, loading } = useApi<SeoOverviewDTO>(
    '/api/seo/overview'
  )
  const [downloading, setDownloading] = useState(false)

  /* ── Unduh laporan JSON lengkap ─────────────────────────────── */
  const downloadReport = async () => {
    setDownloading(true)
    try {
      const res = await fetch('api/seo/report')
      if (!res.ok) throw new Error('Gagal mengunduh laporan. Coba lagi.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seo-report-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Laporan terunduh')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Kartu unduh laporan ──────────────────────────────── */}
        <Card className="relative overflow-hidden border-amber-200/70">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-amber-300/15 blur-2xl" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                <FileJson className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <CardTitle className="text-base">
                  Unduh Laporan Lengkap
                </CardTitle>
                <CardDescription>
                  Satu berkas JSON berisi seluruh kondisi SEO situs Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Arsipkan laporan ini sebagai bukti performa SEO, lampirkan pada
              laporan bulanan, atau gunakan sebagai pembanding sebelum-sesudah
              optimasi. Berkas dibuat langsung dari data terbaru — tanpa cache.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Button
                size="lg"
                disabled={downloading}
                onClick={downloadReport}
                className="h-11 w-full bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 sm:w-auto"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyiapkan berkas...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Unduh Laporan JSON
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* ── Kartu isi laporan ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Isi Laporan</CardTitle>
            <CardDescription>
              Semua yang tercakup di dalam berkas unduhan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {LAPORAN_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ── Jejak aktivitas VVIP ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-amber-500" />
            Jejak Aktivitas VVIP
          </CardTitle>
          <CardDescription>
            Riwayat lengkap setiap tindakan di Command Center
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !overview ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : (overview?.events.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada aktivitas.
            </p>
          ) : (
            <div className="scrollbar-thin max-h-80 space-y-3 overflow-y-auto pr-1">
              {overview!.events.map((e) => (
                <div key={e.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Activity className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{e.detail}</p>
                    <p className="text-[11px] text-muted-foreground">
                      @{e.actor} · {formatDateTime(e.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
