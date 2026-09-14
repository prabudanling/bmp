'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  AppWindow,
  Building2,
  Eye,
  EyeOff,
  Handshake,
  ImagePlus,
  KeyRound,
  Loader2,
  Save,
  Snowflake,
  Store,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/client'
import { clearSettingsCache, useSettings } from '@/hooks/use-settings'
import { parsePartners } from '@/lib/settings'
import type { PartnerLogo, StoreSettings } from '@/lib/types'

const FIELDS: {
  key: keyof StoreSettings
  label: string
  hint?: string
  type?: 'text' | 'textarea'
  placeholder?: string
}[] = [
  { key: 'storeName', label: 'Nama Toko', placeholder: 'Berkat Mandiri Pendingin' },
  { key: 'tagline', label: 'Tagline', placeholder: 'Spesialis Kompresor & Sparepart AC' },
  { key: 'heroTitle', label: 'Judul Banner Beranda', type: 'textarea' },
  { key: 'heroSubtitle', label: 'Sub-judul Banner Beranda', type: 'textarea' },
  { key: 'whatsapp', label: 'Nomor WhatsApp', hint: 'Format bebas, contoh: 081234567890 atau 6281234567890' },
  { key: 'phone', label: 'Nomor Telepon', placeholder: '(021) 555-0123' },
  { key: 'email', label: 'Email', placeholder: 'toko@contoh.com' },
  { key: 'address', label: 'Alamat Toko', type: 'textarea' },
  { key: 'hours', label: 'Jam Operasional', placeholder: 'Senin - Sabtu: 08.00 - 17.00 WIB' },
  { key: 'about', label: 'Tentang Kami (tampil di beranda)', type: 'textarea' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tokoanda', hint: 'Kosongkan bila tidak dipakai' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/tokoanda' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@tokoanda' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@tokoanda' },
]

/** Validasi file gambar sama seperti form produk */
function validateImage(file: File): boolean {
  if (!file.type.startsWith('image/')) {
    toast.error(`"${file.name}" bukan file gambar.`)
    return false
  }
  if (file.size > 3 * 1024 * 1024) {
    toast.error(`"${file.name}" melebihi 3MB. Kompres dulu di tinypng.com.`)
    return false
  }
  return true
}

/** Nama file tanpa ekstensi → nama mitra bawaan */
function baseName(file: File): string {
  return file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
}

/** Perbarui ikon tab browser secara langsung (tanpa reload halaman) */
function applyFavicon(url: string) {
  if (typeof document === 'undefined') return
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}

export function SettingsManager() {
  const settings = useSettings()
  const [form, setForm] = useState<StoreSettings | null>(null)
  const [saving, setSaving] = useState(false)

  const [pw, setPw] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [changing, setChanging] = useState(false)

  // ---- Logo perusahaan ----
  const [logoUploading, setLogoUploading] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  // ---- Logo mitra ----
  const [partners, setPartners] = useState<PartnerLogo[]>([])
  const [partnerUploading, setPartnerUploading] = useState(0)
  const partnerRef = useRef<HTMLInputElement>(null)

  // ---- Favicon ----
  const [favUploading, setFavUploading] = useState(false)
  const favRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (settings && !form) {
      setForm({ ...settings })
      setPartners(parsePartners(settings.partnerLogos))
    }
  }, [settings, form])

  /** Simpan sebagian kolom pengaturan (untuk logo) */
  const persist = async (patch: Partial<StoreSettings>) => {
    await api<StoreSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
    clearSettingsCache()
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    try {
      await api<StoreSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      clearSettingsCache()
      toast.success('Pengaturan toko tersimpan!')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // ---- Upload logo perusahaan ----
  const uploadLogo = async (file: File) => {
    if (!validateImage(file)) return
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await api<{ url: string }>('/api/upload', {
        method: 'POST',
        body: fd,
      })
      await persist({ logoUrl: url })
      setForm((f) => (f ? { ...f, logoUrl: url } : f))
      toast.success('Logo perusahaan berhasil diperbarui!')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLogoUploading(false)
      if (logoRef.current) logoRef.current.value = ''
    }
  }

  const removeLogo = async () => {
    try {
      await persist({ logoUrl: '' })
      setForm((f) => (f ? { ...f, logoUrl: '' } : f))
      toast.success('Logo perusahaan dihapus — kembali ke ikon bawaan.')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  // ---- Favicon ----
  const uploadFavicon = async (file: File) => {
    if (!validateImage(file)) return
    setFavUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await api<{ url: string }>('/api/upload', {
        method: 'POST',
        body: fd,
      })
      await persist({ faviconUrl: url })
      setForm((f) => (f ? { ...f, faviconUrl: url } : f))
      applyFavicon(url)
      toast.success('Favicon berhasil diperbarui — lihat tab browser!')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setFavUploading(false)
      if (favRef.current) favRef.current.value = ''
    }
  }

  const removeFavicon = async () => {
    try {
      await persist({ faviconUrl: '' })
      setForm((f) => (f ? { ...f, faviconUrl: '' } : f))
      applyFavicon(form?.logoUrl || '/favicon.svg')
      toast.success('Favicon dihapus — kembali mengikuti logo perusahaan / ikon bawaan.')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  // ---- Logo mitra ----
  const savePartners = async (list: PartnerLogo[], silent = false) => {
    setPartners(list)
    try {
      await persist({ partnerLogos: JSON.stringify(list) })
      if (!silent) toast.success('Daftar logo mitra tersimpan!')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const uploadPartners = async (files: FileList) => {
    const next = [...partners]
    for (const file of Array.from(files)) {
      if (!validateImage(file)) continue
      try {
        setPartnerUploading((u) => u + 1)
        const fd = new FormData()
        fd.append('file', file)
        const { url } = await api<{ url: string }>('/api/upload', {
          method: 'POST',
          body: fd,
        })
        next.push({ url, name: baseName(file).slice(0, 40) })
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setPartnerUploading((u) => u - 1)
      }
    }
    if (next.length !== partners.length) await savePartners(next)
    if (partnerRef.current) partnerRef.current.value = ''
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.next.length < 6) {
      toast.error('Password baru minimal 6 karakter.')
      return
    }
    if (pw.next !== pw.confirm) {
      toast.error('Konfirmasi password tidak sama.')
      return
    }
    setChanging(true)
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: pw.current,
          newPassword: pw.next,
        }),
      })
      toast.success('Password berhasil diubah!')
      setPw({ current: '', next: '', confirm: '' })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setChanging(false)
    }
  }

  if (!form) {
    return (
      <div className="flex items-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Memuat pengaturan...</span>
      </div>
    )
  }

  /** Favicon efektif: unggahan khusus → logo perusahaan → placeholder */
  const faviconSrc = form.faviconUrl || form.logoUrl

  return (
    <div className="space-y-6">
      {/* Info toko */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-primary" />
            Informasi Toko
          </CardTitle>
          <CardDescription>
            Perubahan langsung tampil di seluruh halaman website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div
                  key={f.key}
                  className={`space-y-2 ${f.type === 'textarea' ? 'sm:col-span-2' : ''}`}
                >
                  <Label htmlFor={`set-${f.key}`}>{f.label}</Label>
                  {f.type === 'textarea' ? (
                    <Textarea
                      id={`set-${f.key}`}
                      rows={f.key === 'about' ? 4 : 2}
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    />
                  ) : (
                    <Input
                      id={`set-${f.key}`}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    />
                  )}
                  {f.hint && (
                    <p className="text-xs text-muted-foreground">{f.hint}</p>
                  )}
                </div>
              ))}
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logo perusahaan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Logo Perusahaan
          </CardTitle>
          <CardDescription>
            Tampil di pojok kiri atas header website (menggantikan ikon
            salju), menu mobile, dan footer. PNG transparan paling disarankan,
            maks 3MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-sm">
              {form.logoUrl ? (
                <Image
                  src={form.logoUrl}
                  alt="Logo perusahaan"
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              ) : (
                <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
              )}
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              <input
                ref={logoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadLogo(file)
                }}
                aria-label="Upload logo perusahaan"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={logoUploading}
                  onClick={() => logoRef.current?.click()}
                >
                  {logoUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      {form.logoUrl ? 'Ganti Logo' : 'Pilih Logo'}
                    </>
                  )}
                </Button>
                {form.logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    disabled={logoUploading}
                    onClick={removeLogo}
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Saran ukuran persegi 256×256px atau lebih, rasio 1:1. Logo
                langsung tersimpan begitu diunggah — tidak perlu klik
                &quot;Simpan Pengaturan&quot;.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favicon website */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AppWindow className="h-4 w-4 text-primary" />
            Favicon Website
          </CardTitle>
          <CardDescription>
            Ikon kecil yang tampil di tab browser, bookmark, dan hasil
            pencarian Google. Jika dikosongkan, favicon otomatis memakai logo
            perusahaan — bila keduanya kosong, memakai ikon salju bawaan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white shadow-sm">
              {faviconSrc ? (
                <Image
                  src={faviconSrc}
                  alt="Favicon website"
                  fill
                  sizes="64px"
                  className="object-contain p-1.5"
                />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
              )}
              {favUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              {/* Pratinjau tampilan di tab browser */}
              <div
                className="inline-flex max-w-full items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground shadow-sm"
                title="Pratinjau tampilan di tab browser"
              >
                <span className="relative h-4 w-4 shrink-0" aria-hidden>
                  {faviconSrc ? (
                    <Image
                      src={faviconSrc}
                      alt=""
                      fill
                      sizes="16px"
                      className="object-contain"
                    />
                  ) : (
                    <Snowflake className="h-4 w-4 text-teal-600" />
                  )}
                </span>
                <span className="max-w-48 truncate">
                  {form.storeName || 'Berkat Mandiri Pendingin'}
                </span>
                <X className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
                <span className="sr-only">Pratinjau tab browser</span>
              </div>
              <input
                ref={favRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadFavicon(file)
                }}
                aria-label="Upload favicon"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={favUploading}
                  onClick={() => favRef.current?.click()}
                >
                  {favUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      {form.faviconUrl ? 'Ganti Favicon' : 'Pilih Favicon'}
                    </>
                  )}
                </Button>
                {form.faviconUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    disabled={favUploading}
                    onClick={removeFavicon}
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Saran: PNG persegi 64×64px atau 256×256px dengan latar
                transparan. Langsung tersimpan begitu diunggah — ikon di tab
                browser ikut diperbarui tanpa reload.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo mitra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Handshake className="h-4 w-4 text-primary" />
            Logo Mitra{' '}
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {partners.length} logo
            </span>
          </CardTitle>
          <CardDescription>
            Tampil di strip &quot;Mitra Kami&quot; pada beranda, menggantikan
            daftar nama merek teks. Unggah PNG transparan agar rapi, maks 3MB
            per logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {partners.length === 0 && partnerUploading === 0 && (
            <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              Belum ada logo mitra. Klik tombol di bawah untuk mengunggah.
            </p>
          )}

          {partners.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {partners.map((p, i) => (
                <div key={p.url + i} className="space-y-2 rounded-xl border p-3">
                  <div className="group relative flex h-16 items-center justify-center overflow-hidden rounded-lg border bg-white">
                    <Image
                      src={p.url}
                      alt={p.name || `Logo mitra ${i + 1}`}
                      fill
                      sizes="160px"
                      className="object-contain p-1.5"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-rose-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() =>
                        savePartners(partners.filter((_, idx) => idx !== i))
                      }
                      aria-label={`Hapus logo ${p.name || i + 1}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <Input
                    value={p.name}
                    placeholder="Nama mitra"
                    className="h-8 text-xs"
                    onChange={(e) => {
                      const next = [...partners]
                      next[i] = { ...next[i], name: e.target.value }
                      setPartners(next)
                    }}
                    onBlur={() => savePartners(partners, true)}
                    aria-label={`Nama mitra ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          <input
            ref={partnerRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) uploadPartners(e.target.files)
            }}
            aria-label="Upload logo mitra"
          />
          <button
            type="button"
            onClick={() => partnerRef.current?.click()}
            disabled={partnerUploading > 0}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {partnerUploading > 0 ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs font-medium">
                  Mengunggah {partnerUploading} logo...
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">
                  Klik untuk pilih logo mitra (bisa banyak sekaligus)
                </span>
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground">
            Logo otomatis tersimpan setelah diunggah. Nama mitra akan tampil
            di bawah logo — ubah lalu klik di luar kolom untuk menyimpan.
          </p>
        </CardContent>
      </Card>

      {/* Ubah password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" />
            Ubah Password Admin
          </CardTitle>
          <CardDescription>
            Gunakan password yang kuat dan jangan dibagikan ke siapa pun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw-old">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="pw-old"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Tampilkan password"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-new">Password Baru</Label>
              <Input
                id="pw-new"
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-confirm">Konfirmasi Password Baru</Label>
              <Input
                id="pw-confirm"
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={changing}>
              {changing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengubah...
                </>
              ) : (
                'Ubah Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
