import type { QuoteItem, QuoteMath, TaxItem } from '@/types/quote';

export function getItemTotal(item: QuoteItem): number {
  return item.quantity * item.price * (1 - item.discount / 100);
}

export function computeQuoteMath(
  items: QuoteItem[],
  taxes: TaxItem[],
  globalDiscount: number
): QuoteMath {
  const itemsSubtotal = items.reduce(
    (accumulator, item) => accumulator + getItemTotal(item),
    0
  );
  const globalDiscountAmount = itemsSubtotal * (globalDiscount / 100);
  const taxableSubtotal = itemsSubtotal - globalDiscountAmount;

  const calculatedTaxes = taxes.map((tax) => ({
    ...tax,
    amount: taxableSubtotal * (tax.percentage / 100),
  }));

  const totalTaxes = calculatedTaxes.reduce(
    (accumulator, tax) => accumulator + tax.amount,
    0
  );
  const total = taxableSubtotal + totalTaxes;

  return {
    itemsSubtotal,
    globalDiscountAmount,
    taxableSubtotal,
    calculatedTaxes,
    totalTaxes,
    total,
    getItemTotal,
  };
}

export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}

export function centsToPesos(cents: number): number {
  return cents / 100;
}
