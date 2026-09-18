'use client'

import {
  Clock,
  Code2,
  Facebook,
  Globe,
  Instagram,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Snowflake,
  Youtube,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useSettings } from '@/hooks/use-settings'
import { useApi } from '@/hooks/use-api'
import { waLink } from '@/lib/format'
import type { CategoryDTO, PageDTO } from '@/lib/types'

export function SiteFooter() {
  const navigate = useApp((s) => s.navigate)
  const settings = useSettings()
  const { data: categories } = useApi<{ items: CategoryDTO[] }>(
    '/api/categories'
  )
  // Halaman CMS untuk kolom Menu + media sosial dari Pengaturan
  const { data: pagesData } = useApi<{ items: PageDTO[] }>('/api/pages?menu=1')
  const menuPages = pagesData?.items || []
  const socials = [
    { label: 'Instagram', icon: Instagram, url: settings?.instagram || '' },
    { label: 'Facebook', icon: Facebook, url: settings?.facebook || '' },
    { label: 'TikTok', icon: Music2, url: settings?.tiktok || '' },
    { label: 'YouTube', icon: Youtube, url: settings?.youtube || '' },
  ].filter((s) => s.url.trim())
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            {settings?.logoUrl ? (
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white">
                <img
                  src={settings.logoUrl}
                  alt={settings?.storeName || 'Logo toko'}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-1"
                />
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-slate-900">
                <Snowflake className="h-5 w-5" />
              </span>
            )}
            <span className="text-base font-extrabold text-white">
              {settings?.storeName || 'Berkat Mandiri Pendingin'}
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            {settings?.tagline || 'Spesialis Kompresor & Sparepart AC'} —
            melayani pembelian satuan maupun grosir dengan pengiriman ke
            seluruh Indonesia.
          </p>
          {socials.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-teal-500/20 hover:text-teal-300"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Kategori */}
        <div>
          <h3 className="text-sm font-bold text-white">Kategori</h3>
          <ul className="mt-4 space-y-2 text-xs">
            {(categories?.items || []).slice(0, 6).map((c) => (
              <li key={c.id}>
                <button
                  className="transition-colors hover:text-teal-400"
                  onClick={() => navigate(`/katalog?kat=${c.slug}`)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu */}
        <div>
          <h3 className="text-sm font-bold text-white">Menu</h3>
          <ul className="mt-4 space-y-2 text-xs">
            {[
              { label: 'Beranda', path: '/' },
              { label: 'Katalog Produk', path: '/katalog' },
              { label: 'Kontak Kami', path: '/kontak' },
            ].map((m) => (
              <li key={m.path}>
                <button
                  className="transition-colors hover:text-teal-400"
                  onClick={() => navigate(m.path)}
                >
                  {m.label}
                </button>
              </li>
            ))}
            {menuPages.map((p) => (
              <li key={p.id}>
                <button
                  className="transition-colors hover:text-teal-400"
                  onClick={() => navigate(`/p/${p.slug}`)}
                >
                  {p.title}
                </button>
              </li>
            ))}
            <li>
              <button
                className="flex items-center gap-1.5 transition-colors hover:text-teal-400"
                onClick={() => navigate('/masuk')}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Login Admin
              </button>
            </li>
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="text-sm font-bold text-white">Kontak</h3>
          <ul className="mt-4 space-y-3 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
              {settings?.address || '-'}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-teal-400" />
              {settings?.phone || '-'}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-teal-400" />
              {settings?.email || '-'}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-teal-400" />
              {settings?.hours || '-'}
            </li>
          </ul>
          {settings?.whatsapp && (
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-500"
              onClick={() =>
                window.open(
                  waLink(
                    settings.whatsapp,
                    'Halo, saya ingin bertanya tentang produk sparepart AC.'
                  ),
                  '_blank'
                )
              }
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat WhatsApp
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-slate-500 sm:flex-row lg:px-8">
          <span>
            © {year} {settings?.storeName || 'Berkat Mandiri Pendingin'}.
            Seluruh hak cipta dilindungi.
          </span>
          <span>Kompresor & Sparepart AC — Original & Bergaransi</span>
        </div>
      </div>

      {/* Kredit — Developer & Hosting */}
      <div className="relative bg-black/25">
        {/* Hairline gradient pemberi kesan premium */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"
        />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-x-6 gap-y-2 px-4 py-3.5 text-[11px] text-slate-500 sm:flex-row lg:px-8">
          <span
            className="group inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 text-center transition-colors"
            title="Dikembangkan oleh PT Digital Bisnis Manajemen (Digiman)"
          >
            <Code2 className="h-3.5 w-3.5 text-teal-400/80 transition-transform group-hover:-rotate-6" />
            <span>Dikembangkan oleh</span>
            <span className="w-full basis-full text-center font-semibold text-slate-400 transition-colors group-hover:text-teal-300 sm:w-auto sm:basis-auto sm:text-left">
              PT Digital Bisnis Manajemen (Digiman)
            </span>
          </span>
          <span
            aria-hidden="true"
            className="hidden h-3 w-px bg-white/15 sm:block"
          />
          <span
            className="group inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 text-center transition-colors"
            title="Layanan hosting & domain oleh juraganwebsite.web.id"
          >
            <Globe className="h-3.5 w-3.5 text-teal-400/80 transition-transform group-hover:rotate-12" />
            <span>Hosting & Domain oleh</span>
            <a
              href="https://juraganwebsite.web.id"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full basis-full justify-center text-center font-semibold text-slate-400 underline decoration-dotted decoration-teal-400/40 underline-offset-2 transition-colors hover:text-teal-300 sm:w-auto sm:basis-auto sm:justify-start sm:text-left"
            >
              juraganwebsite.web.id
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
