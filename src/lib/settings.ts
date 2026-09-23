import type { PartnerLogo, StoreSettings } from './types'

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Berkat Mandiri Pendingin',
  tagline: 'Spesialis Kompresor & Sparepart AC',
  heroTitle: 'Kompresor & Sparepart AC Original untuk Setiap Kebutuhan',
  heroSubtitle:
    'Menyediakan kompresor AC, motor fan, kapasitor, termostat, freon, dan ratusan sparepart AC lainnya. Kualitas terjamin, harga bersahabat, pengiriman ke seluruh Indonesia.',
  whatsapp: '+62 812-5000-3323',
  phone: '(021) 22682617',
  email: 'berkatmandiripendingin@gmail.com',
  address:
    'Jalan Hayam Wuruk No.2 - 5 Gedung New Harco Glodok Lantai 1 Blok C 45, Jakarta Barat, DKI Jakarta, Indonesia, 11180',
  contactPerson: 'Mr. Encep Sihabudin',
  hours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
  about:
    'Berkat Mandiri Pendingin adalah toko spesialis kompresor dan sparepart AC yang telah dipercaya teknisi, bengkel AC, dan pemilik rumah di seluruh Indonesia. Kami menyediakan ribuan item sparepart AC mulai dari kompresor, motor fan, kapasitor, termostat, freon, hingga fitting dan aksesoris pendukung — semuanya original dan bergaransi.',
  logoUrl: '',
  partnerLogos: '[]',
  faviconUrl: '',
  instagram: '',
  facebook: '',
  youtube: '',
  tiktok: '',
}

/** Parse JSON daftar logo mitra dengan aman (fallback ke array kosong) */
export function parsePartners(json: string | undefined | null): PartnerLogo[] {
  try {
    const raw = JSON.parse(json || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter(
        (p): p is PartnerLogo =>
          !!p && typeof p.url === 'string' && p.url.trim() !== ''
      )
      .map((p) => ({ url: p.url, name: typeof p.name === 'string' ? p.name : '' }))
  } catch {
    return []
  }
}
