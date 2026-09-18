'use client'

import { useEffect, useState } from 'react'
import {
  Bot,
  Braces,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Save,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/use-api'
import { api } from '@/lib/client'
import type { SeoOverviewDTO } from '@/lib/types'

/** Respons GET /api/seo/robots */
interface RobotsDTO {
  disallow: string[]
  text: string
  sitemapUrl: string
}

/** Salin teks ke clipboard + toast */
async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} disalin ke clipboard.`)
  } catch {
    toast.error('Gagal menyalin ke clipboard.')
  }
}

export function TechPanel() {
  /* ── Sitemap XML (fetch teks biasa) ─────────────────────────── */
  const [sitemap, setSitemap] = useState<string | null>(null)
  const [sitemapError, setSitemapError] = useState(false)

  useEffect(() => {
    let alive = true
    fetch('sitemap.xml')
      .then((res) => {
        if (!res.ok) throw new Error('Sitemap tidak tersedia.')
        return res.text()
      })
      .then((text) => {
        if (alive) setSitemap(text)
      })
      .catch(() => {
        if (alive) {
          setSitemap('')
          setSitemapError(true)
        }
      })
    return () => {
      alive = false
    }
  }, [])

  const sitemapUrlCount = sitemap
    ? (sitemap.match(/<url>/g) || []).length
    : 0

  const downloadSitemap = () => {
    if (!sitemap) return
    const blob = new Blob([sitemap], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sitemap.xml'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success('sitemap.xml terunduh.')
  }

  /* ── robots.txt ─────────────────────────────────────────────── */
  const { data: robots, refetch: refetchRobots } = useApi<RobotsDTO>(
    '/api/seo/robots'
  )
  const [robotsDraft, setRobotsDraft] = useState<string | null>(null)
  const [savingRobots, setSavingRobots] = useState(false)

  const saveRobots = async () => {
    const disallow = (robotsDraft ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    setSavingRobots(true)
    try {
      await api('/api/seo/robots', {
        method: 'PUT',
        body: JSON.stringify({ disallow }),
      })
      toast.success('robots.txt berhasil diperbarui.')
      setRobotsDraft(null)
      refetchRobots()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSavingRobots(false)
    }
  }

  /* ── Data terstruktur JSON-LD ───────────────────────────────── */
  const { data: overview } = useApi<SeoOverviewDTO>('/api/seo/overview')
  const jsonLdText = overview
    ? JSON.stringify(overview.jsonLd, null, 2)
    : ''

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ── Kartu Sitemap ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Globe className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base">Sitemap XML</CardTitle>
              <CardDescription>
                Daftar seluruh URL produk, kategori &amp; halaman
              </CardDescription>
            </div>
          </div>
          {sitemap !== null && !sitemapError && (
            <div className="shrink-0 text-right">
              <span className="block text-2xl font-extrabold tabular-nums">
                {sitemapUrlCount}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                URL terindeks
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {sitemap === null ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ) : sitemapError ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Sitemap belum tersedia — jalankan audit atau periksa koneksi.
            </p>
          ) : (
            <pre className="scrollbar-thin max-h-56 overflow-auto whitespace-pre rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
              {sitemap}
            </pre>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!sitemap}
              onClick={() => copyText(sitemap ?? '', 'Sitemap')}
            >
              <Copy className="h-3.5 w-3.5" />
              Salin
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!sitemap}
              onClick={downloadSitemap}
            >
              <Download className="h-3.5 w-3.5" />
              Unduh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Kartu robots.txt ───────────────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base">robots.txt</CardTitle>
              <CardDescription>
                Atur aturan perayapan bot mesin pencari
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {robots ? (
            <>
              <pre className="scrollbar-thin max-h-40 overflow-auto whitespace-pre rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-teal-300">
                {robots.text}
              </pre>
              <div className="space-y-1.5">
                <label
                  htmlFor="robots-disallow"
                  className="text-xs font-semibold"
                >
                  Editor Disallow
                </label>
                <Textarea
                  id="robots-disallow"
                  rows={4}
                  placeholder={'/admin\n/keranjang'}
                  value={robotsDraft ?? robots.disallow.join('\n')}
                  onChange={(e) => setRobotsDraft(e.target.value)}
                  className="min-h-20 font-mono text-xs"
                  aria-describedby="robots-disallow-hint"
                />
                <p id="robots-disallow-hint" className="text-[11px] text-muted-foreground">
                  Satu path per baris, diawali /
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="truncate font-mono text-[11px] text-muted-foreground">
                  Sitemap: {robots.sitemapUrl}
                </code>
                <Button
                  size="sm"
                  disabled={savingRobots || robotsDraft === null}
                  onClick={saveRobots}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 hover:from-amber-300 hover:to-amber-400"
                >
                  {savingRobots ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Simpan
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Kartu Data Terstruktur (JSON-LD) ───────────────────── */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Braces className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base">
                Data Terstruktur (JSON-LD)
              </CardTitle>
              <CardDescription>
                Schema.org LocalBusiness untuk rich result Google
              </CardDescription>
            </div>
          </div>
          <Badge className="shrink-0 border-transparent bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Aktif di HTML beranda
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview ? (
            <pre className="scrollbar-thin max-h-56 overflow-auto whitespace-pre rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-amber-200">
              {jsonLdText}
            </pre>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={!overview}
            onClick={() => copyText(jsonLdText, 'JSON-LD')}
          >
            <Copy className="h-3.5 w-3.5" />
            Salin
          </Button>
        </CardContent>
      </Card>

      {/* ── Kartu panduan Search Console ───────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-start space-y-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ExternalLink className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base">
                Daftarkan Situs ke Google
              </CardTitle>
              <CardDescription>
                Empat langkah menuju halaman pertama Search Console
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2.5">
            {[
              'Buka search.google.com/search-console',
              'Tambah properti domain',
              'Submit sitemap <url>/sitemap.xml',
              'Pantau performa tiap minggu',
            ].map((step, idx) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[11px] font-black text-slate-950">
                  {idx + 1}
                </span>
                <span className="text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <Button size="sm" asChild>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Google Search Console
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
