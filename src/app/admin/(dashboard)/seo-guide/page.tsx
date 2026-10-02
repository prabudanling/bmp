import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, CheckCircle2, FileText, Globe2, PackageSearch, SearchCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panduan SEO',
  robots: { index: false, follow: false },
};

const steps = [
  {
    number: '01',
    title: 'Tetapkan identitas website',
    description: 'Buka pengaturan SEO website dan tulis nama bisnis serta ringkasan layanan yang benar-benar ditawarkan. Gunakan bahasa yang jelas untuk calon pelanggan, bukan daftar kata kunci.',
    href: '/admin/settings',
    link: 'Buka pengaturan SEO',
    icon: SearchCheck,
  },
  {
    number: '02',
    title: 'Terbitkan artikel yang membantu',
    description: 'Pilih satu kebutuhan pembaca untuk setiap artikel. Buat judul deskriptif, ringkasan yang akurat, isi orisinal dengan heading yang teratur, dan tautan ke halaman terkait. Isi metadata SEO bila berbeda dari judul dan ringkasan.',
    href: '/admin/articles',
    link: 'Kelola artikel',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Jaga halaman produk tetap akurat',
    description: 'Perbarui nama, model, deskripsi, spesifikasi, dan foto yang memang berhak digunakan. Judul dan deskripsi pencarian produk dibuat dari data katalog; hindari klaim stok atau harga yang belum dikonfirmasi.',
    href: '/admin/products',
    link: 'Kelola produk',
    icon: PackageSearch,
  },
  {
    number: '04',
    title: 'Periksa halaman publik dan indeksasi',
    description: 'Setelah terbit, buka halaman publik untuk memeriksa konten. Sitemap dibuat dari artikel terbit dan produk yang tampil di katalog. Pantau cakupan indeksasi dan masalah teknis melalui Google Search Console.',
    href: '/sitemap.xml',
    link: 'Lihat sitemap publik',
    icon: Globe2,
  },
];

const checklist = [
  'Konten menjawab pertanyaan pelanggan dengan informasi yang akurat dan bermanfaat.',
  'Judul, slug URL, dan ringkasan mewakili isi halaman; slug yang sudah terbit tidak diubah tanpa rencana pengalihan.',
  'Artikel memakai struktur heading yang runtut, paragraf mudah dibaca, dan tautan internal yang relevan.',
  'Foto relevan, dapat diakses publik, dan penggunaannya telah mendapat izin.',
  'Halaman publik terbuka normal di ponsel dan tidak berisi placeholder atau klaim yang belum terverifikasi.',
  'Sitemap hanya memuat halaman publik; artikel draft tidak dipublikasikan ke mesin pencari.',
];

export default function SeoGuidePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="rounded-3xl border border-teal-900/10 bg-white p-6 shadow-sm sm:p-9">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-900"><BookOpen aria-hidden="true" className="size-5" /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Pusat belajar Berkat CMS</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Panduan SEO dari draf sampai ditemukan</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">Ikuti alur singkat ini untuk menyiapkan halaman yang mudah dipahami manusia dan mesin pencari. CMS mengelola metadata dasar, canonical, data terstruktur, robots, dan sitemap; kualitas konten serta keputusan bisnis tetap perlu ditinjau oleh tim.</p>
        <p className="mt-4 max-w-3xl rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">SEO tidak dapat menjamin posisi atau waktu indeksasi tertentu. Google dapat memilih ulang judul dan cuplikan berdasarkan kueri; fokus pada informasi yang berguna, konsisten, dan dapat dipercaya.</p>
      </header>

      <section aria-labelledby="workflow-heading" className="flex flex-col gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Alur kerja</p><h2 id="workflow-heading" className="mt-2 text-2xl font-semibold tracking-tight">Empat langkah sebelum dan sesudah terbit</h2></div>
        <ol className="grid gap-4 md:grid-cols-2">
          {steps.map(({ number, title, description, href, link, icon: Icon }) => (
            <li key={number} className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.16em] text-teal-800">LANGKAH {number}</span><Icon aria-hidden="true" className="size-5 text-teal-800" /></div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
              <Link href={href} className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">{link}<ArrowUpRight aria-hidden="true" className="size-4" /></Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="checklist-heading" className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><CheckCircle2 aria-hidden="true" className="size-5" /></span><div><h2 id="checklist-heading" className="text-xl font-semibold tracking-tight">Checklist publikasi</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Tinjau setiap poin sebelum mengubah status artikel menjadi terbit.</p></div></div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {checklist.map((item) => <li key={item} className="flex gap-3 rounded-xl bg-muted/50 p-4 text-sm leading-6"><CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-teal-800" /><span>{item}</span></li>)}
        </ul>
      </section>

      <section aria-labelledby="references-heading" className="rounded-2xl border border-teal-900/10 bg-teal-950 p-5 text-white sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">Belajar dari sumber resmi</p>
        <h2 id="references-heading" className="mt-2 text-xl font-semibold tracking-tight">Panduan Google Search Central</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Dokumentasi resmi membantu memahami cara Google merayapi, menampilkan, dan mengevaluasi halaman—tanpa janji hasil peringkat.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10">SEO Starter Guide <ArrowUpRight aria-hidden="true" className="size-4" /></a>
          <a href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10">Data terstruktur <ArrowUpRight aria-hidden="true" className="size-4" /></a>
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10">Google Search Console <ArrowUpRight aria-hidden="true" className="size-4" /></a>
        </div>
      </section>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return [];
}

export function generateMetadata() {
  return metadata;
}
