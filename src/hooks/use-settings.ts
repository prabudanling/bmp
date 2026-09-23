'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/client'
import { DEFAULT_SETTINGS } from '@/lib/settings'
import type { StoreSettings } from '@/lib/types'

let cache: StoreSettings | null = null
let pending: Promise<StoreSettings> | null = null

function load(): Promise<StoreSettings> {
  if (cache) return Promise.resolve(cache)
  if (!pending) {
    pending = api<StoreSettings>('/api/settings')
      .then((d) => {
        cache = d
        return d
      })
      .catch(() => DEFAULT_SETTINGS)
  }
  return pending
}

/** Hook pengaturan toko (satu kali fetch, di-cache di memori) */
export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(cache)

  useEffect(() => {
    let alive = true
    load().then((d) => {
      if (alive) setSettings(d)
    })
    return () => {
      alive = false
    }
  }, [])

  return settings
}

/** Hapus cache agar halaman publik memuat data terbaru */
export function clearSettingsCache() {
  cache = null
  pending = null
}
