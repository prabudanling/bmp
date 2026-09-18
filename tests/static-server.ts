/**
 * static-server.ts — simulasi shared hosting untuk pengujian browser:
 *   - menyajikan build/deploy/ sebagai situs statis (seperti Apache)
 *   - mem-proxy /api/* ke php -S (sebagai PHP bridge)
 * Jalankan: bun tests/static-server.ts  (port 8899)
 *           php -S 127.0.0.1:8898 -t build/deploy tests/php-router.php
 */
const PORT = 8899
const PHP_UPSTREAM = 'http://127.0.0.1:8898'
const ROOT = new URL('../build/deploy/', import.meta.url).pathname

const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'application/javascript',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  json: 'application/json',
  woff2: 'font/woff2',
  txt: 'text/plain',
  xml: 'application/xml',
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    // Proxy API → PHP
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      const upstream = new URL(req.url)
      upstream.hostname = '127.0.0.1'
      upstream.port = '8898'
      const headers = new Headers(req.headers)
      headers.delete('host')
      const res = await fetch(upstream, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
        redirect: 'manual',
      })
      return new Response(res.body, { status: res.status, headers: res.headers })
    }

    // Berkas statis
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = Bun.file(ROOT + pathname.replace(/^\//, ''))
    if (file.size > 0) {
      const ext = pathname.split('.').pop()?.toLowerCase() ?? ''
      return new Response(file, {
        headers: { 'Content-Type': MIME[ext] ?? 'application/octet-stream' },
      })
    }

    // Fallback → index.html (prilaku hash-SPA; tak seharusnya terpanggil)
    const index = Bun.file(ROOT + 'index.html')
    if (index.size > 0) {
      return new Response(index, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }
    return new Response('Not found', { status: 404 })
  },
})

console.log(`Static server (simulasi hosting) di http://127.0.0.1:${PORT}`)
