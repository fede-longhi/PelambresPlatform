import { cn } from '@/lib/utils';
import {
  formatStoreDiscountLabel,
  formatStorePrice,
  getStoreFinalPriceCents,
  hasStoreDiscount,
} from '@/lib/consts/store-consts';

type StorePriceDisplayProps = {
  priceCents: number;
  discountPercent: number | null;
  currency: string;
  className?: string;
  /** Larger final price for product detail hero. */
  size?: 'card' | 'detail';
  /** Use on dark backgrounds (e.g. store product hero). */
  tone?: 'default' | 'onDark';
};

export function StorePriceDisplay({
  priceCents,
  discountPercent,
  currency,
  className,
  size = 'card',
  tone = 'default',
}: StorePriceDisplayProps) {
  const showDiscount = hasStoreDiscount(discountPercent);
  const finalPriceCents = getStoreFinalPriceCents(priceCents, discountPercent);
  const onDark = tone === 'onDark';

  if (!showDiscount) {
    return (
      <p
        className={cn(
          size === 'detail'
            ? 'text-4xl font-bold tracking-tight md:text-5xl'
            : 'text-lg font-semibold',
          onDark
            ? 'text-primary-foreground'
            : size === 'detail'
              ? 'text-primary'
              : 'text-heading-foreground',
          className
        )}
      >
        {formatStorePrice(priceCents, currency)}
      </p>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1', className)}>
      <span
        className={cn(
          'font-bold tracking-tight',
          size === 'detail' ? 'text-4xl md:text-5xl' : 'text-lg font-semibold',
          onDark
            ? 'text-primary-foreground'
            : size === 'detail'
              ? 'text-primary'
              : 'text-heading-foreground'
        )}
      >
        {formatStorePrice(finalPriceCents, currency)}
      </span>
      <span
        className={cn(
          'line-through',
          size === 'detail' ? 'text-lg' : 'text-sm',
          onDark ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}
      >
        {formatStorePrice(priceCents, currency)}
      </span>
      <span
        className={cn(
          'rounded-full bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground',
          size === 'detail' ? 'text-sm' : 'text-xs'
        )}
      >
        {formatStoreDiscountLabel(discountPercent!)}
      </span>
    </div>
  );
}
