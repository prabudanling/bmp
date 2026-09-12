import type { PartnerLogo, StoreSettings } from './types'

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Berkat Mandiri Pendingin',
  tagline: 'Spesialis Kompresor & Sparepart AC',
  heroTitle: 'Kompresor & Sparepart AC Original untuk Setiap Kebutuhan',
  heroSubtitle:
    'Menyediakan kompresor AC, motor fan, kapasitor, termostat, freon, dan ratusan sparepart AC lainnya. Kualitas terjamin, harga bersahabat, pengiriman ke seluruh Indonesia.',
  whatsapp: '6281234567890',
  phone: '(021) 555-0123',
  email: 'info@berkatmandiripendingin.com',
  address: 'Jl. Raya Pendingin No. 123, Jakarta Timur, DKI Jakarta 13930',
  hours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
  about:
    'Berkat Mandiri Pendingin adalah toko spesialis kompresor dan sparepart AC yang telah dipercaya teknisi, bengkel AC, dan pemilik rumah di seluruh Indonesia. Kami menyediakan ribuan item sparepart AC mulai dari kompresor, motor fan, kapasitor, termostat, freon, hingga fitting dan aksesoris pendukung — semuanya original dan bergaransi.',
  logoUrl: '',
  partnerLogos: '[]',
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
