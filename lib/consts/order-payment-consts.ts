import {
  ORDER_PAYMENT_KIND_VALUES,
  ORDER_PAYMENT_METHOD_VALUES,
  ORDER_PAYMENT_STATUS_VALUES,
  type OrderPaymentKind,
  type OrderPaymentStatus,
} from '@/types/order-definitions';

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  pending: 'Pendiente',
  deposit: 'Señado',
  partial: 'Parcial',
  paid: 'Pagado',
};

export const ORDER_PAYMENT_KIND_LABELS: Record<OrderPaymentKind, string> = {
  deposit: 'Seña',
  partial: 'Pago parcial',
  full: 'Pago total',
};

export const ORDER_PAYMENT_METHOD_OPTIONS = [
  { value: 'transfer', label: 'Transferencia' },
  { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'other', label: 'Otro' },
] as const;

export function isOrderPaymentStatus(
  value: string
): value is OrderPaymentStatus {
  return ORDER_PAYMENT_STATUS_VALUES.includes(value as OrderPaymentStatus);
}

export function isOrderPaymentKind(value: string): value is OrderPaymentKind {
  return ORDER_PAYMENT_KIND_VALUES.includes(value as OrderPaymentKind);
}

export function getOrderPaymentStatusLabel(status: string): string {
  if (isOrderPaymentStatus(status)) {
    return ORDER_PAYMENT_STATUS_LABELS[status];
  }

  return status;
}

export function getOrderPaymentKindLabel(kind: string): string {
  if (isOrderPaymentKind(kind)) {
    return ORDER_PAYMENT_KIND_LABELS[kind];
  }

  return kind;
}

export function getOrderPaymentMethodLabel(method: string): string {
  const option = ORDER_PAYMENT_METHOD_OPTIONS.find(
    (item) => item.value === method
  );
  return option?.label ?? method;
}

export function getOrderPaymentBadgeClass(status: string): string | undefined {
  if (status === 'deposit') {
    return 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100';
  }

  if (status === 'partial') {
    return 'border-transparent bg-sky-100 text-sky-900 hover:bg-sky-100';
  }

  if (status === 'paid') {
    return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
  }

  return undefined;
}

export function getOrderPaymentRemainingCents(
  amountCents: number,
  paidAmountCents: number
) {
  return Math.max(0, amountCents - paidAmountCents);
}

export function deriveOrderPaymentStatus(
  paidAmountCents: number,
  orderAmountCents: number,
  kinds: readonly OrderPaymentKind[]
): OrderPaymentStatus {
  if (paidAmountCents <= 0 || kinds.length === 0) {
    return 'pending';
  }

  if (paidAmountCents >= orderAmountCents) {
    return 'paid';
  }

  if (kinds.some((kind) => kind === 'partial')) {
    return 'partial';
  }

  return 'deposit';
}

export { ORDER_PAYMENT_KIND_VALUES, ORDER_PAYMENT_METHOD_VALUES };
