import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Download, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchStoreCategoriesByType } from '@/lib/data/store-category-data';
import {
  fetchPublishedStoreProducts,
  type PublishedStoreProductSort,
} from '@/lib/data/store-product-data';
import {
  getStoreCatalogHref,
  getStoreProductTypeLabel,
  parseStoreTypeFromPath,
} from '@/lib/consts/store-consts';
import { StoreCategoryFilters } from '../_components/store-category-filters';
import { StoreBreadcrumbs } from '../_components/store-breadcrumbs';
import {
  StoreCatalogControls,
  StoreCatalogControlsSkeleton,
} from '../_components/store-catalog-controls';
import { StoreProductCard } from '../_components/store-product-card';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ storeType: string }>;
  searchParams?: Promise<{
    category?: string;
    query?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    discounted?: string;
    inStock?: string;
  }>;
};

const validSorts = new Set<PublishedStoreProductSort>([
  'newest',
  'price-asc',
  'price-desc',
  'name-asc',
]);

function parseSort(value?: string): PublishedStoreProductSort {
  return validSorts.has(value as PublishedStoreProductSort)
    ? (value as PublishedStoreProductSort)
    : 'newest';
}

function parsePriceToCents(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const price = Number(value.replace(',', '.'));
  return Number.isFinite(price) && price >= 0
    ? Math.round(price * 100)
    : undefined;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { storeType } = await params;
  const productType = parseStoreTypeFromPath(storeType);

  if (!productType) {
    return { title: 'Tienda' };
  }

  const label = getStoreProductTypeLabel(productType);
  return {
    title: `${label} | Tienda Pelambres`,
    description:
      productType === 'product'
        ? 'Artículos listos para retirar. Coordinación por WhatsApp o mail.'
        : 'Diseños 3D digitales para descargar.',
  };
}

export default async function StoreCatalogByTypePage({
  params,
  searchParams,
}: PageProps) {
  const { storeType } = await params;
  const productType = parseStoreTypeFromPath(storeType);

  if (!productType) {
    notFound();
  }

  const resolvedSearch = await searchParams;
  const categorySlug = resolvedSearch?.category;
  const query = resolvedSearch?.query?.trim() ?? '';
  const sort = parseSort(resolvedSearch?.sort);
  const minPriceCents = parsePriceToCents(resolvedSearch?.minPrice);
  const maxPriceCents = parsePriceToCents(resolvedSearch?.maxPrice);
  const discountedOnly = resolvedSearch?.discounted === 'true';
  const inStockOnly =
    productType === 'product' && resolvedSearch?.inStock === 'true';
  const [categories, products] = await Promise.all([
    fetchStoreCategoriesByType(productType, { activeOnly: true }),
    fetchPublishedStoreProducts(productType, {
      categorySlug,
      query,
      sort,
      minPriceCents,
      maxPriceCents,
      discountedOnly,
      inStockOnly,
    }),
  ]);

  const label = getStoreProductTypeLabel(productType);
  const Icon = productType === 'design' ? Download : Package;
  const catalogHref = getStoreCatalogHref(productType);
  const hasActiveFilters = Boolean(
    categorySlug ||
      query ||
      minPriceCents !== undefined ||
      maxPriceCents !== undefined ||
      discountedOnly ||
      inStockOnly
  );
  const resultsLabel =
    products.length === 1
      ? `1 ${label.toLowerCase().replace(/s$/, '')}`
      : `${products.length} ${label.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-muted font-sans">
      <section className="bg-background px-4 pb-6 pt-14 sm:pb-8 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <StoreBreadcrumbs
            items={[
              { label: 'Inicio', href: '/store' },
              { label },
            ]}
          />
          <div className="space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
                <Icon size={28} aria-hidden="true" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-heading-foreground md:text-5xl">
                {label}
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {productType === 'product'
                ? 'Listos para retirar. Coordinación por WhatsApp y mail.'
                : 'Archivos de diseño 3D. La descarga online llega con el checkout.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:pb-16 sm:pt-4">
        <div className="mb-8 space-y-4">
          <Suspense fallback={<StoreCatalogControlsSkeleton />}>
            <StoreCatalogControls
              productType={productType}
              placeholder={`Buscar ${label.toLowerCase()}…`}
              categories={categories}
            />
          </Suspense>
          <StoreCategoryFilters
            productType={productType}
            categories={categories}
            activeCategorySlug={categorySlug}
            query={query}
            sort={sort}
            minPrice={
              minPriceCents !== undefined ? resolvedSearch?.minPrice : undefined
            }
            maxPrice={
              maxPriceCents !== undefined ? resolvedSearch?.maxPrice : undefined
            }
            discountedOnly={discountedOnly}
            inStockOnly={inStockOnly}
          />
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <Icon
              className="mx-auto mb-4 text-muted-foreground/40"
              size={48}
              aria-hidden="true"
            />
            <h2 className="mb-2 text-xl font-bold text-heading-foreground">
              {hasActiveFilters
                ? 'No hay resultados con estos filtros'
                : `No hay ${label.toLowerCase()} publicados`}
            </h2>
            <p className="text-muted-foreground">
              {hasActiveFilters ? (
                <>
                  Probá ajustar la búsqueda o los filtros, o{' '}
                  <Link
                    href="/quote-request"
                    className="font-medium text-primary hover:underline"
                  >
                    pedí un presupuesto
                  </Link>
                  .
                </>
              ) : (
                <>
                  Pronto vamos a sumar más. Mientras tanto podés{' '}
                  <Link
                    href="/quote-request"
                    className="font-medium text-primary hover:underline"
                  >
                    pedir un presupuesto
                  </Link>
                  .
                </>
              )}
            </p>
            {hasActiveFilters && (
              <Button asChild variant="outline" className="mt-6 rounded-full">
                <Link href={catalogHref}>Limpiar filtros</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {resultsLabel}
            </p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
