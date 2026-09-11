'use client'

import { useState, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import {
  Clock,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Snowflake,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useApp } from '@/lib/store'
import { useSettings } from '@/hooks/use-settings'
import { waLink } from '@/lib/format'

const NAV = [
  { label: 'Beranda', path: '/' },
  { label: 'Katalog', path: '/katalog' },
  { label: 'Kontak', path: '/kontak' },
]

export function SiteHeader() {
  const navigate = useApp((s) => s.navigate)
  const path = useApp((s) => s.path)
  const settings = useSettings()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  // Anti-mismatch hydration: false saat SSR, true setelah mount di klien
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isActive = (p: string) => path === p

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Bar atas */}
      <div className="hidden bg-teal-900 text-white/85 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs lg:px-8">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {settings?.address || 'Alamat toko'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {settings?.hours || 'Jam operasional'}
            </span>
          </div>
          <div className="flex items-center gap-5">
            {settings?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {settings.phone}
              </span>
            )}
            {settings?.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {settings.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bar utama */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          {/* Logo */}
          <button
            className="flex items-center gap-2.5 text-left"
            onClick={() => navigate('/')}
            aria-label="Ke beranda"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Snowflake className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight">
                {settings?.storeName || 'Berkat Mandiri Pendingin'}
              </span>
              <span className="hidden text-[11px] text-muted-foreground sm:block">
                {settings?.tagline || 'Spesialis Kompresor & Sparepart AC'}
              </span>
            </span>
          </button>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Menu utama">
            {NAV.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'secondary' : 'ghost'}
                className={
                  isActive(item.path)
                    ? 'font-semibold text-primary'
                    : 'text-foreground/80'
                }
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Ganti tema terang/gelap"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {settings?.whatsapp && (
              <Button
                className="hidden bg-green-600 text-white hover:bg-green-700 sm:inline-flex"
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
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              aria-label="Masuk dashboard admin"
              onClick={() => navigate('/masuk')}
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>

            {/* Menu mobile */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="flex items-center gap-2 text-base font-bold">
                  <Snowflake className="h-5 w-5 text-primary" />
                  {settings?.storeName || 'Berkat Mandiri Pendingin'}
                </SheetTitle>
                <nav className="mt-6 flex flex-col gap-1" aria-label="Menu mobile">
                  {NAV.map((item) => (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'secondary' : 'ghost'}
                      className="justify-start"
                      onClick={() => {
                        setOpen(false)
                        navigate(item.path)
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                  {settings?.whatsapp && (
                    <Button
                      className="mt-2 justify-start bg-green-600 text-white hover:bg-green-700"
                      onClick={() => {
                        setOpen(false)
                        window.open(
                          waLink(
                            settings.whatsapp,
                            'Halo, saya ingin bertanya tentang produk sparepart AC.'
                          ),
                          '_blank'
                        )
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat WhatsApp
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setOpen(false)
                      navigate('/masuk')
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Login Admin
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
