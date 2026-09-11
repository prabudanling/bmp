'use client'

import { MessageCircle } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import { waLink } from '@/lib/format'

export function WhatsAppFloat() {
  const settings = useSettings()
  if (!settings?.whatsapp) return null

  return (
    <a
      href={waLink(
        settings.whatsapp,
        'Halo, saya ingin bertanya tentang produk sparepart AC.'
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-xl transition-transform hover:scale-110 hover:bg-green-500"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-green-400/40 [animation-duration:2s]" />
      <MessageCircle className="relative h-7 w-7" />
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        Butuh bantuan? Chat kami!
      </span>
    </a>
  )
}
