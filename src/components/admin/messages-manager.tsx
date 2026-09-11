'use client'

import { useMemo, useState } from 'react'
import {
  Inbox,
  Mail,
  MailOpen,
  MessageCircle,
  Phone,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/client'
import { formatDateTime, waLink } from '@/lib/format'
import { useApi } from '@/hooks/use-api'
import type { MessageDTO } from '@/lib/types'

export function MessagesManager() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { data, loading, refetch } = useApi<{ items: MessageDTO[] }>(
    filter === 'unread' ? '/api/messages?unread=1' : '/api/messages'
  )
  const [deleteTarget, setDeleteTarget] = useState<MessageDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const unreadCount = useMemo(
    () => data?.items.filter((m) => !m.isRead).length ?? 0,
    [data]
  )

  const markRead = async (m: MessageDTO, isRead: boolean) => {
    try {
      await api(`/api/messages/${m.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isRead }),
      })
      if (isRead) toast.success('Pesan ditandai sudah dibaca.')
      window.dispatchEvent(new Event('bmp:refresh-stats'))
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api(`/api/messages/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Pesan dihapus.')
      setDeleteTarget(null)
      window.dispatchEvent(new Event('bmp:refresh-stats'))
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:border-primary/40'
          }`}
        >
          Semua Pesan
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:border-primary/40'
          }`}
        >
          Belum Dibaca
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (data?.items.length || 0) === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-semibold">
              {filter === 'unread'
                ? 'Tidak ada pesan baru'
                : 'Belum ada pesan masuk'}
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Pesan dari form kontak website akan muncul di sini beserta nama
              dan nomor telepon pengirim.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data!.items.map((m) => (
            <Card
              key={m.id}
              className={`gap-0 py-0 ${!m.isRead ? 'border-l-4 border-l-primary' : ''}`}
            >
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <CardTitle
                      className={`truncate text-sm ${m.isRead ? '' : 'font-extrabold'}`}
                    >
                      {m.name}
                      {!m.isRead && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          Baru
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {m.phone}
                      </span>
                      {m.email && <span>• {m.email}</span>}
                      <span>• {formatDateTime(m.createdAt)}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={m.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                    aria-label="Tandai dibaca"
                    onClick={() => markRead(m, !m.isRead)}
                  >
                    {m.isRead ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    aria-label="Hapus pesan"
                    onClick={() => setDeleteTarget(m)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {m.message}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-500"
                    onClick={() =>
                      window.open(
                        waLink(
                          m.phone,
                          `Halo ${m.name}, terima kasih telah menghubungi kami. Terkait pesan Anda: "${m.message.slice(0, 80)}${m.message.length > 80 ? '...' : ''}" — berikut informasinya:`
                        ),
                        '_blank'
                      )
                    }
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Balas via WhatsApp
                  </Button>
                  {m.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `mailto:${m.email}?subject=Balasan dari Berkat Mandiri Pendingin&body=Halo ${m.name},%0D%0A%0D%0A`
                        )
                      }
                    >
                      Balas via Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filter === 'all' && unreadCount > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {unreadCount} pesan belum dibaca
        </p>
      )}

      {/* Konfirmasi hapus */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pesan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pesan dari {deleteTarget?.name} akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
