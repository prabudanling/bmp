import { Pool } from 'pg';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { bigint, boolean, doublePrecision, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const cmsArticles = pgTable('cms_articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  seoTitle: text('seo_title').notNull(),
  seoDescription: text('seo_description').notNull(),
  status: text('status').notNull(),
  authorName: text('author_name').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const cmsSettings = pgTable('cms_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  image: text('image'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  shortDesc: text('short_desc'),
  price: doublePrecision('price').notNull(),
  originalPrice: doublePrecision('original_price'),
  categoryId: text('category_id').notNull(),
  brand: text('brand'),
  model: text('model'),
  specifications: text('specifications'),
  images: text('images'),
  inStock: boolean('in_stock').notNull(),
  isFeatured: boolean('is_featured').notNull(),
  isNew: boolean('is_new').notNull(),
  minOrder: integer('min_order').notNull(),
  unit: text('unit').notNull(),
  viewCount: integer('view_count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company'),
  position: text('position'),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  avatar: text('avatar'),
  isApproved: boolean('is_approved').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

const globalForCms = globalThis as typeof globalThis & { cmsPool?: Pool };
const pool = globalForCms.cmsPool ?? new Pool({
  connectionString: process.env.POSTGRES_URL ?? process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});

if (process.env.NODE_ENV !== 'production') globalForCms.cmsPool = pool;

export const cmsDb = drizzle(pool, { schema: { cmsArticles, cmsSettings, categories, products, testimonials } });

export type CmsArticle = typeof cmsArticles.$inferSelect;
export type CmsCategory = typeof categories.$inferSelect;
export type CmsProduct = typeof products.$inferSelect;

export async function getCmsSetting(key: string) {
  const [setting] = await cmsDb.select({ value: cmsSettings.value }).from(cmsSettings).where((await import('drizzle-orm')).eq(cmsSettings.key, key)).limit(1);
  return setting?.value ?? null;
}

export async function getSiteSeoSettings() {
  const settings = await cmsDb.select().from(cmsSettings);
  const values = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
  return {
    siteTitle: values.site_title || 'Berkat Mandiri Pendingin',
    siteDescription: values.site_description || 'Distributor HVAC resmi sejak 2010 di Kawasan MM2100 Bekasi. Pusat penjualan AC, kompresor, refrigerant, spare part, chiller, VRV/VRF, dan sistem pendingin gedung terlengkap.',
  };
}

export async function getPublishedArticles() {
  return cmsDb.select().from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published')).orderBy((await import('drizzle-orm')).desc(cmsArticles.publishedAt));
}

export async function getApprovedTestimonials() {
  return cmsDb.select({
    id: testimonials.id,
    name: testimonials.name,
    company: testimonials.company,
    position: testimonials.position,
    content: testimonials.content,
    rating: testimonials.rating,
  }).from(testimonials).where((await import('drizzle-orm')).eq(testimonials.isApproved, true)).orderBy((await import('drizzle-orm')).desc(testimonials.createdAt));
}

export async function getArticleBySlug(slug: string) {
  const { and, eq } = await import('drizzle-orm');
  const [article] = await cmsDb.select().from(cmsArticles).where(and(eq(cmsArticles.slug, slug), eq(cmsArticles.status, 'published'))).limit(1);
  return article ?? null;
}

export async function getPublishedArticleSlugs() {
  return cmsDb.select({ slug: cmsArticles.slug, updatedAt: cmsArticles.updatedAt }).from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published'));
}

export async function getAdminArticles() {
  return cmsDb.select().from(cmsArticles).orderBy((await import('drizzle-orm')).desc(cmsArticles.updatedAt));
}

export async function getAdminArticle(id: string) {
  const [article] = await cmsDb.select().from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.id, id)).limit(1);
  return article ?? null;
}

export async function articleSlugExists(slug: string, excludingId?: string) {
  const { and, eq, ne } = await import('drizzle-orm');
  const predicate = excludingId
    ? and(eq(cmsArticles.slug, slug), ne(cmsArticles.id, excludingId))
    : eq(cmsArticles.slug, slug);
  const [article] = await cmsDb.select({ id: cmsArticles.id }).from(cmsArticles).where(predicate).limit(1);
  return Boolean(article);
}

export async function saveCmsArticle(article: typeof cmsArticles.$inferInsert) {
  await cmsDb.insert(cmsArticles).values(article).onConflictDoUpdate({
    target: cmsArticles.id,
    set: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      status: article.status,
      authorName: article.authorName,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    },
  });
}

export async function deleteCmsArticle(id: string) {
  await cmsDb.delete(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.id, id));
}

export async function getAdminOverview() {
  const [{ count: articleCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles);
  const [{ count: publishedCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published'));
  const [{ count: productCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(products);
  return { articleCount, publishedCount, productCount };
}

export async function getAdminCategories() {
  return cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getAdminProduct(id: string) {
  const [product] = await cmsDb.select().from(products).where((await import('drizzle-orm')).eq(products.id, id)).limit(1);
  return product ?? null;
}

export async function getAdminProducts() {
  return cmsDb.select({ product: products, categoryName: categories.name }).from(products).leftJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).orderBy((await import('drizzle-orm')).desc(products.updatedAt));
}

export async function getPublishedCatalog() {
  return cmsDb.select({ product: products, category: { id: categories.id, name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where((await import('drizzle-orm')).eq(products.inStock, true)).orderBy((await import('drizzle-orm')).desc(products.createdAt));
}

export async function getFeaturedCatalog() {
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where((await import('drizzle-orm')).eq(products.isFeatured, true)).orderBy((await import('drizzle-orm')).desc(products.createdAt)).limit(8);
}

export async function getCategoryList() {
  return cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getAdminCategory(id: string) {
  const [category] = await cmsDb.select().from(categories).where((await import('drizzle-orm')).eq(categories.id, id)).limit(1);
  return category ?? null;
}

export async function getCategoryProductCounts() {
  return cmsDb.select({ category: categories, count: (await import('drizzle-orm')).count(products.id) }).from(categories).leftJoin(products, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).groupBy(categories.id).orderBy(categories.sortOrder, categories.name);
}

export async function getPublicProductsBySlug(slug: string) {
  const { and, eq } = await import('drizzle-orm');
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where(and(eq(products.slug, slug), eq(products.inStock, true))).limit(1);
}

export async function incrementPublicProductView(id: string) {
  const { eq, sql } = await import('drizzle-orm');
  await cmsDb.update(products).set({ viewCount: sql`${products.viewCount} + 1` }).where(eq(products.id, id));
}

export async function getPublishedCatalogSlugs() {
  return cmsDb.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true));
}

export async function getCatalogSearchResults(query: string) {
  const { and, eq, ilike, or } = await import('drizzle-orm');
  const search = `%${query.replace(/[\\%_]/g, '\\$&')}%`;
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(and(eq(products.inStock, true), or(ilike(products.name, search), ilike(products.shortDesc, search), ilike(products.brand, search)))).orderBy(products.name).limit(50);
}

export async function getCatalogSummary() {
  const [{ count: categoriesCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(categories);
  const [{ count: productsCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(products);
  return { categoriesCount, productsCount };
}

export async function getCatalogCategory(slug: string) {
  const { eq } = await import('drizzle-orm');
  const [category] = await cmsDb.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return category ?? null;
}

export async function getCatalogProductsByCategory(slug: string) {
  const { eq } = await import('drizzle-orm');
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(eq(categories.slug, slug)).orderBy(products.name);
}

export async function getProductPriceRange() {
  const [{ min, max }] = await cmsDb.select({ min: (await import('drizzle-orm')).min(products.price), max: (await import('drizzle-orm')).max(products.price) }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true));
  return { min: min ?? 0, max: max ?? 0 };
}

export async function getCatalogFilterOptions() {
  const [brands, categoriesList] = await Promise.all([
    cmsDb.selectDistinct({ brand: products.brand }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true)),
    cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name),
  ]);
  return { brands: brands.flatMap(({ brand }) => brand ? [brand] : []), categories: categoriesList };
}

export async function getCatalogProductCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true));
  return count;
}

export async function getCatalogCategoryCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(categories);
  return count;
}

export async function getFeaturedProductSlugs() {
  return cmsDb.select({ slug: products.slug }).from(products).where((await import('drizzle-orm')).eq(products.isFeatured, true));
}

export async function getCatalogBreadcrumb(slug: string) {
  const { eq } = await import('drizzle-orm');
  const [category] = await cmsDb.select({ name: categories.name, slug: categories.slug }).from(categories).where(eq(categories.slug, slug)).limit(1);
  return category ?? null;
}

export async function getCmsRuntimeConfig() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

export async function getCatalogProduct(id: string) {
  const [product] = await cmsDb.select().from(products).where((await import('drizzle-orm')).eq(products.id, id)).limit(1);
  return product ?? null;
}

export async function getPublicCategories() {
  return cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getPublicFeaturedProducts() {
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where((await import('drizzle-orm')).and((await import('drizzle-orm')).eq(products.isFeatured, true), (await import('drizzle-orm')).eq(products.inStock, true))).orderBy((await import('drizzle-orm')).desc(products.createdAt)).limit(8);
}

export async function getProductDetails(slug: string) {
  const { eq } = await import('drizzle-orm');
  const [row] = await cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.slug, slug)).limit(1);
  return row ?? null;
}

export async function getCatalogLastModified() {
  const [{ updatedAt }] = await cmsDb.select({ updatedAt: (await import('drizzle-orm')).max(products.updatedAt) }).from(products);
  return updatedAt ?? new Date();
}

export async function getCatalogPageData() {
  const [categoriesList, productsList] = await Promise.all([
    getPublicCategories(),
    getPublishedCatalog(),
  ]);
  return { categories: categoriesList, products: productsList };
}

export async function getAdminSettings() {
  const [siteTitle, siteDescription] = await Promise.all([getCmsSetting('site_title'), getCmsSetting('site_description')]);
  return { siteTitle: siteTitle ?? 'Berkat Mandiri Pendingin', siteDescription: siteDescription ?? 'Distributor HVAC resmi sejak 2010 di Kawasan MM2100 Bekasi.' };
}

export async function getArticleTotalCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles);
  return count;
}

export async function getPublicArticleTotalCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published'));
  return count;
}

export async function getCmsRecentArticles(limit = 5) {
  return cmsDb.select().from(cmsArticles).orderBy((await import('drizzle-orm')).desc(cmsArticles.updatedAt)).limit(limit);
}

export async function getCmsSettings() {
  return cmsDb.select().from(cmsSettings);
}

export async function getCmsDashboardData() {
  const [counts, articles, settings, productsList, categoriesList] = await Promise.all([
    getAdminOverview(), getCmsRecentArticles(5), getAdminSettings(), getAdminProducts(), getAdminCategories(),
  ]);
  return { counts, articles, settings, products: productsList, categories: categoriesList };
}

export async function getAdminCatalog() {
  const [productsList, categoriesList] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return { products: productsList, categories: categoriesList };
}

export async function getCatalogProductsPage(
  query: string,
  categorySlug: string,
  pageSize: number,
  offset: number,
) {
  const { and, count, eq, ilike, or } = await import('drizzle-orm');
  const predicates = [eq(products.inStock, true), eq(products.brand, 'Embraco')];
  const normalizedQuery = query.trim().slice(0, 100);
  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replace(/[\\%_]/g, '\\$&');
    const search = `%${escapedQuery}%`;
    predicates.push(or(
      ilike(products.name, search),
      ilike(products.model, search),
      ilike(products.brand, search),
      ilike(products.shortDesc, search),
    )!);
  }
  if (categorySlug) {
    predicates.push(eq(categories.slug, categorySlug));
  }

  const where = and(...predicates);
  const [rows, [{ total }]] = await Promise.all([
    cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(products.name)
      .limit(Math.min(Math.max(pageSize, 1), 48))
      .offset(Math.max(offset, 0)),
    cmsDb.select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  return { products: rows, total: Number(total) };
}

export async function getAdminProductsPage(query: string, pageSize: number, offset: number) {
  const { count, ilike, or } = await import('drizzle-orm');
  const normalizedQuery = query.trim().slice(0, 100);
  const escapedQuery = normalizedQuery.replace(/[\\%_]/g, '\\$&');
  const search = `%${escapedQuery}%`;
  const where = normalizedQuery
    ? or(
        ilike(products.name, search),
        ilike(products.model, search),
        ilike(products.brand, search),
        ilike(products.shortDesc, search),
      )
    : undefined;
  const [rows, [{ total }]] = await Promise.all([
    cmsDb.select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id))
      .where(where)
      .orderBy((await import('drizzle-orm')).desc(products.updatedAt), products.name)
      .limit(Math.min(Math.max(pageSize, 1), 100))
      .offset(Math.max(offset, 0)),
    cmsDb.select({ total: count() }).from(products).where(where),
  ]);

  return { products: rows, total: Number(total) };
}

export async function getHomepageCatalogPreview() {
  return cmsDb.select({
    product: products,
    category: { id: categories.id, name: categories.name, slug: categories.slug },
  })
    .from(products)
    .innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id))
    .where((await import('drizzle-orm')).eq(products.inStock, true))
    .orderBy((await import('drizzle-orm')).desc(products.createdAt), products.name)
    .limit(12);
}
