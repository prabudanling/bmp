import { db } from './db'

export function slugify(text: string): string {
  return (
    (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  )
}

export async function uniqueProductSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const root = slugify(base)
  let slug = root
  let i = 2
  while (
    await db.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${root}-${i++}`
  }
  return slug
}

export async function uniqueCategorySlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const root = slugify(base)
  let slug = root
  let i = 2
  while (
    await db.category.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${root}-${i++}`
  }
  return slug
}
