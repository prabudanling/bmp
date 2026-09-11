'use client'

import { useEffect, useState } from 'react'
import {
  Code2,
  ExternalLink,
  Globe,
  HelpCircle,
  Inbox,
  LayoutGrid,
  Loader2,
  LogOut,
  Menu,
  Package,
  Settings,
  Snowflake,
  Tags,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { api } from '@/lib/client'
import { useApp } from '@/lib/store'
import { useSettings } from '@/hooks/use-settings'
import { useApi } from '@/hooks/use-api'
import { LoginView } from '@/components/site/login-view'
import type { StatsDTO } from '@/lib/types'
import { Dashboard } from './dashboard'
import { ProductsManager } from './products-manager'
import { ProductForm } from './product-form'
import { CategoriesManager } from './categories-manager'
import { MessagesManager } from './messages-manager'
import { SettingsManager } from './settings-manager'
import { PanduanView } from './panduan'

const NAV = [
  { path: '/admin', label: 'Ringkasan', icon: LayoutGrid, match: (p: string) => p === '/admin' },
  { path: '/admin/produk', label: 'Produk', icon: Package, match: (p: string) => p.startsWith('/admin/produk') },
  { path: '/admin/kategori', label: 'Kategori', icon: Tags, match: (p: string) => p.startsWith('/admin/kategori') },
  { path: '/admin/pesan', label: 'Pesan', icon: Inbox, match: (p: string) => p.startsWith('/admin/pesan') },
  { path: '/admin/pengaturan', label: 'Pengaturan', icon: Settings, match: (p: string) => p.startsWith('/admin/pengaturan') },
  { path: '/admin/panduan', label: 'Panduan', icon: HelpCircle, match: (p: string) => p.startsWith('/admin/panduan') },
]

function SidebarContent({ path, unread }: { path: string; unread: number }) {
  const navigate = useApp((s) => s.navigate)
  const user = useApp((s) => s.user)
  const setUser = useApp((s) => s.setUser)
  const settings = useSettings()

  const logout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      /* abaikan */
    }
    setUser(null)
    toast.success('Anda telah keluar dari dashboard.')
    navigate('/')
  }

  const initials = (user?.name || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Logo */}
      <button
        className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5 text-left"
        onClick={() => navigate('/admin')}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-slate-900">
          <Snowflake className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <span className="block max-w-[160px] truncate text-sm font-bold text-white">
            {settings?.storeName || 'Berkat Mandiri Pendingin'}
          </span>
          <span className="block text-[11px] text-slate-400">Dashboard Admin</span>
        </span>
      </button>

      {/* Nav */}
      <nav
        className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Menu dashboard"
      >
        {NAV.map((item) => {
          const active = item.match(path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-500/15 text-teal-300'
                  : 'hover:bg-white/5 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
              {item.path === '/admin/pesan' && unread > 0 && (
                <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
          )
        })}
        <div className="my-3 border-t border-white/10" />
        <button
          onClick={() => navigate('/')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          Lihat Website
        </button>
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
            {initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-white">
              {user?.name}
            </div>
            <div className="truncate text-[11px] text-slate-400">
              @{user?.username}
            </div>
          </div>
          <button
            onClick={logout}
            title="Keluar"
            aria-label="Keluar dari dashboard"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {/* Kredit — Developer & Hosting */}
        <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-white/5 pt-2.5 text-[10px] text-slate-500">
          <Code2 className="h-3 w-3 shrink-0 text-teal-400/70" />
          <span className="truncate">
            by <span className="font-medium text-slate-400">Digiman</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <Globe className="h-3 w-3 shrink-0 text-teal-400/70" />
          <a
            href="https://juraganwebsite.web.id"
            target="_blank"
            rel="noopener noreferrer"
            className="truncate transition-colors hover:text-teal-300"
          >
            juraganwebsite.web.id
          </a>
        </div>
      </div>
    </div>
  )
}

function PageTitle({ path }: { path: string }) {
  const item = NAV.find((n) => n.match(path))
  if (path === '/admin/produk/baru') return 'Tambah Produk Baru'
  if (/^\/admin\/produk\/[^/]+$/.test(path)) return 'Edit Produk'
  return item?.label || 'Dashboard'
}

export function AdminApp() {
  const path = useApp((s) => s.path)
  const user = useApp((s) => s.user)
  const authReady = useApp((s) => s.authReady)
  const [mobileNav, setMobileNav] = useState(false)

  // Data pesan belum dibaca untuk badge sidebar
  const { data: stats, refetch } = useApi<StatsDTO>(
    authReady && user ? '/api/stats' : null
  )
  const unread = stats?.unreadMessages || 0

  // Refetch badge tiap pindah halaman admin atau saat ada aksi (custom event)
  useEffect(() => {
    if (user) refetch()
  }, [path, user, refetch])

  useEffect(() => {
    const onRefresh = () => refetch()
    window.addEventListener('bmp:refresh-stats', onRefresh)
    return () => window.removeEventListener('bmp:refresh-stats', onRefresh)
  }, [refetch])

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm">Memuat dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <LoginView />
      </div>
    )
  }

  let view: React.ReactNode
  if (path === '/admin') view = <Dashboard />
  else if (path === '/admin/produk') view = <ProductsManager />
  else if (path === '/admin/produk/baru') view = <ProductForm />
  else if (path.startsWith('/admin/produk/'))
    view = <ProductForm editId={path.split('/')[3]} />
  else if (path === '/admin/kategori') view = <CategoriesManager />
  else if (path === '/admin/pesan') view = <MessagesManager />
  else if (path === '/admin/pengaturan') view = <SettingsManager />
  else if (path === '/admin/panduan') view = <PanduanView />
  else view = <Dashboard />

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent path={path} unread={unread} />
      </aside>

      {/* Topbar mobile */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background px-4 py-3 lg:hidden">
        <Sheet open={mobileNav} onOpenChange={setMobileNav}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Buka menu admin">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 p-0">
            <SheetTitle className="sr-only">Menu dashboard</SheetTitle>
            <SidebarContent path={path} unread={unread} />
          </SheetContent>
        </Sheet>
        <span className="font-bold">{PageTitle({ path })}</span>
      </div>

      {/* Konten */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {/* Judul desktop */}
          <div className="mb-6 hidden lg:block">
            <h1 className="text-xl font-extrabold tracking-tight">
              {PageTitle({ path })}
            </h1>
          </div>
          {view}
        </main>
      </div>
    </div>
  )
}
