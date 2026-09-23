'use client'

import { MessageCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion'
import { useSettings } from '@/hooks/use-settings'
import { waLink } from '@/lib/format'

const FAQS = [
  {
    q: 'Apakah semua produk original dan bergaransi?',
    a: 'Ya. Semua sparepart yang kami jual 100% baru dan original, bukan rekondisi. Produk elektronik seperti kompresor dan motor fan dilengkapi garansi resmi toko — masa garansi tercantum pada invoice masing-masing produk.',
  },
  {
    q: 'Bagaimana pengiriman dan apakah packing-nya aman?',
    a: 'Kami mengirim ke seluruh Indonesia setiap hari melalui ekspedisi terpercaya. Barang rapuh seperti kompresor dan kapasitor dikemas dengan packing double (bubble wrap + kardus tebal) dan diasuransikan opsional untuk jumlah besar.',
  },
  {
    q: 'Saya bingung menentukan part yang cocok, bisa dibantu?',
    a: 'Tentu. Cukup kirimkan tipe AC, foto nameplate unit, atau foto part lama Anda via WhatsApp — tim ahli kami akan mencarikan part yang tepat dan memberi rekomendasi harga terbaik. Konsultasi gratis, tanpa minimum pembelian.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), QRIS, e-wallet (GoPay, OVO, DANA), serta pembayaran tempat (COD) untuk area Jakarta tertentu. Untuk perusahaan tersedia pembayaran tempo dengan invoice resmi.',
  },
  {
    q: 'Apakah melayani pembelian grosir atau tender perusahaan?',
    a: 'Ya. Kami melayani pembelian satuan maupun grosir dengan harga khusus distributor. Untuk kebutuhan proyek, tender, atau pengadaan perusahaan, silakan hubungi kami untuk penawaran resmi (quotation) dan ketersediaan stok.',
  },
  {
    q: 'Bagaimana kebijakan retur dan garansi?',
    a: 'Barang dapat diretur jika tidak sesuai pesanan atau rusak saat pengiriman — laporkan maksimal 2×24 jam setelah diterima dengan video unboxing. Klaim garansi produk ditangani langsung oleh tim kami tanpa biaya tambahan.',
  },
]

export function FaqSection() {
  const settings = useSettings()
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8" id="faq">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr]">
        <Reveal from="left">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            FAQ
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Jawaban cepat untuk pertanyaan paling sering masuk ke CS kami.
            Tidak menemukan jawaban yang Anda cari? Tim kami siap membantu
            lewat WhatsApp setiap hari kerja.
          </p>
          {settings?.whatsapp && (
            <Button
              className="mt-5 bg-green-600 text-white transition-all hover:-translate-y-0.5 hover:bg-green-500"
              onClick={() =>
                window.open(
                  waLink(
                    settings.whatsapp,
                    'Halo, saya ingin bertanya seputar produk sparepart AC.'
                  ),
                  '_blank'
                )
              }
            >
              <MessageCircle className="h-4 w-4" />
              Tanya Langsung via WhatsApp
            </Button>
          )}
        </Reveal>

        <Reveal from="right" delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="rounded-xl border bg-card px-4 transition-colors hover:border-primary/40 data-[state=open]:border-primary/40 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
