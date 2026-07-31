'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useStoreCartOptional } from '@/components/store/store-cart-provider';
import { getStoreCartHref } from '@/lib/consts/store-cart-consts';
import { cn } from '@/lib/utils';

type StoreCartBadgeProps = {
  className?: string;
  onNavigate?: () => void;
};

export function StoreCartBadge({ className, onNavigate }: StoreCartBadgeProps) {
  const cart = useStoreCartOptional();
  if (!cart) {
    return null;
  }

  const { itemCount, isReady } = cart;
  const showCount = isReady && itemCount > 0;

  return (
    <Link
      href={getStoreCartHref()}
      onClick={onNavigate}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10',
        className
      )}
      aria-label={
        showCount
          ? `Carrito de compras, ${itemCount} artículos`
          : 'Carrito de compras'
      }
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {showCount ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-300 px-1 text-[11px] font-bold text-slate-900">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
