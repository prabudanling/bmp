'use client'

import { ArrowRight, CalendarDays, Eye, MessageCircle, PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/hooks/use-api'
import { useApp } from '@/lib/store'
import { useSettings } from '@/hooks/use-settings'
import { formatDate, formatNumber, waLink } from '@/lib/format'
import type { PageDTO } from '@/lib/types'

export function PageView({ slug }: { slug: string }) {
  const navigate = useApp((s) => s.navigate)
  const settings = useSettings()
  const { data: page, loading, error } = useApi<PageDTO>(
    `/api/pages/slug/${encodeURIComponent(slug)}`
  )

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center px-4 py-24 text-center">
        <PackageSearch className="h-14 w-14 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman mungkin sudah dihapus atau belum diterbitkan.
        </p>
        <Button className="mt-5" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </Button>
      </div>
    )
  }

  return (
    <article className="pb-16">
      {/* Kepala halaman */}
      <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900 text-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16 lg:px-8">
          <nav
            className="flex items-center gap-1.5 text-xs text-teal-300/80"
            aria-label="Breadcrumb"
          >
            <button
              className="transition-colors hover:text-teal-200"
              onClick={() => navigate('/')}
            >
              Beranda
            </button>
            <span aria-hidden>/</span>
            <span className="text-white/70">{page.title}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-teal-100/80 sm:text-base">
              {page.excerpt}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-teal-200/70">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Diperbarui {formatDate(page.updatedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(page.views)} kali dibaca
            </span>
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="mx-auto w-full max-w-4xl px-4 lg:px-8">
        <div
          className="cms-content mt-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* CTA bawah */}
        {settings?.whatsapp && (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-white p-8 text-center dark:border-teal-800/40 dark:from-teal-950/40 dark:to-background">
            <h2 className="text-lg font-bold">
              Butuh part yang pas? Kami bantu carikan.
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Tim {settings.storeName || 'Berkat Mandiri Pendingin'} siap
              membantu konsultasi gratis — dari kompresor hingga sparepart
              kecil.
            </p>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() =>
                window.open(
                  waLink(
                    settings.whatsapp,
                    `Halo, saya membaca halaman "${page.title}" dan ingin bertanya.`
                  ),
                  '_blank'
                )
              }
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp Sekarang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
