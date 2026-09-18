'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Headset,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Truck,
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
import {
  Reveal,
  Stagger,
  StaggerItem,
  heroContainer,
  heroItem,
} from '@/components/motion'
import { api } from '@/lib/client'
import { useSettings } from '@/hooks/use-settings'
import { waLink } from '@/lib/format'

export function ContactSection() {
  const settings = useSettings()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })
  const [sending, setSending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await api('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ ...form, website: '' }),
      })
      toast.success('Pesan terkirim!', {
        description: 'Tim kami akan menghubungi Anda secepatnya.',
      })
      setForm({ name: '', phone: '', email: '', message: '' })
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const contactItems = [
    { icon: MapPin, title: 'Alamat Toko', value: settings?.address || '-' },
    {
      icon: Phone,
      title: 'Telepon / WhatsApp',
      value: `${settings?.phone || '-'} • ${settings?.whatsapp || '-'}`,
    },
    { icon: Clock, title: 'Jam Operasional', value: settings?.hours || '-' },
    { icon: Mail, title: 'Email', value: settings?.email || '-' },
  ]

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8"
      id="kontak"
    >
      <div className="mb-10 text-center">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Hubungi Kami
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Ada yang Bisa Kami Bantu?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Kirim pertanyaan Anda melalui form di bawah, atau chat langsung via
            WhatsApp untuk respon lebih cepat.
          </p>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Info kontak */}
        <Stagger className="grid gap-4 sm:grid-cols-2" gap={0.09}>
          {contactItems.map((item) => (
            <StaggerItem key={item.title}>
              <Card className="group h-full gap-2 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <CardHeader className="pb-0">
                  <div className="hover-wiggle mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {item.value}
                  </CardDescription>
                </CardHeader>
              </Card>
            </StaggerItem>
          ))}
          {settings?.whatsapp && (
            <StaggerItem className="sm:col-span-2">
              <Button
                className="w-full bg-green-600 text-white transition-all hover:-translate-y-0.5 hover:bg-green-500"
                size="lg"
                onClick={() =>
                  window.open(
                    waLink(
                      settings.whatsapp,
                      'Halo, saya ingin bertanya tentang produk sparepart AC.'
                    ),
                    '_blank'
                  )
                }
              >
                <MessageCircle className="h-5 w-5" />
                Chat Langsung via WhatsApp
              </Button>
            </StaggerItem>
          )}
        </Stagger>

        {/* Form */}
        <Reveal from="right" delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Kirim Pesan</CardTitle>
            <CardDescription>
              Isi form berikut dan kami akan membalas secepatnya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">
                    Nama <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="c-name"
                    required
                    placeholder="Nama Anda"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone">
                    No. Telepon / WA <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="c-phone"
                    required
                    inputMode="tel"
                    placeholder="08xxxxxxxxxx"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Email (opsional)</Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-message">
                  Pesan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="c-message"
                  required
                  rows={5}
                  placeholder="Tulis pertanyaan Anda, misal: tipe kompresor yang dicari, jumlah, dan alamat kirim..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Kirim Pesan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </Reveal>
      </div>
    </section>
  )
}

export function TrustRow() {
  const items = [
    {
      icon: ShieldCheck,
      title: '100% Original',
      desc: 'Baru & bergaransi resmi',
    },
    {
      icon: Truck,
      title: 'Kirim Seluruh Indonesia',
      desc: 'Packing aman & cepat',
    },
    {
      icon: Headset,
      title: 'Didampingi Ahli',
      desc: 'Bantu cari part yang pas',
    },
  ]
  return (
    <motion.div
      variants={heroContainer}
      initial="hidden"
      animate="show"
      className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6"
    >
      {items.map((item) => (
        <motion.div
          key={item.title}
          variants={heroItem}
          className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-teal-300">
            <item.icon className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">
              {item.title}
            </span>
            <span className="block text-xs text-white/60">{item.desc}</span>
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}
