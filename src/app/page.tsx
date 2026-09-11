'use client'

import { useEffect } from 'react'
import { api } from '@/lib/client'
import { useApp } from '@/lib/store'
import { PublicSite } from '@/components/site/public-site'
import { AdminApp } from '@/components/admin/admin-app'
import type { AdminUser } from '@/lib/types'

export default function Page() {
  const path = useApp((s) => s.path)
  const setPath = useApp((s) => s.setPath)
  const setUser = useApp((s) => s.setUser)
  const setAuthReady = useApp((s) => s.setAuthReady)

  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace(/^#/, '')
      setPath(h || '/')
    }
    apply()
    window.addEventListener('hashchange', apply)

    // Cek sesi login admin
    api<{ user: AdminUser | null }>('/api/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true))

    return () => window.removeEventListener('hashchange', apply)
  }, [setPath, setUser, setAuthReady])

  return path.startsWith('/admin') ? <AdminApp /> : <PublicSite />
}
