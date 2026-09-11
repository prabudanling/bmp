'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, Save, Store } from 'lucide-react'
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
import type { StoreSettings } from '@/lib/types'

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
]

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

  useEffect(() => {
    if (settings && !form) setForm({ ...settings })
  }, [settings, form])

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
