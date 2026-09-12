'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Save,
  Trash2,
  Upload,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/client'
import { useApi } from '@/hooks/use-api'
import { useApp } from '@/lib/store'
import type { CategoryDTO, ProductDTO, SpecItem } from '@/lib/types'

const UNITS = ['pcs', 'set', 'box', 'pack', 'kg', 'meter', 'liter']

export function ProductForm({ editId }: { editId?: string }) {
  const navigate = useApp((s) => s.navigate)
  const isEdit = !!editId

  const { data: cats } = useApi<{ items: CategoryDTO[] }>('/api/categories')
  const { data: existing, loading: loadingExisting } = useApi<ProductDTO>(
    editId ? `/api/products/${editId}` : null
  )

  const [form, setForm] = useState({
    name: '',
    brand: '',
    sku: '',
    categoryId: '',
    price: '',
    unit: 'pcs',
    stock: '0',
    shortDesc: '',
    description: '',
    isFeatured: false,
    isActive: true,
  })
  const [specs, setSpecs] = useState<SpecItem[]>([])
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Isi form saat mode edit
  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        brand: existing.brand || '',
        sku: existing.sku || '',
        categoryId: existing.categoryId || '',
        price: existing.price != null ? String(existing.price) : '',
        unit: existing.unit || 'pcs',
        stock: String(existing.stock),
        shortDesc: existing.shortDesc || '',
        description: existing.description || '',
        isFeatured: existing.isFeatured,
        isActive: existing.isActive,
      })
      setSpecs(existing.specs)
      setImages(existing.images)
    }
  }, [existing])

  const uploadFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" bukan file gambar.`)
        continue
      }
      if (file.size > 3 * 1024 * 1024) {
        toast.error(`"${file.name}" melebihi 3MB.`)
        continue
      }
      try {
        setUploading((u) => u + 1)
        const fd = new FormData()
        fd.append('file', file)
        const res = await api<{ url: string }>('/api/upload', {
          method: 'POST',
          body: fd,
        })
        setImages((prev) => [...prev, res.url])
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setUploading((u) => u - 1)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Nama produk wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || null,
        price: form.price === '' ? null : Number(form.price),
        stock: Number(form.stock || 0),
        specs,
        images,
      }
      if (isEdit) {
        await api(`/api/products/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      } else {
        await api('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      toast.success(
        isEdit ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!'
      )
      window.dispatchEvent(new Event('bmp:refresh-stats'))
      navigate('/admin/produk')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/admin/produk')}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button type="submit" disabled={saving || uploading > 0}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Kolom kiri */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Produk</CardTitle>
              <CardDescription>
                Nama produk yang jelas membantu pelanggan menemukan barang
                Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-name">
                  Nama Produk <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="p-name"
                  required
                  placeholder="Contoh: Kompresor Rotary Daikin 1 PK"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="p-brand">Merek</Label>
                  <Input
                    id="p-brand"
                    placeholder="Daikin, Panasonic, ..."
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-sku">Kode / SKU</Label>
                  <Input
                    id="p-sku"
                    placeholder="CMP-DKN-1PK"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={form.categoryId || 'none'}
                    onValueChange={(v) =>
                      setForm({ ...form, categoryId: v === 'none' ? '' : v })
                    }
                  >
                    <SelectTrigger aria-label="Pilih kategori">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa kategori</SelectItem>
                      {(cats?.items || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-short">
                  Deskripsi Singkat{' '}
                  <span className="text-xs text-muted-foreground">
                    ({form.shortDesc.length}/160)
                  </span>
                </Label>
                <Input
                  id="p-short"
                  maxLength={160}
                  placeholder="Ringkasan 1-2 kalimat yang tampil di kartu produk"
                  value={form.shortDesc}
                  onChange={(e) =>
                    setForm({ ...form, shortDesc: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-desc">Deskripsi Lengkap</Label>
                <Textarea
                  id="p-desc"
                  rows={9}
                  placeholder={`Tulis detail produk: fungsi, keunggulan, kompatibilitas, tips pemasangan...\n\nPisahkan paragraf dengan baris baru.`}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Tips: jelaskan fungsi part, tipe AC yang kompatibel, dan
                  gejala kerusakan yang bisa diatasi dengan part ini.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Spesifikasi */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Spesifikasi Teknis</CardTitle>
                <CardDescription>
                  Detail teknis seperti kapasitas, voltase, garansi, dll.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSpecs([...specs, { k: '', v: '' }])}
              >
                <Plus className="h-4 w-4" />
                Tambah Baris
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.length === 0 && (
                <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Belum ada spesifikasi. Klik &quot;Tambah Baris&quot; untuk
                  menambahkan.
                </p>
              )}
              {specs.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="w-[38%]"
                    placeholder="Nama (mis: Voltase)"
                    value={s.k}
                    onChange={(e) => {
                      const next = [...specs]
                      next[i] = { ...next[i], k: e.target.value }
                      setSpecs(next)
                    }}
                    aria-label={`Nama spesifikasi ${i + 1}`}
                  />
                  <Input
                    className="flex-1"
                    placeholder="Isi (mis: 220V / 50Hz)"
                    value={s.v}
                    onChange={(e) => {
                      const next = [...specs]
                      next[i] = { ...next[i], v: e.target.value }
                      setSpecs(next)
                    }}
                    aria-label={`Nilai spesifikasi ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    onClick={() =>
                      setSpecs(specs.filter((_, idx) => idx !== i))
                    }
                    aria-label="Hapus baris spesifikasi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-5">
          {/* Harga & stok */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Harga & Stok</CardTitle>
              <CardDescription>
                Kosongkan harga jika ingin menampilkan &quot;Hubungi Kami&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-price">Harga (Rp)</Label>
                <Input
                  id="p-price"
                  type="number"
                  min={0}
                  placeholder="1850000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(v) => setForm({ ...form, unit: v })}
                  >
                    <SelectTrigger aria-label="Satuan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-stock">Stok</Label>
                  <Input
                    id="p-stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Foto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Foto Produk</CardTitle>
              <CardDescription>
                JPG/PNG/WEBP maks 3MB per foto. Foto pertama menjadi foto
                utama.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5">
                  {images.map((img, i) => (
                    <div
                      key={img + i}
                      className="group relative aspect-square overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={img}
                        alt={`Foto ${i + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                          Utama
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setImages(images.filter((_, idx) => idx !== i))
                        }
                        className="absolute right-1 top-1 rounded bg-rose-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Hapus foto"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading > 0}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {uploading > 0 ? (
                  <>
                    <Loader2 className="h-7 w-7 animate-spin" />
                    <span className="text-xs font-medium">
                      Mengunggah {uploading} foto...
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-7 w-7" />
                    <span className="text-xs font-medium">
                      Klik untuk pilih foto dari perangkat
                    </span>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) uploadFiles(e.target.files)
                }}
                aria-label="Upload foto produk"
              />
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Tampilan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="p-active" className="text-sm font-medium">
                    Tampilkan di Katalog
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Produk terlihat oleh pengunjung website
                  </p>
                </div>
                <Switch
                  id="p-active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="p-featured" className="text-sm font-medium">
                    Produk Unggulan
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Tampil di bagian &quot;Produk Unggulan&quot; beranda
                  </p>
                </div>
                <Switch
                  id="p-featured"
                  checked={form.isFeatured}
                  onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Simpan mobile */}
          <Button type="submit" className="hidden w-full sm:flex" disabled={saving || uploading > 0}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
