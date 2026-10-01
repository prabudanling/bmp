import { db } from '@/lib/db';
import { PageClient } from '@/components/berkat/PageClient';

const SITE_URL = 'https://www.berkatmandiripendingin.com';

// Structured data (JSON-LD) — helps Google understand and permanently index the business
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'LocalBusiness'],
      '@id': `${SITE_URL}/#organization`,
      name: 'PT Berkat Mandiri Pendingin',
      alternateName: 'Berkat Mandiri Pendingin',
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.svg`,
      image: `${SITE_URL}/images/hero/hero-1.png`,
      description:
        'Distributor HVAC resmi sejak 2010 — pusat penjualan AC, kompresor, refrigerant, spare part, chiller, dan sistem pendingin gedung terlengkap di Indonesia.',
      foundingDate: '2010',
      email: 'berkatmandiripendingin@gmail.com',
      telephone: '+62-21-2268-2617',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kawasan Industri MM2100',
        addressLocality: 'Bekasi',
        addressRegion: 'Jawa Barat',
        addressCountry: 'ID',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-813-5000-3423',
        contactType: 'sales',
        areaServed: 'ID',
        availableLanguage: ['id'],
      },
      areaServed: {
        '@type': 'Country',
        name: 'Indonesia',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Berkat Mandiri Pendingin',
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default async function HomePage() {
  // Fetch ALL data at BUILD TIME — becomes static HTML
  // No server needed at runtime!
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  // Featured products for the hero section
  const featuredProducts = await db.product.findMany({
    where: { isFeatured: true, inStock: true },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  // ALL products — filtering/sorting/pagination happens in the browser!
  const allProducts = await db.product.findMany({
    where: { inStock: true },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Approved testimonials
  const testimonials = await db.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageClient
        categories={JSON.parse(JSON.stringify(categories))}
        featuredProducts={JSON.parse(JSON.stringify(featuredProducts))}
        allProducts={JSON.parse(JSON.stringify(allProducts))}
        testimonials={JSON.parse(JSON.stringify(testimonials))}
      />
    </>
  );
}
