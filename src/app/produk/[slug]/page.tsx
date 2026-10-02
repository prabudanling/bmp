import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react';
import { getProductDetails } from '@/lib/cms-db';
import { Button } from '@/components/ui/button';

const SITE_URL = 'https://www.berkatmandiripendingin.com';
type RouteProps = { params: Promise<{ slug: string }> };
type ProductSpecs = Record<string, string>;

const specLabels: Record<string, string> = {
  family: 'Seri',
  compressor_type: 'Tipe kompresor',
  technology: 'Teknologi',
  refrigerant: 'Refrigeran',
  power_supply: 'Catu daya',
  horsepower: 'Daya kuda',
  capacity_values_w: 'Nilai kapasitas selector (W)',
  cop_values: 'Nilai COP',
  displacement: 'Perpindahan volume',
  displacement_m3_h: 'Perpindahan (m³/jam)',
  displacement_cm3_rev: 'Perpindahan (cm³/putaran)',
  application: 'Aplikasi',
  test_application: 'Aplikasi pengujian',
  test_standard: 'Standar pengujian',
  motor_type: 'Tipe motor',
  starting_torque: 'Torsi awal',
  regional_listing: 'Wilayah pada katalog',
  rotation: 'Rotasi',
  bare_part_numbers: 'Nomor suku cadang',
  kit: 'Kit',
};

function readSpecs(value: string | null | undefined): ProductSpecs {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as ProductSpecs
      : {};
  } catch {
    return {};
  }
}

function productMeta(product: NonNullable<Awaited<ReturnType<typeof getProductDetails>>>['product']) {
  const identity = [product.brand, product.model].filter(Boolean).join(' ');
  const title = `${identity || product.name} | Spesifikasi kompresor`;
  const description = `${product.shortDesc || product.description || product.name} Ketersediaan dan harga dikonfirmasi saat permintaan.`.slice(0, 160);
  return { title, description };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductDetails(slug);
  if (!result?.product.inStock) return { title: 'Produk tidak ditemukan', robots: { index: false, follow: false } };

  const { title, description } = productMeta(result.product);
  const url = `${SITE_URL}/produk/${result.product.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/produk/${result.product.slug}` },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: result.product.images ? [{ url: result.product.images, alt: result.product.name }] : undefined,
    },
    twitter: {
      card: result.product.images ? 'summary_large_image' : 'summary',
      title,
      description,
      images: result.product.images ? [result.product.images] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const result = await getProductDetails(slug);
  if (!result?.product.inStock) notFound();

  const { product, category } = result;
  const specs = readSpecs(product.specifications);
  const sourceUrl = specs._sourceUrl;
  const sourceName = specs._sourceName || 'Katalog resmi produsen';
  const displaySpecs = Object.entries(specs).filter(([key, value]) => !key.startsWith('_') && typeof value === 'string');
  const { title, description } = productMeta(product);
  const canonicalUrl = `${SITE_URL}/produk/${product.slug}`;
  const quoteMessage = `Halo, saya ingin menanyakan harga dan ketersediaan ${product.brand || ''} ${product.model || product.name}. Mohon bantu cek kecocokan produk ini untuk kebutuhan saya.`;
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        model: product.model || undefined,
        sku: product.id,
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        category: category.name,
        description: product.description || product.shortDesc || product.name,
        image: product.images ? [product.images] : undefined,
        url: canonicalUrl,
        additionalProperty: displaySpecs.map(([name, value]) => ({
          '@type': 'PropertyValue',
          name: name.replaceAll('_', ' '),
          value,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Katalog kompresor', item: `${SITE_URL}/produk` },
          { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/produk?category=${encodeURIComponent(category.slug)}` },
          { '@type': 'ListItem', position: 4, name: product.model || product.name, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="inline-flex items-center gap-2 transition hover:text-teal-800">
            <ArrowLeft aria-hidden="true" className="size-4" /> Katalog
          </Link>
          <span aria-hidden="true">/</span>
          <span>{category.name}</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="max-w-[14rem] truncate font-medium text-slate-900">{product.model || product.name}</span>
        </nav>

        <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex min-h-72 items-center justify-center bg-white p-6 sm:min-h-[32rem] sm:p-10">
            {product.images ? (
              <img src={product.images} alt={`${product.brand || ''} ${product.model || product.name}`} className="max-h-[28rem] w-full object-contain" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-500">Foto model belum tersedia</div>
            )}
          </div>

          <div className="flex flex-col gap-6 border-t border-slate-200 p-6 sm:p-9 lg:border-l lg:border-t-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">{product.brand || 'Kompresor'} · {category.name}</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{product.description || product.shortDesc}</p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-950">Harga dan ketersediaan melalui penawaran</p>
              <p className="mt-1 text-sm leading-5 text-teal-900">Konfirmasikan stok, harga, kelistrikan, refrigeran, dan kecocokan aplikasi kepada tim sebelum pemesanan.</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Spesifikasi katalog</h2>
              <dl className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {displaySpecs.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] gap-4 px-4 py-3 text-sm even:bg-slate-50">
                    <dt className="text-slate-600">{specLabels[key] || key.replaceAll('_', ' ')}</dt>
                    <dd className="break-words font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
                {!displaySpecs.length && product.model && (
                  <div className="grid grid-cols-2 gap-4 px-4 py-3 text-sm"><dt className="text-slate-600">Model</dt><dd className="font-medium">{product.model}</dd></div>
                )}
              </dl>
            </div>

            {sourceUrl && (
              <p className="text-xs leading-5 text-slate-600">
                Referensi teknis: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-800 underline underline-offset-2">{sourceName}<ArrowUpRight aria-hidden="true" className="ml-1 inline size-3.5" /></a>. Spesifikasi dan foto mengacu pada katalog produsen; ketersediaan di Indonesia perlu dikonfirmasi.
              </p>
            )}

            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 flex-1 bg-teal-900 text-white hover:bg-teal-800">
                <a href={`https://wa.me/6281350003423?text=${encodeURIComponent(quoteMessage)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle data-icon="inline-start" /> Tanyakan harga & stok
                </a>
              </Button>
              <Button asChild variant="outline" className="h-12 border-slate-300">
                <Link href="/#produk">Kembali ke katalog</Link>
              </Button>
            </div>
          </div>
        </section>

        <h2 className="sr-only">{title}</h2>
        <p className="sr-only">{description}</p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData).replace(/</g, '\\u003c') }} />
    </main>
  );
}
