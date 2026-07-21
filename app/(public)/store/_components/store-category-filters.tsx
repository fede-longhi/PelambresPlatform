import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getStoreCatalogHref } from '@/lib/consts/store-consts';
import type { PublishedStoreProductSort } from '@/lib/data/store-product-data';
import type { StoreCategory, StoreProductType } from '@/types/store-definitions';

type StoreCategoryFiltersProps = {
  productType: StoreProductType;
  categories: StoreCategory[];
  activeCategorySlug?: string;
  query?: string;
  sort?: PublishedStoreProductSort;
  minPrice?: string;
  maxPrice?: string;
  discountedOnly?: boolean;
  inStockOnly?: boolean;
};

function buildCatalogHref(
  productType: StoreProductType,
  options?: {
    categorySlug?: string;
    query?: string;
    sort?: PublishedStoreProductSort;
    minPrice?: string;
    maxPrice?: string;
    discountedOnly?: boolean;
    inStockOnly?: boolean;
  }
) {
  const params = new URLSearchParams();
  if (options?.categorySlug) {
    params.set('category', options.categorySlug);
  }
  if (options?.query?.trim()) {
    params.set('query', options.query.trim());
  }
  if (options?.sort && options.sort !== 'newest') {
    params.set('sort', options.sort);
  }
  if (options?.minPrice) {
    params.set('minPrice', options.minPrice);
  }
  if (options?.maxPrice) {
    params.set('maxPrice', options.maxPrice);
  }
  if (options?.discountedOnly) {
    params.set('discounted', 'true');
  }
  if (options?.inStockOnly) {
    params.set('inStock', 'true');
  }

  const queryString = params.toString();
  const catalogHref = getStoreCatalogHref(productType);
  return queryString ? `${catalogHref}?${queryString}` : catalogHref;
}

const chipClassName =
  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

export function StoreCategoryFilters({
  productType,
  categories,
  activeCategorySlug,
  query,
  sort,
  minPrice,
  maxPrice,
  discountedOnly,
  inStockOnly,
}: StoreCategoryFiltersProps) {
  const activeFilters = {
    query,
    sort,
    minPrice,
    maxPrice,
    discountedOnly,
    inStockOnly,
  };

  return (
    <nav
      aria-label="Filtrar por categoría"
      className="flex flex-wrap gap-2"
    >
      <Link
        href={buildCatalogHref(productType, activeFilters)}
        className={cn(
          chipClassName,
          !activeCategorySlug
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-primary/5'
        )}
        aria-current={!activeCategorySlug ? 'true' : undefined}
      >
        Todas
      </Link>
      {categories.map((category) => {
        const isActive = activeCategorySlug === category.slug;
        return (
          <Link
            key={category.id}
            href={buildCatalogHref(productType, {
              ...activeFilters,
              categorySlug: category.slug,
            })}
            className={cn(
              chipClassName,
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-primary/5'
            )}
            aria-current={isActive ? 'true' : undefined}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
