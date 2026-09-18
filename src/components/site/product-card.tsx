'use client'

import { Package, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRupiah } from '@/lib/format'
import { useApp } from '@/lib/store'
import type { ProductDTO } from '@/lib/types'

export function ProductCard({
  product,
  index = 0,
}: {
  product: ProductDTO
  index?: number
}) {
  const navigate = useApp((s) => s.navigate)
  const img = product.images[0]

  return (
    <div
      className="group cursor-pointer animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      onClick={() => navigate(`/produk/${product.slug}`)}
      role="link"
      aria-label={`Lihat detail ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/produk/${product.slug}`)
      }}
      tabIndex={0}
    >
      <Card className="h-full gap-0 overflow-hidden py-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted/40">
          {img ? (
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
          {product.isFeatured && (
            <Badge className="absolute left-2 top-2 gap-1 bg-amber-500 text-white hover:bg-amber-500">
              <Star className="h-3 w-3" /> Unggulan
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute right-2 top-2">
              Stok Habis
            </Badge>
          )}
        </div>
        <CardContent className="space-y-1.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-primary">
              {product.category?.name || 'Lainnya'}
            </span>
            {product.brand && (
              <span className="text-xs text-muted-foreground">
                {product.brand}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug group-hover:text-primary">
            {product.name}
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-primary">
              {formatRupiah(product.price)}
            </span>
            {product.stock > 0 ? (
              <span className="text-xs text-muted-foreground">
                Stok {product.stock}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full gap-0 overflow-hidden py-0">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardContent className="space-y-2 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-24" />
      </CardContent>
    </Card>
  )
}
