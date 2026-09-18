'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Bot,
  Bug,
  Crown,
  FileText,
  Globe,
  KeyRound,
  LayoutGrid,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EASE } from '@/components/motion'
import { useApi } from '@/hooks/use-api'
import { formatDateTime } from '@/lib/format'
import type { SeoIssueDTO, SeoOverviewDTO } from '@/lib/types'
import { AuditPanel } from './audit-panel'
import { KeywordsPanel } from './keywords-panel'
import { MetaPanel } from './meta-panel'
import { ReportPanel } from './report-panel'
import { TechPanel } from './tech-panel'

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: 'bg-rose-100 text-rose-700 ring-rose-200',
  WARNING: 'bg-amber-100 text-amber-700 ring-amber-200',
  INFO: 'bg-sky-100 text-sky-700 ring-sky-200',
}

const EVENT_ICON: Record<string, typeof Activity> = {
  'audit.run': ScanSearch,
  'meta.update': FileText,
  'meta.reset': FileText,
  'keyword.add': KeyRound,
  'keyword.log': TrendingUp,
  'keyword.delete': KeyRound,
  'issue.status': ShieldCheck,
  'robots.update': Bot,
  'seo.init': Sparkles,
}

/** Cincin skor SEO beranimasi */
function ScoreRing({ score }: { score: number }) {
  const R = 56
  const C = 2 * Math.PI * R
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#fb7185'
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          strokeWidth="12"
          className="stroke-white/10"
        />
        <motion.circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (C * score) / 100 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tabular-nums text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Skor SEO</span>
      </div>
    </div>
  )
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-bold tabular-nums text-white">
          {value}
          <span className="text-white/40">/{max}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-amber-300"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: EASE }}
        />
      </div>
    </div>
  )
}

function OverviewPanel({
  overview,
  loading,
  onRefetch,
  onNavigate,
}: {
  overview: SeoOverviewDTO | null
  loading: boolean
  onRefetch: () => void
  onNavigate: (tab: string) => void
}) {
  if (loading && !overview) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }
  if (!overview) return null

  const s = overview.stats
  const chips = [
    { label: 'Produk Aktif', value: s.productActive, icon: LayoutGrid },
    { label: 'URL Sitemap', value: s.sitemapUrls, icon: Globe },
    { label: 'Keyword Dipantau', value: s.keywordsTracked, icon: KeyRound },
    {
      label: 'Temuan Terbuka',
      value: s.issuesOpen,
      icon: Bug,
      danger: s.issuesCritical > 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Kartu skor */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white">
          <CardContent className="flex items-center gap-6 p-6">
            <ScoreRing score={overview.score} />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h2 className="text-lg font-bold leading-tight">
                  {overview.score >= 80
                    ? 'Luar biasa — kelas dunia! 🏆'
                    : overview.score >= 60
                      ? 'Bagus — terus dioptimalkan 💪'
                      : 'Perlu perhatian serius ⚠️'}
                </h2>
                <p className="mt-0.5 text-xs text-white/50">
                  Audit terakhir:{' '}
                  {s.lastAuditAt ? formatDateTime(s.lastAuditAt) : 'belum pernah'}
                </p>
              </div>
              <Bar label="Konten Produk" value={overview.breakdown.content} max={40} />
              <Bar label="Meta Halaman" value={overview.breakdown.meta} max={30} />
              <Bar label="Keyword" value={overview.breakdown.keywords} max={15} />
              <Bar label="Teknis" value={overview.breakdown.technical} max={15} />
            </div>
          </CardContent>
        </Card>

        {/* Chip statistik */}
        <div className="grid grid-cols-2 gap-4">
          {chips.map((c) => (
            <Card key={c.label} className="gap-2 py-5">
              <CardContent className="flex items-center gap-3 px-5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    c.danger ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  <c.icon className="h-5 w-5" />
                </span>
                <span className="leading-tight">
                  <span className="block text-2xl font-extrabold tabular-nums">{c.value}</span>
                  <span className="block text-[11px] text-muted-foreground">{c.label}</span>
                </span>
              </CardContent>
            </Card>
          ))}
          <Card className="col-span-2 py-4">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
              <div className="text-xs text-muted-foreground">
                Rata-rata posisi keyword:{' '}
                <b className="text-foreground">
                  {s.avgPosition != null ? `#${s.avgPosition}` : '—'}
                </b>{' '}
                · Top 3: <b className="text-foreground">{s.keywordsTop3}</b> · Deskripsi kosong:{' '}
                <b className={s.productsMissingDesc > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {s.productsMissingDesc}
                </b>
              </div>
              <Button size="sm" variant="outline" onClick={onRefetch}>
                <RefreshCw className="h-3.5 w-3.5" />
                Segarkan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Temuan teratas */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Temuan Teratas</CardTitle>
              <CardDescription>Urut berdasarkan tingkat keparahan</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('audit')}>
              Buka Audit
            </Button>
          </CardHeader>
          <CardContent className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {overview.issuesPreview.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Tidak ada temuan terbuka. Situs bersih! ✨
              </p>
            ) : (
              overview.issuesPreview.map((i: SeoIssueDTO) => (
                <div key={i.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">{i.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${SEVERITY_STYLE[i.severity]}`}
                    >
                      {i.severity}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.detail}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Aktivitas eksklusif */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-amber-500" />
              Jejak Aktivitas VVIP
            </CardTitle>
            <CardDescription>8 aktivitas terakhir di Command Center</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {overview.events.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Belum ada aktivitas.</p>
            ) : (
              overview.events.map((e) => {
                const Icon = EVENT_ICON[e.action] ?? Activity
                return (
                  <div key={e.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{e.detail}</p>
                      <p className="text-[11px] text-muted-foreground">
                        @{e.actor} · {formatDateTime(e.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function SeoCenter({ username }: { username: string }) {
  const { data: overview, loading, refetch } = useApi<SeoOverviewDTO>('/api/seo/overview')
  const [tab, setTab] = useState('ringkasan')

  return (
    <div className="space-y-6">
      {/* ── Header premium Super VVIP ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 p-6 text-white sm:p-8">
        {/* Ornamen cahaya */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center gap-5">
          <motion.span
            initial={{ rotate: -30, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
          >
            <Crown className="h-7 w-7" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                SEO Command Center
              </h1>
              <span className="rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-950">
                Super VVIP
              </span>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Ruang kendali eksklusif untuk menguasai peringkat Google — diakses oleh{' '}
              <b className="text-amber-300">@{username}</b>
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs text-white/60 ring-1 ring-white/10 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Koneksi terenkripsi · Akses terbatas
          </div>
        </div>
      </div>

      {/* ── Panel-tab ─────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto w-max min-w-full gap-1 sm:w-max">
            <TabsTrigger value="ringkasan" className="gap-1.5 px-3">
              <LayoutGrid className="h-4 w-4" />
              Ringkasan
            </TabsTrigger>
            <TabsTrigger value="meta" className="gap-1.5 px-3">
              <FileText className="h-4 w-4" />
              Meta &amp; SERP
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-1.5 px-3">
              <KeyRound className="h-4 w-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 px-3">
              <ScanSearch className="h-4 w-4" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="teknis" className="gap-1.5 px-3">
              <Bot className="h-4 w-4" />
              Teknis
            </TabsTrigger>
            <TabsTrigger value="laporan" className="gap-1.5 px-3">
              <Sparkles className="h-4 w-4" />
              Laporan
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ringkasan" className="mt-4">
          <OverviewPanel
            overview={overview}
            loading={loading}
            onRefetch={refetch}
            onNavigate={setTab}
          />
        </TabsContent>
        <TabsContent value="meta" className="mt-4">
          <MetaPanel />
        </TabsContent>
        <TabsContent value="keywords" className="mt-4">
          <KeywordsPanel />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditPanel onChanged={refetch} />
        </TabsContent>
        <TabsContent value="teknis" className="mt-4">
          <TechPanel />
        </TabsContent>
        <TabsContent value="laporan" className="mt-4">
          <ReportPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
