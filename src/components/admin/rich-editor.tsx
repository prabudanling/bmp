'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Code2,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/client'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

/** Jalankan perintah editing lalu kirim HTML terbaru ke induk */
function useExec(
  editorRef: React.RefObject<HTMLDivElement | null>,
  onChange: (html: string) => void
) {
  return (cmd: string, arg?: string) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    document.execCommand(cmd, false, arg)
    onChange(el.innerHTML)
  }
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      title={label}
      aria-label={label}
      // Cegah toolbar merebut fokus/selection dari editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function Separator() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden />
}

/**
 * Editor teks kaya (WYSIWYG) ala WordPress — tanpa dependensi eksternal.
 * Mendukung format dasar, tautan, unggah gambar, dan mode HTML mentah.
 */
export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const lastHtml = useRef<string>(value)
  const savedRange = useRef<Range | null>(null)
  const [htmlMode, setHtmlMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('https://')

  const exec = useExec(editorRef, onChange)

  // Sinkronkan konten dari luar (mis. saat membuka form edit) tanpa
  // menggeser kursor pengguna — hanya bila nilainya benar-benar berubah.
  useEffect(() => {
    const el = editorRef.current
    if (!el || htmlMode) return
    if (value !== lastHtml.current) {
      el.innerHTML = value || ''
      lastHtml.current = value
    }
  }, [value, htmlMode])

  // Isi awal sekali saat editor pertama kali dirender
  useEffect(() => {
    const el = editorRef.current
    if (el && !el.innerHTML) el.innerHTML = value || ''
  }, [])

  const emit = () => {
    const el = editorRef.current
    if (!el) return
    lastHtml.current = el.innerHTML
    onChange(el.innerHTML)
  }

  const formatBlock = (tag: string) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    // Bila teks belum terseleksi, seleksi seluruh paragraf saat kursor berada di dalamnya
    document.execCommand('formatBlock', false, tag)
    emit()
  }

  const insertImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`"${file.name}" bukan file gambar.`)
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error(`"${file.name}" melebihi 3MB. Kompres dulu di tinypng.com.`)
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await api<{ url: string }>('/api/upload', {
        method: 'POST',
        body: fd,
      })
      exec('insertImage', url)
      toast.success('Gambar disisipkan ke konten.')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const openLinkDialog = () => {
    const sel = document.getSelection()
    savedRange.current =
      sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null
    setLinkUrl('https://')
    setLinkOpen(true)
  }

  const applyLink = () => {
    const url = linkUrl.trim()
    if (!url || url === 'https://') {
      toast.error('Isi alamat tautan terlebih dahulu.')
      return
    }
    setLinkOpen(false)
    const el = editorRef.current
    if (!el) return
    el.focus()
    if (savedRange.current) {
      const sel = document.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(savedRange.current)
    }
    document.execCommand('createLink', false, url)
    // Buka di tab baru supaya pengunjung tidak keluar dari website
    el.querySelectorAll('a[href]').forEach((a) => {
      if (!a.getAttribute('target')) a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener')
    })
    emit()
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Toolbar */}
      {!htmlMode && (
        <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1.5 py-1.5">
          <ToolbarButton label="Urungkan" onClick={() => exec('undo')}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Ulangi" onClick={() => exec('redo')}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <ToolbarButton label="Paragraf" onClick={() => formatBlock('p')}>
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Judul Besar" onClick={() => formatBlock('h2')}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Judul Kecil"
            onClick={() => formatBlock('h3')}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Kutipan"
            onClick={() => formatBlock('blockquote')}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <ToolbarButton label="Tebal" onClick={() => exec('bold')}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Miring" onClick={() => exec('italic')}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Garis Bawah" onClick={() => exec('underline')}>
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Coret"
            onClick={() => exec('strikeThrough')}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <ToolbarButton
            label="Daftar Poin"
            onClick={() => exec('insertUnorderedList')}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Daftar Angka"
            onClick={() => exec('insertOrderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <ToolbarButton
            label="Rata Kiri"
            onClick={() => exec('justifyLeft')}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Rata Tengah"
            onClick={() => exec('justifyCenter')}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <ToolbarButton label="Sisipkan Tautan" onClick={openLinkDialog}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Sisipkan Gambar (unggah)"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </ToolbarButton>
          <ToolbarButton
            label="Garis Pembatas"
            onClick={() => exec('insertHorizontalRule')}
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Hapus Format"
            onClick={() => exec('removeFormat')}
          >
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
          <Separator />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const el = editorRef.current
              if (el && value !== el.innerHTML) {
                // angkat konten terakhir sebelum pindah mode
                onChange(el.innerHTML)
                lastHtml.current = el.innerHTML
              }
              setHtmlMode(true)
            }}
          >
            <Code2 className="h-4 w-4" />
            HTML
          </Button>
        </div>
      )}

      {/* Area konten / mode HTML */}
      {htmlMode ? (
        <div className="space-y-2 p-3">
          <p className="text-xs text-muted-foreground">
            Mode HTML — edit langsung kode di bawah, lalu kembali ke mode
            visual.
          </p>
          <textarea
            className="min-h-64 w-full resize-y rounded-lg border bg-muted/20 p-3 font-mono text-xs"
            value={value}
            onChange={(e) => {
              lastHtml.current = e.target.value
              onChange(e.target.value)
            }}
            spellCheck={false}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setHtmlMode(false)}
          >
            <Eye className="h-4 w-4" />
            Kembali ke Mode Visual
          </Button>
        </div>
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Isi konten halaman"
          data-placeholder={placeholder || 'Tulis isi halaman di sini...'}
          className="cms-content cms-editor min-h-64 max-h-[420px] overflow-y-auto px-4 py-3 outline-none"
          onInput={emit}
          onBlur={emit}
        />
      )}

      {/* Input gambar tersembunyi */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) insertImageFile(f)
        }}
        aria-label="Unggah gambar untuk konten"
      />

      {/* Dialog tautan */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sisipkan Tautan</DialogTitle>
            <DialogDescription>
              Teks yang sedang diseleksi akan menjadi tautan. Contoh:
              https://wa.me/6281234567890
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="link-url">Alamat Tautan</Label>
            <Input
              id="link-url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://contoh.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyLink()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)}>
              Batal
            </Button>
            <Button onClick={applyLink}>Terapkan Tautan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
