'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStoreCart } from '@/components/store/store-cart-provider';
import { StoreCartClient } from './store-cart-client';
import { loadStoreCartProducts } from '@/lib/actions/store-cart-actions';
import type { PublishedStoreProduct } from '@/lib/data/store-product-data';

export function StoreCartPageClient() {
  const { lines, isReady } = useStoreCart();
  const [products, setProducts] = useState<PublishedStoreProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const productIdsKey = useMemo(
    () =>
      Array.from(new Set(lines.map((line) => line.productId)))
        .sort()
        .join(','),
    [lines]
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;
    const productIds = productIdsKey
      ? productIdsKey.split(',').filter(Boolean)
      : [];

    setIsLoadingProducts(true);
    loadStoreCartProducts(productIds)
      .then((nextProducts) => {
        if (!cancelled) {
          setProducts(nextProducts);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, productIdsKey]);

  if (!isReady || isLoadingProducts) {
    return <p className="text-sm text-muted-foreground">Cargando carrito…</p>;
  }

  return <StoreCartClient products={products} />;
}
