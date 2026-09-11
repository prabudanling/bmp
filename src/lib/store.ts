'use client'

import { create } from 'zustand'
import type { AdminUser } from './types'

interface AppState {
  /** path hash saat ini, contoh: '/', '/katalog', '/produk/slug', '/admin/produk' */
  path: string
  user: AdminUser | null
  authReady: boolean
  setPath: (p: string) => void
  navigate: (p: string) => void
  setUser: (u: AdminUser | null) => void
  setAuthReady: (b: boolean) => void
}

export const useApp = create<AppState>((set) => ({
  path: '/',
  user: null,
  authReady: false,
  setPath: (p) => set({ path: p }),
  navigate: (p) => {
    if (typeof window !== 'undefined') {
      window.location.hash = p
    }
  },
  setUser: (u) => set({ user: u }),
  setAuthReady: (b) => set({ authReady: b }),
}))
