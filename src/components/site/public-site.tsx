'use client'

import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from './site-header'
import { SiteFooter } from './footer'
import { HomeView } from './home-view'
import { CatalogView } from './catalog-view'
import { ProductDetailView } from './product-detail'
import { PageView } from './page-view'
import { LoginView } from './login-view'
import { WhatsAppFloat } from './whatsapp-float'
import { ContactSection } from './contact-section'
import { useApp } from '@/lib/store'

function NotFoundView() {
  const navigate = useApp((s) => s.navigate)
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <PackageSearch className="h-14 w-14 text-muted-foreground/40" />
      <h1 className="mt-4 text-xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tautan yang Anda buka tidak tersedia.
      </p>
      <Button className="mt-5" onClick={() => navigate('/')}>
        Kembali ke Beranda
      </Button>
    </div>
  )
}

export function PublicSite() {
  const path = useApp((s) => s.path)

  let content: React.ReactNode
  if (path === '/' || path === '') {
    content = <HomeView />
  } else if (path.startsWith('/katalog')) {
    content = <CatalogView query={path} />
  } else if (path.startsWith('/produk/')) {
    const slug = decodeURIComponent(path.replace('/produk/', '').split('?')[0])
    content = <ProductDetailView slug={slug} />
  } else if (path.startsWith('/p/')) {
    const slug = decodeURIComponent(path.replace('/p/', '').split('?')[0])
    content = <PageView slug={slug} />
  } else if (path === '/masuk') {
    content = <LoginView />
  } else if (path === '/kontak') {
    content = (
      <div className="pt-2">
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Kontak Kami
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Hubungi tim {`Berkat Mandiri Pendingin`} untuk pertanyaan,
            konsultasi part, atau kerja sama grosir.
          </p>
        </div>
        <ContactSection />
      </div>
    )
  } else {
    content = <NotFoundView />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{content}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  )
}
