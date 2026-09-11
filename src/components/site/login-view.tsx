'use client'

import { useState } from 'react'
import {
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Snowflake,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { api } from '@/lib/client'
import { useApp } from '@/lib/store'
import type { AdminUser } from '@/lib/types'

export function LoginView() {
  const navigate = useApp((s) => s.navigate)
  const setUser = useApp((s) => s.setUser)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api<{ user: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      setUser(res.user)
      toast.success(`Selamat datang, ${res.user.name}!`)
      navigate('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="items-center text-center">
            <span className="mx-auto mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Snowflake className="h-7 w-7" />
            </span>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Masuk ke Dashboard
            </CardTitle>
            <CardDescription>
              Kelola produk, kategori, dan pesan pelanggan toko Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-user">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-user"
                    className="pl-9"
                    placeholder="username"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-pass">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-pass"
                    className="pl-9 pr-10"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  'Masuk Sekarang'
                )}
              </Button>
            </form>
            <div className="mt-5 rounded-lg border border-dashed bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Info:</span>{' '}
              Akun default adalah <b>admin</b> / <b>admin123</b>. Segera ganti
              password di menu Pengaturan setelah login.
            </div>
            <Button
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => navigate('/')}
            >
              ← Kembali ke Website
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
