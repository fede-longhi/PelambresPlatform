import { StoreProductCard } from './store-product-card';
import type { PublishedStoreProduct } from '@/lib/data/store-product-data';

type StoreFeaturedSectionProps = {
  products: PublishedStoreProduct[];
};

export function StoreFeaturedSection({ products }: StoreFeaturedSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-heading-foreground">Destacados</h2>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
          Todavía no hay artículos destacados. Explorá los catálogos de artículos y
          diseños.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <StoreProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
