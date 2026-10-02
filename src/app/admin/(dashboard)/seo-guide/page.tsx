import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, CheckCircle2, FileText, Globe2, PackageSearch, SearchCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panduan SEO',
  robots: { index: false, follow: false },
};

const ownerRoadmap = [
  {
    title: 'Mulai dari pencarian yang paling relevan',
    description: 'Fokus awal pada kompresor untuk air conditioner kelas menengah-atas dan pembeli teknis di Indonesia. Gunakan istilah yang benar-benar dicari: merek, nomor model, scroll/rotary, inverter, refrigeran, tegangan, dan kapasitas. Posisi nomor satu dunia tidak bisa dijanjikan; ukur kemajuan dari pencarian yang tepat dan permintaan pelanggan.',
  },
  {
    title: 'Satu produk, satu halaman yang berguna',
    description: 'Setiap produk yang tayang perlu halaman sendiri dengan nama model, spesifikasi resmi, sumber teknis, foto yang boleh digunakan, serta tombol konsultasi. Halaman model sekarang dapat dibuka lewat tautan spesifikasi di katalog.',
  },
  {
    title: 'Jawab pertanyaan nyata pelanggan',
    description: 'Tulis panduan dari pertanyaan yang benar-benar diterima tim, lalu minta orang yang paham teknis memeriksa isinya. Jangan menyalin katalog produsen mentah-mentah atau menerbitkan banyak artikel otomatis yang tidak membantu.',
  },
  {
    title: 'Pakai alat gratis untuk mengukur',
    description: 'Tambahkan website ke Google Search Console, kirim sitemap.xml, lalu periksa halaman yang belum terindeks, kata pencarian, klik, dan kesalahan. Search Console gratis; mengirim sitemap tidak menjamin halaman langsung muncul atau mendapat posisi tertentu.',
  },
  {
    title: 'Bangun kepercayaan tanpa membeli tautan',
    description: 'Pastikan alamat, kontak, garansi, status distributor, dan foto proyek benar. Minta mitra resmi menautkan halaman yang relevan dan minta izin sebelum memakai nama atau foto pelanggan. Hindari jasa backlink spam.',
  },
];

const compressorBenchmark = [
  {
    name: 'Copeland',
    href: 'https://www.copeland.com/',
    features: 'Rangkaian scroll HVAC fixed-speed, two-stage, digital, dan variable-speed; Copeland Select membantu pemilihan dan cross-reference model.',
  },
  {
    name: 'Danfoss',
    href: 'https://www.danfoss.com/en-us/service-and-support/downloads/dcs/coolselector-2/',
    features: 'Coolselector² membandingkan komponen berdasarkan kapasitas, refrigeran, serta kondisi evaporasi/kondensasi dan dapat mengekspor laporan.',
  },
  {
    name: 'BITZER',
    href: 'https://www.bitzer.de/us/en/software/',
    features: 'Software seleksi kompresor dengan data performa, batas aplikasi, dokumentasi teknis, dan gambar dimensi.',
  },
  {
    name: 'Panasonic Industrial',
    href: 'https://industrial.panasonic.com/ww/products/motors-compressors/compressors',
    features: 'Katalog resmi memisahkan keluarga reciprocating, rotary, dan scroll serta fixed-speed dan variable-speed untuk aplikasi HVAC/AC.',
  },
  {
    name: 'LG Compressor & Motor',
    href: 'https://www.lg.com/global/business/compressor-motor/',
    features: 'Keluarga scroll fixed-speed, two-stage, dan variable-speed; lini produk dipisah menurut jenis kompresor dan aplikasi.',
  },
  {
    name: 'Samsung Compressor',
    href: 'https://www.samsung.com/global/business/compressor/',
    features: 'Navigasi berdasarkan reciprocating, rotary, dan scroll serta aplikasi air conditioner, unitary, dan heat pump.',
  },
  {
    name: 'GMCC',
    href: 'https://www.gmcc-welling.com/',
    features: 'Katalog rumah tangga dan komersial, solusi aplikasi, selection tool, dan unduhan untuk rotary serta scroll compressor.',
  },
];

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

const articleWorkflow = [
  { title: 'Mulai dari kebutuhan pembaca', description: 'Tentukan satu pertanyaan pelanggan yang benar-benar bisa dijawab tim. Artikel yang fokus dan orisinal lebih bermanfaat daripada mengulang kata kunci atau membuat banyak halaman serupa.' },
  { title: 'Tulis judul dan URL yang jelas', description: 'Judul artikel menjadi heading utama halaman. Gunakan slug pendek, huruf kecil, dan tanda hubung; setelah URL terbit, hindari mengubahnya karena CMS belum mengelola pengalihan URL otomatis.' },
  { title: 'Lengkapi ringkasan dan metadata', description: 'Ringkasan menjelaskan isi untuk pembaca. Judul SEO boleh berbeda bila lebih jelas; deskripsi SEO sebaiknya merangkum manfaat secara akurat. CMS memakai judul/ringkasan sebagai fallback bila metadata kosong.' },
  { title: 'Susun isi yang mudah dibaca', description: 'Gunakan heading berurutan, paragraf singkat, daftar bila membantu, dan tautan internal ke produk atau artikel yang relevan. Cantumkan sumber tepercaya untuk klaim teknis dan periksa fakta sebelum terbit.' },
  { title: 'Tinjau media dan publikasi', description: 'Pastikan gambar relevan, bisa diakses publik, punya izin penggunaan, dan halaman nyaman dibaca di ponsel. Buka artikel setelah disimpan untuk memeriksa tampilan, tautan, dan metadata.' },
  { title: 'Pantau setelah terbit', description: 'CMS menambahkan artikel terbit ke sitemap.xml. Daftarkan properti website yang tepat di Search Console, kirim sitemap, lalu pantau indeksasi dan kueri; permintaan indeksasi bukan jaminan halaman akan diindeks atau mendapat peringkat tertentu.' },
];

const checklist = [
  'Konten menjawab pertanyaan pelanggan dengan informasi yang akurat, orisinal, dan bermanfaat.',
  'Judul, slug URL, ringkasan, judul SEO, dan deskripsi SEO sesuai isi; deskripsi SEO artikel terbit minimal 40 karakter.',
  'Heading runtut, paragraf mudah dibaca, serta tautan internal dan sumber teknis relevan sudah diperiksa.',
  'Foto relevan, dapat diakses publik, dan penggunaannya telah mendapat izin.',
  'Halaman publik terbuka normal di ponsel, canonical mengarah ke URL utama, dan tidak ada klaim yang belum terverifikasi.',
  'Draft tetap privat; setelah publikasi, periksa URL artikel dan sitemap.xml lalu pantau Search Console.',
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

      <section aria-labelledby="owner-roadmap-heading" className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Mulai dari sini</p>
        <h2 id="owner-roadmap-heading" className="mt-2 text-2xl font-semibold tracking-tight">Langkah sederhana, tanpa harus membeli alat SEO</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">SEO bukan tombol untuk langsung menjadi nomor satu. Kita mulai dari calon pembeli yang tepat, halaman produk yang jelas, informasi yang benar, lalu ukur hasilnya dengan alat gratis.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {ownerRoadmap.map((step, index) => (
            <li key={step.title} className="flex gap-3 rounded-xl bg-muted/40 p-4">
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-900 text-xs font-semibold text-white">{index + 1}</span>
              <div><h3 className="font-semibold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="compressor-benchmark-heading" className="rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Benchmark fitur produsen</p>
        <h2 id="compressor-benchmark-heading" className="mt-2 text-2xl font-semibold tracking-tight">Fitur yang memudahkan orang memilih kompresor</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Benchmark awal ini meninjau tujuh sumber resmi produsen kompresor yang relevan untuk air conditioner: Copeland, Danfoss, BITZER, Panasonic, LG, Samsung, dan GMCC. Ini belum merupakan audit 100 website; jumlah itu perlu diteliti dan dicatat satu per satu agar hasilnya bisa dipercaya. Catatan fitur di bawah berasal dari katalog dan alat resmi yang tersedia saat ditinjau.</p>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {compressorBenchmark.map((item) => (
            <li key={item.name} className="rounded-xl border border-border p-4">
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-teal-800 hover:text-teal-950">
                {item.name}<ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.features}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-950">Pola yang layak diadopsi: satu halaman per model, filter merek/tipe/refrigeran/tegangan/kapasitas, dokumen teknis bersumber, lalu tombol minta penawaran. Harga tetap tidak ditampilkan, termasuk dalam data terstruktur.</p>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Catatan katalog:</strong> data Embraco yang sudah ada belum berarti situs ini memiliki semua model premium untuk air conditioner. Jangan menambahkan model, kapasitas, stok, atau foto hanya dari nama merek; cocokkan nomor model dan spesifikasi dengan datasheet resmi serta konfirmasi ketersediaan dari pemasok. Dalam konteks ini, AC berarti air conditioner, bukan sekadar arus listrik AC.</p>
      </section>

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

      <section aria-labelledby="article-workflow-heading" className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Tutorial artikel</p>
        <h2 id="article-workflow-heading" className="mt-2 text-2xl font-semibold tracking-tight">Dari ide sampai pemantauan</h2>
        <ol className="mt-5 flex flex-col gap-4">
          {articleWorkflow.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-xl bg-muted/40 p-4 sm:p-5">
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-900 text-xs font-semibold text-white">{index + 1}</span>
              <div><h3 className="font-semibold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p></div>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-xl border border-border p-4">
          <h3 className="font-semibold">Apa yang CMS kelola untuk produk?</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Judul dan deskripsi pencarian produk dibentuk dari merek, model, dan deskripsi katalog. Halaman produk yang tampil menyertakan canonical, breadcrumb, dan data terstruktur Product; produk tersembunyi tidak dimasukkan ke sitemap. Harga atau penawaran tidak dibuat-buat karena harus dikonfirmasi langsung.</p>
          <Link href="/admin/products" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">Tinjau katalog<ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
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
