'use client';

import { useEffect, useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ListFilter, Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { PublishedStoreProductSort } from '@/lib/data/store-product-data';
import { formatStorePrice } from '@/lib/consts/store-consts';
import { cn } from '@/lib/utils';
import type { StoreCategory, StoreProductType } from '@/types/store-definitions';

type StoreCatalogControlsProps = {
  productType: StoreProductType;
  placeholder: string;
  categories?: StoreCategory[];
};

const sortOptions: Array<{
  value: PublishedStoreProductSort;
  label: string;
}> = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc', label: 'Nombre: A–Z' },
];

const FILTER_PARAM_KEYS = [
  'category',
  'minPrice',
  'maxPrice',
  'discounted',
  'inStock',
] as const;

const controlHeightClassName = 'h-11';
const controlRadiusClassName = 'rounded-full';

function formatFilterPriceLabel(value: string): string {
  const amount = Number(value.replace(',', '.'));
  if (!Number.isFinite(amount) || amount < 0) {
    return value;
  }

  return formatStorePrice(Math.round(amount * 100), 'ARS');
}

export function StoreCatalogControls({
  productType,
  placeholder,
  categories = [],
}: StoreCatalogControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const filtersPanelId = useId();
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const minPriceParam = searchParams.get('minPrice') ?? '';
  const maxPriceParam = searchParams.get('maxPrice') ?? '';
  const [minPriceDraft, setMinPriceDraft] = useState(minPriceParam);
  const [maxPriceDraft, setMaxPriceDraft] = useState(maxPriceParam);

  useEffect(() => {
    setMinPriceDraft(minPriceParam);
    setMaxPriceDraft(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  const replaceParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const queryString = params.toString();
    replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const updateTextFilter = useDebouncedCallback(
    (key: 'query' | 'minPrice' | 'maxPrice', value: string) => {
      replaceParams({ [key]: value.trim() || null });
    },
    300
  );

  const activeFilterCount = FILTER_PARAM_KEYS.filter((key) => {
    if (key === 'inStock' && productType !== 'product') {
      return false;
    }
    return searchParams.has(key);
  }).length;

  const hasActiveFilters = activeFilterCount > 0;
  const currentSort = (searchParams.get('sort') ??
    'newest') as PublishedStoreProductSort;
  const isDiscounted = searchParams.get('discounted') === 'true';
  const isInStockOnly = searchParams.get('inStock') === 'true';
  const activeCategorySlug = searchParams.get('category');
  const activeCategoryName = categories.find(
    (category) => category.slug === activeCategorySlug
  )?.name;

  const activeFilterSummaries = [
    activeCategoryName
      ? {
          key: 'category',
          label: activeCategoryName,
          clear: () => replaceParams({ category: null }),
        }
      : null,
    minPriceParam
      ? {
          key: 'minPrice',
          label: `Desde ${formatFilterPriceLabel(minPriceParam)}`,
          clear: () => {
            setMinPriceDraft('');
            replaceParams({ minPrice: null });
          },
        }
      : null,
    maxPriceParam
      ? {
          key: 'maxPrice',
          label: `Hasta ${formatFilterPriceLabel(maxPriceParam)}`,
          clear: () => {
            setMaxPriceDraft('');
            replaceParams({ maxPrice: null });
          },
        }
      : null,
    isDiscounted
      ? {
          key: 'discounted',
          label: 'Con descuento',
          clear: () => replaceParams({ discounted: null }),
        }
      : null,
    isInStockOnly
      ? {
          key: 'inStock',
          label: 'Con stock',
          clear: () => replaceParams({ inStock: null }),
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    clear: () => void;
  }>;

  const clearFilters = () => {
    setMinPriceDraft('');
    setMaxPriceDraft('');
    replaceParams({
      category: null,
      minPrice: null,
      maxPrice: null,
      discounted: null,
      inStock: null,
    });
  };

  return (
    <Collapsible
      open={areFiltersOpen}
      onOpenChange={setAreFiltersOpen}
      className="space-y-4 rounded-2xl border border-border bg-background p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem_auto] md:items-end">
        <div className="relative">
          <Label htmlFor="store-search" className="sr-only">
            Buscar en la tienda
          </Label>
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="store-search"
            type="search"
            placeholder={placeholder}
            defaultValue={searchParams.get('query') ?? ''}
            onChange={(event) => updateTextFilter('query', event.target.value)}
            className={cn(
              controlHeightClassName,
              controlRadiusClassName,
              'bg-background py-0 pl-10'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="store-sort" className="text-xs text-muted-foreground">
            Ordenar por
          </Label>
          <Select
            value={currentSort}
            onValueChange={(value) =>
              replaceParams({
                sort: value === 'newest' ? null : value,
              })
            }
          >
            <SelectTrigger
              id="store-sort"
              className={cn(controlHeightClassName, controlRadiusClassName)}
            >
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-controls={filtersPanelId}
              className={cn(
                'relative',
                controlHeightClassName,
                controlRadiusClassName,
                hasActiveFilters &&
                  !areFiltersOpen &&
                  'border-primary text-primary hover:bg-primary/5 hover:text-primary'
              )}
            >
              <ListFilter size={16} className="mr-2" aria-hidden="true" />
              Filtros
              <ChevronDown
                size={16}
                className={cn(
                  'ml-2 transition-transform',
                  areFiltersOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
              {hasActiveFilters && !areFiltersOpen && (
                <Badge className="absolute -right-1.5 -top-1.5 size-5 justify-center rounded-full p-0 text-[11px]">
                  {activeFilterCount}
                  <span className="sr-only">filtros activos</span>
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>

          {hasActiveFilters && !areFiltersOpen && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className={cn(controlHeightClassName, controlRadiusClassName)}
            >
              <X size={15} className="mr-1.5" aria-hidden="true" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && !areFiltersOpen && (
        <div className="space-y-2" role="status">
          <p className="text-sm text-muted-foreground">
            {activeFilterCount === 1
              ? 'Hay 1 filtro activo'
              : `Hay ${activeFilterCount} filtros activos`}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeFilterSummaries.map((summary) => (
              <Button
                key={summary.key}
                type="button"
                variant="secondary"
                size="sm"
                onClick={summary.clear}
                className="h-8 rounded-full"
                aria-label={`Quitar filtro ${summary.label}`}
              >
                {summary.label}
                <X size={14} className="ml-1.5" aria-hidden="true" />
              </Button>
            ))}
          </div>
        </div>
      )}

      <CollapsibleContent id={filtersPanelId} className="space-y-4">
        <Separator />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <fieldset className="flex flex-wrap items-end gap-3">
            <legend className="sr-only">Filtrar por precio</legend>
            <div className="space-y-1.5">
              <Label
                htmlFor="store-min-price"
                className="text-xs text-muted-foreground"
              >
                Precio mínimo
              </Label>
              <Input
                id="store-min-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Mín."
                value={minPriceDraft}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setMinPriceDraft(nextValue);
                  updateTextFilter('minPrice', nextValue);
                }}
                className={cn(
                  controlHeightClassName,
                  controlRadiusClassName,
                  'w-32 bg-background py-0'
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="store-max-price"
                className="text-xs text-muted-foreground"
              >
                Precio máximo
              </Label>
              <Input
                id="store-max-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Máx."
                value={maxPriceDraft}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setMaxPriceDraft(nextValue);
                  updateTextFilter('maxPrice', nextValue);
                }}
                className={cn(
                  controlHeightClassName,
                  controlRadiusClassName,
                  'w-32 bg-background py-0'
                )}
              />
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex min-h-11 items-center gap-2">
              <Switch
                id="store-discounted"
                checked={isDiscounted}
                onCheckedChange={(checked) =>
                  replaceParams({
                    discounted: checked ? 'true' : null,
                  })
                }
              />
              <Label htmlFor="store-discounted" className="cursor-pointer">
                Con descuento
              </Label>
            </div>

            {productType === 'product' && (
              <div className="flex min-h-11 items-center gap-2">
                <Switch
                  id="store-in-stock"
                  checked={isInStockOnly}
                  onCheckedChange={(checked) =>
                    replaceParams({
                      inStock: checked ? 'true' : null,
                    })
                  }
                />
                <Label htmlFor="store-in-stock" className="cursor-pointer">
                  Con stock
                </Label>
              </div>
            )}

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={cn(
                  controlHeightClassName,
                  controlRadiusClassName,
                  'text-muted-foreground'
                )}
              >
                <X size={15} className="mr-1.5" aria-hidden="true" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function StoreCatalogControlsSkeleton() {
  return (
    <div
      className="space-y-4 rounded-2xl border border-border bg-background p-4 shadow-sm"
      aria-hidden="true"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem_auto] md:items-end">
        <div className="h-11 animate-pulse rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-11 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-11 w-28 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
