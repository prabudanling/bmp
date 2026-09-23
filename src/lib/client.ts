/**
 * client.ts — helper fetch untuk seluruh aplikasi.
 * ============================================================
 * 1. URL '/api/...' otomatis diubah relatif ('api/...') agar
 *    situs bekerja di domain root MAUPUN di subfolder hosting.
 * 2. MODE DARURAT: bila backend PHP tidak aktif (respons bukan
 *    JSON / jaringan gagal), permintaan GET otomatis dilayani
 *    dari snapshot statis /api-cache/*.json (lihat fallback.ts)
 *    sehingga website TETAP TAMPIL dalam mode baca-saja.
 */

import { BACKEND_DEAD_MSG, fallbackFor } from '@/lib/fallback'

/** Keterangan kesalahan dari API (dipakai ulang untuk toast dsb.) */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** Sinyal bahwa endpoint API tidak merespons sebagai JSON (PHP mati dsb.) */
class DeadApiError extends Error {}

function toRelative(url: string): string {
  return url.startsWith('/') ? url.slice(1) : url
}

async function liveFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    // jaringan gagal total (server tidak terjangkau)
    throw new DeadApiError()
  }
  const text = await res.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    // bukan JSON → kemungkinan halaman error Apache / PHP fatal
    throw new DeadApiError()
  }
  if (!res.ok) {
    const message =
      (data as { error?: string })?.error || 'Terjadi kesalahan. Silakan coba lagi.'
    throw new ApiError(message, res.status)
  }
  return data as T
}

export async function api<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const rel = toRelative(url)
  const method = (init?.method || 'GET').toUpperCase()

  try {
    return await liveFetch<T>(rel, {
      ...init,
      headers:
        init?.body instanceof FormData
          ? init?.headers
          : { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
  } catch (e) {
    const dead = e instanceof DeadApiError || e instanceof TypeError
    if (!dead) throw e

    // ── MODE DARURAT ────────────────────────────────────────────────
    if (method === 'GET' && rel.startsWith('api/')) {
      const qIdx = rel.indexOf('?')
      const path = qIdx === -1 ? rel : rel.slice(0, qIdx)
      const params = new URLSearchParams(qIdx === -1 ? '' : rel.slice(qIdx + 1))
      return (await fallbackFor(path, params)) as T
    }
    throw new Error(BACKEND_DEAD_MSG)
  }
}
