import type { MetadataRoute } from 'next';
import { getPublishedArticleSlugs } from '@/lib/cms-db';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.berkatmandiripendingin.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticleSlugs();
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/insights`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...articles.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/insights/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
