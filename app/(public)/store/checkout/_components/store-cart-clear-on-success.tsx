'use client';

import { useEffect } from 'react';
import { useStoreCartOptional } from '@/components/store/store-cart-provider';

/** Clears local cart after a successful Mercado Pago return. */
export function StoreCartClearOnSuccess() {
  const cart = useStoreCartOptional();
  const clearCart = cart?.clearCart;

  useEffect(() => {
    clearCart?.();
  }, [clearCart]);

  return null;
}
