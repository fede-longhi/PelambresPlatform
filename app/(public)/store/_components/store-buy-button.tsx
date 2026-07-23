'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  defaultEmail?: string;
  defaultName?: string;
};

export function StoreBuyButton({
  productId,
  productType,
  productName,
  disabled,
  defaultEmail = '',
  defaultName = '',
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

      <div className="space-y-2">
        <Label htmlFor="buyerName">Nombre</Label>
        <Input
          id="buyerName"
          name="buyerName"
          defaultValue={defaultName}
          required
          disabled={disabled || isPending}
          autoComplete="name"
          aria-describedby="buyerName-error"
        />
        <div id="buyerName-error" aria-live="polite" aria-atomic="true">
          {state.errors?.buyerName?.map((error) => (
            <p className="text-xs text-red-500" key={error}>
              {error}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buyerEmail">Email</Label>
        <Input
          id="buyerEmail"
          name="buyerEmail"
          type="email"
          defaultValue={defaultEmail}
          required
          disabled={disabled || isPending}
          autoComplete="email"
          aria-describedby="buyerEmail-error"
        />
        <div id="buyerEmail-error" aria-live="polite" aria-atomic="true">
          {state.errors?.buyerEmail?.map((error) => (
            <p className="text-xs text-red-500" key={error}>
              {error}
            </p>
          ))}
        </div>
      </div>

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
