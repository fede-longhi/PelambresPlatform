'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createStoreCheckout,
  type StoreCheckoutFormState,
} from '@/lib/actions/store-checkout-actions';
import type { StoreProductType } from '@/types/store-definitions';

type StoreBuyButtonProps = {
  productId: string;
  productType: StoreProductType;
  productName: string;
  disabled?: boolean;
};

export function StoreBuyButton({
  productId,
  productType,
  productName,
  disabled,
}: StoreBuyButtonProps) {
  const initialState: StoreCheckoutFormState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createStoreCheckout,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productType" value={productType} />

      {state.message ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={disabled || isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={18} aria-hidden="true" />
            Redirigiendo a Mercado Pago…
          </>
        ) : (
          `Comprar ${productName}`
        )}
      </Button>
    </form>
  );
}
