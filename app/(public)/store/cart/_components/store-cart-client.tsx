'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStoreCart } from '@/components/store/store-cart-provider';
import { StorePaymentMethodSelector } from '../../_components/store-payment-method-selector';
import {
  createStoreCartCheckout,
  type StoreCartCheckoutFormState,
} from '@/lib/actions/store-checkout-actions';
import {
  formatStorePrice,
  getStoreFinalPriceCents,
  getStoreProductHref,
  getStoreProductTypeLabel,
} from '@/lib/consts/store-consts';
import { getStoreCartLineKey } from '@/lib/consts/store-cart-consts';
import type { PublishedStoreProduct } from '@/lib/data/store-product-data';
import type {
  StoreCartLine,
  StorePaymentMethod,
} from '@/types/store-definitions';

type StoreCartClientProps = {
  products: PublishedStoreProduct[];
  transferAvailable?: boolean;
  defaultBuyerName?: string;
  defaultBuyerEmail?: string;
};

export function StoreCartClient({
  products,
  transferAvailable = false,
  defaultBuyerName = '',
  defaultBuyerEmail = '',
}: StoreCartClientProps) {
  const { lines, isReady, setQuantity, removeItem, clearCart } = useStoreCart();
  const [paymentMethod, setPaymentMethod] =
    useState<StorePaymentMethod>('mercadopago');
  const initialState: StoreCartCheckoutFormState = {
    message: null,
    success: false,
  };
  const [state, formAction, isPending] = useActionState(
    createStoreCartCheckout,
    initialState
  );

  const productByKey = useMemo(() => {
    return new Map(
      products.map((product) => [
        getStoreCartLineKey(product.productType, product.id),
        product,
      ])
    );
  }, [products]);

  const resolved = useMemo(() => {
    return lines
      .map((line) => {
        const key = getStoreCartLineKey(line.productType, line.productId);
        const product = productByKey.get(key);
        if (!product) {
          return null;
        }
        const unitPriceCents = getStoreFinalPriceCents(
          product.priceCents,
          product.discountPercent
        );
        return {
          line,
          product,
          unitPriceCents,
          lineTotalCents: unitPriceCents * line.quantity,
        };
      })
      .filter(Boolean) as Array<{
      line: StoreCartLine;
      product: PublishedStoreProduct;
      unitPriceCents: number;
      lineTotalCents: number;
    }>;
  }, [lines, productByKey]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    for (const line of lines) {
      const key = getStoreCartLineKey(line.productType, line.productId);
      if (!productByKey.has(key)) {
        removeItem({
          productId: line.productId,
          productType: line.productType,
        });
      }
    }
  }, [isReady, lines, productByKey, removeItem]);

  const totalCents = resolved.reduce((sum, row) => sum + row.lineTotalCents, 0);
  const currency = resolved[0]?.product.currency ?? 'ARS';
  const checkoutPayload = JSON.stringify(
    resolved.map(({ line }) => ({
      productId: line.productId,
      productType: line.productType,
      quantity: line.quantity,
    }))
  );
  const needsBuyerContact = paymentMethod === 'transfer';

  if (!isReady) {
    return (
      <p className="text-sm text-muted-foreground">Cargando carrito…</p>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium text-slate-800">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Explorá la tienda y agregá artículos o diseños.
        </p>
        <Button asChild className="mt-6">
          <Link href="/store">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ul className="space-y-4">
        {resolved.map(({ line, product, unitPriceCents, lineTotalCents }) => {
          const maxQty =
            product.productType === 'product' && product.stock != null
              ? Math.max(1, product.stock)
              : 99;
          const imageUrl = product.images[0]?.url ?? product.imageUrl;

          return (
            <li
              key={getStoreCartLineKey(line.productType, line.productId)}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <Link
                href={getStoreProductHref(product.productType, product.id)}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {getStoreProductTypeLabel(product.productType)}
                    </p>
                    <Link
                      href={getStoreProductHref(product.productType, product.id)}
                      className="mt-1 block truncate font-semibold text-slate-900 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatStorePrice(unitPriceCents, product.currency)} c/u
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar ${product.name} del carrito`}
                    onClick={() =>
                      removeItem({
                        productId: line.productId,
                        productType: line.productType,
                      })
                    }
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-full border border-slate-200">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Restar cantidad"
                      disabled={line.quantity <= 1}
                      onClick={() =>
                        setQuantity({
                          productId: line.productId,
                          productType: line.productType,
                          quantity: line.quantity - 1,
                        })
                      }
                    >
                      <Minus size={16} aria-hidden="true" />
                    </Button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Sumar cantidad"
                      disabled={line.quantity >= maxQty}
                      onClick={() =>
                        setQuantity({
                          productId: line.productId,
                          productType: line.productType,
                          quantity: line.quantity + 1,
                        })
                      }
                    >
                      <Plus size={16} aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatStorePrice(lineTotalCents, product.currency)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">
            {formatStorePrice(totalCents, currency)}
          </span>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="itemsJson" value={checkoutPayload} />
          <input type="hidden" name="paymentMethod" value={paymentMethod} />

          <StorePaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
            transferAvailable={transferAvailable}
            disabled={isPending}
          />

          {needsBuyerContact ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cart-buyer-name">Nombre</Label>
                <Input
                  id="cart-buyer-name"
                  name="buyerName"
                  defaultValue={defaultBuyerName}
                  required
                  autoComplete="name"
                  disabled={isPending}
                />
                {state.errors?.buyerName?.[0] ? (
                  <p className="text-xs text-red-600">{state.errors.buyerName[0]}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cart-buyer-email">Email</Label>
                <Input
                  id="cart-buyer-email"
                  name="buyerEmail"
                  type="email"
                  defaultValue={defaultBuyerEmail}
                  required
                  autoComplete="email"
                  disabled={isPending}
                />
                {state.errors?.buyerEmail?.[0] ? (
                  <p className="text-xs text-red-600">
                    {state.errors.buyerEmail[0]}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {state.message ? (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} aria-hidden="true" />
                {paymentMethod === 'transfer'
                  ? 'Preparando transferencia…'
                  : 'Redirigiendo a Mercado Pago…'}
              </>
            ) : paymentMethod === 'transfer' ? (
              'Pagar por transferencia'
            ) : (
              'Pagar con Mercado Pago'
            )}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full text-muted-foreground"
          onClick={clearCart}
        >
          Vaciar carrito
        </Button>
      </aside>
    </div>
  );
}
