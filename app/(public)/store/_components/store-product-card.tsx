import Link from 'next/link';
import Image from 'next/image';
import { Download, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStoreProductHref } from '@/lib/consts/store-consts';
import type { PublishedStoreProduct } from '@/lib/data/store-product-data';
import { StorePriceDisplay } from './store-price-display';

type StoreProductCardProps = {
  product: PublishedStoreProduct;
};

export function StoreProductCard({ product }: StoreProductCardProps) {
  const isDesign = product.productType === 'design';
  const isOutOfStock =
    product.productType === 'product' && (product.stock ?? 0) <= 0;

  return (
    <Link
      href={getStoreProductHref(product.productType, product.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/40">
              {isDesign ? (
                <Download size={40} aria-hidden="true" />
              ) : (
                <Package size={40} aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {product.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
            {isOutOfStock && <Badge variant="outline">Sin stock</Badge>}
          </div>

          <h2 className="mb-2 text-xl font-bold text-heading-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h2>

          {product.description && (
            <p className="mb-6 line-clamp-3 flex-1 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-auto">
            <StorePriceDisplay
              priceCents={product.priceCents}
              discountPercent={product.discountPercent}
              currency={product.currency}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
