export interface SpecItem {
  k: string
  v: string
}

export interface CategoryDTO {
  id: string
  name: string
  slug: string
  icon: string
  productCount?: number
}

export interface ProductDTO {
  id: string
  name: string
  slug: string
  sku: string | null
  brand: string | null
  categoryId: string | null
  category: { id: string; name: string; slug: string; icon: string } | null
  price: number | null
  unit: string
  stock: number
  shortDesc: string | null
  description: string
  specs: SpecItem[]
  images: string[]
  isFeatured: boolean
  isActive: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export interface ProductsResponse {
  items: ProductDTO[]
  total: number
  page: number
  pages: number
}

export interface AdminUser {
  id: string
  username: string
  name: string
  /** ADMIN = pemilik toko penuh, SEO = SEO Analyst Super VVIP */
  role: 'ADMIN' | 'SEO'
}

export interface MessageDTO {
  id: string
  name: string
  phone: string
  email: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  tagline: string
  heroTitle: string
  heroSubtitle: string
  whatsapp: string
  phone: string
  email: string
  address: string
  /** Nama kontak person / penanggung jawab toko */
  contactPerson: string
  hours: string
  about: string
  /** URL logo perusahaan (kosong = ikon bawaan) */
  logoUrl: string
  /** JSON string array PartnerLogo — disimpan sebagai teks di tabel Setting */
  partnerLogos: string
  /** URL favicon website (kosong = mengikuti logo perusahaan / ikon bawaan) */
  faviconUrl: string
  /** Tautan media sosial (kosong = ikon tidak tampil) */
  instagram: string
  facebook: string
  youtube: string
  tiktok: string
}

/** Satu logo mitra/distributor pada strip mitra beranda */
export interface PartnerLogo {
  url: string
  name: string
}

/** Halaman konten CMS (Tentang Kami, FAQ, dll) */
export interface PageDTO {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  isPublished: boolean
  showInMenu: boolean
  sortOrder: number
  views: number
  createdAt: string
  updatedAt: string
}

/** Satu file di perpustakaan media */
export interface MediaDTO {
  name: string
  url: string
  size: number
  mtime: string
  isImage: boolean
}

export interface StatsDTO {
  productTotal: number
  productActive: number
  categoryTotal: number
  unreadMessages: number
  totalViews: number
  lowStock: { id: string; name: string; stock: number; images: string[] }[]
  recentMessages: MessageDTO[]
  recentProducts: ProductDTO[]
}

/* ============================================================
 * SEO COMMAND CENTER — Super VVIP
 * ============================================================ */

/** Meta tag satu halaman */
export interface SeoMetaDTO {
  id: string
  routePath: string
  title: string
  description: string
  keywords: string
  ogImage: string
  robots: string
  priority: number
  updatedAt: string
  /** true = masih default bawaan, belum pernah diedit */
  isDefault?: boolean
}

/** Satu keyword yang dipantau posisinya */
export interface SeoKeywordDTO {
  id: string
  keyword: string
  targetUrl: string
  position: number | null
  bestPosition: number | null
  volume: number
  history: { d: string; p: number }[]
  notes: string
  createdAt: string
  updatedAt: string
}

/** Temuan audit SEO */
export interface SeoIssueDTO {
  id: string
  type: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  title: string
  detail: string
  target: string
  status: 'OPEN' | 'FIXED' | 'IGNORED'
  createdAt: string
  updatedAt: string
}

/** Aktivitas eksklusif VVIP */
export interface SeoEventDTO {
  id: string
  actor: string
  action: string
  detail: string
  createdAt: string
}

/** Ringkasan + skor SEO keseluruhan */
export interface SeoOverviewDTO {
  score: number
  breakdown: {
    content: number // max 40
    meta: number // max 30
    keywords: number // max 15
    technical: number // max 15
  }
  stats: {
    productTotal: number
    productActive: number
    productsMissingDesc: number
    productsMissingImages: number
    productsThinContent: number
    categoryTotal: number
    pageTotal: number
    metaRows: number
    keywordsTracked: number
    keywordsWithPosition: number
    keywordsTop3: number
    avgPosition: number | null
    sitemapUrls: number
    issuesOpen: number
    issuesCritical: number
    lastAuditAt: string | null
  }
  issuesPreview: SeoIssueDTO[]
  events: SeoEventDTO[]
  jsonLd: Record<string, unknown>
  siteUrl: string
}
