export function formatRupiah(value?: number | null): string {
  if (value == null) return 'Hubungi Kami'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function waDigits(phone: string): string {
  let d = (phone || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '62' + d.slice(1)
  return d
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(text)}`
}
