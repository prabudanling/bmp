import { Product } from '@prisma/client'
import { ProductDTO, SpecItem } from './types'

export type ProductWithCategory = Product & {
  category: { id: string; name: string; slug: string; icon: string } | null
}

export function toProductDTO(p: ProductWithCategory): ProductDTO {
  let specs: SpecItem[] = []
  let images: string[] = []
  try {
    specs = JSON.parse(p.specs || '[]')
  } catch {
    specs = []
  }
  try {
    images = JSON.parse(p.images || '[]')
  } catch {
    images = []
  }
  return {
    ...p,
    specs,
    images,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}
