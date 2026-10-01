import { db } from '@/lib/db';
import { PageClient } from '@/components/berkat/PageClient';

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
    <PageClient
      categories={JSON.parse(JSON.stringify(categories))}
      featuredProducts={JSON.parse(JSON.stringify(featuredProducts))}
      allProducts={JSON.parse(JSON.stringify(allProducts))}
      testimonials={JSON.parse(JSON.stringify(testimonials))}
    />
  );
}
