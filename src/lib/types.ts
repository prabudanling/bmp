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
  hours: string
  about: string
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
