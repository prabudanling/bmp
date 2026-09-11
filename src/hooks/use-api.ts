'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/client'

/**
 * Hook fetch data sederhana dengan refetch.
 * url = null berarti jangan fetch (skip).
 */
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (url === null) return
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pola fetch data: loading state perlu direset saat URL berubah
    setLoading(true)
    setError(null)
    api<T>(url)
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((e: Error) => {
        if (alive) setError(e.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [url, tick])

  return { data, loading, error, refetch }
}
