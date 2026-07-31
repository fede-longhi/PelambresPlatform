'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { Check, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStoreCart } from '@/components/store/store-cart-provider';
import {
  createStoreCheckout,
  type StoreCheckoutFormState,
} from '@/lib/actions/store-checkout-actions';
import { getStoreCartHref } from '@/lib/consts/store-cart-consts';
import type { StoreProductType } from '@/types/store-definitions';

type StorePurchaseControlsProps = {
  productId: string;
  productType: StoreProductType;
  productName: string;
  /** Max quantity for physical products; omit/null for unlimited (designs). */
  maxQuantity?: number | null;
  disabled?: boolean;
};

export function StorePurchaseControls({
  productId,
  productType,
  productName,
  maxQuantity = null,
  disabled,
}: StorePurchaseControlsProps) {
  const { addItem } = useStoreCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const initialState: StoreCheckoutFormState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createStoreCheckout,
    initialState
  );

  const maxAllowed =
    maxQuantity != null && maxQuantity > 0
      ? Math.min(99, Math.floor(maxQuantity))
      : 99;
  const canDecrease = quantity > 1;
  const canIncrease = quantity < maxAllowed;

  const handleAddToCart = () => {
    addItem({ productId, productType, quantity });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="purchase-quantity"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Cantidad
        </label>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label="Restar cantidad"
            disabled={disabled || !canDecrease}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus size={16} aria-hidden="true" />
          </Button>
          <input
            id="purchase-quantity"
            type="number"
            min={1}
            max={maxAllowed}
            value={quantity}
            disabled={disabled}
            onChange={(event) => {
              const nextValue = Number.parseInt(event.target.value, 10);
              if (Number.isNaN(nextValue)) {
                setQuantity(1);
                return;
              }
              setQuantity(Math.min(maxAllowed, Math.max(1, nextValue)));
            }}
            className="h-10 w-14 border-0 bg-transparent text-center text-sm font-semibold tabular-nums text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-live="polite"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label="Sumar cantidad"
            disabled={disabled || !canIncrease}
            onClick={() =>
              setQuantity((current) => Math.min(maxAllowed, current + 1))
            }
          >
            <Plus size={16} aria-hidden="true" />
          </Button>
        </div>
        {productType === 'product' && maxQuantity != null ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Stock disponible: {maxQuantity}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={disabled}
          onClick={handleAddToCart}
        >
          {justAdded ? (
            <>
              <Check className="mr-2" size={18} aria-hidden="true" />
              Agregado ({quantity})
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2" size={18} aria-hidden="true" />
              Agregar al carrito
            </>
          )}
        </Button>
        {justAdded ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={getStoreCartHref()}>Ver carrito</Link>
          </Button>
        ) : null}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-2 text-sm text-muted-foreground">
          ¿Solo este artículo?
        </p>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="productType" value={productType} />
          <input type="hidden" name="quantity" value={quantity} />

          {state.message ? (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={disabled || isPending}
          >
            {isPending ? (
              <>
                <Loader2
                  className="mr-2 animate-spin"
                  size={18}
                  aria-hidden="true"
                />
                Redirigiendo a Mercado Pago…
              </>
            ) : (
              quantity > 1
                ? `Comprar ${quantity} × ${productName}`
                : `Comprar ${productName}`
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
