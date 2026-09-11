export async function api<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const isFormData = init?.body instanceof FormData
  const res = await fetch(url, {
    ...init,
    headers: isFormData
      ? init?.headers
      : { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  let data: unknown = {}
  try {
    data = await res.json()
  } catch {
    /* respons kosong */
  }
  if (!res.ok) {
    const message =
      (data as { error?: string })?.error ||
      'Terjadi kesalahan. Silakan coba lagi.'
    throw new Error(message)
  }
  return data as T
}
