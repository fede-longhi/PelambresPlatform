import type { OrderStatus } from '@/types/order-definitions';
import { ORDER_STATUS_VALUES, OrderStatuses } from '@/types/order-definitions';

export type OrderListFilter = 'open' | OrderStatus | 'all';

export const ORDER_LIST_FILTERS: {
  value: OrderListFilter;
  label: string;
}[] = [
  { value: 'open', label: 'Activos' },
  { value: 'pending', label: OrderStatuses.pending.label },
  { value: 'in progress', label: OrderStatuses['in progress'].label },
  { value: 'finished', label: OrderStatuses.finished.label },
  { value: 'delivered', label: OrderStatuses.delivered.label },
  { value: 'cancelled', label: OrderStatuses.cancelled.label },
  { value: 'all', label: 'Todos' },
];

export const DEFAULT_ORDER_LIST_FILTER: OrderListFilter = 'open';

export function parseOrderListFilter(
  value: string | undefined
): OrderListFilter {
  if (value === 'all' || value === 'open') {
    return value;
  }

  if (ORDER_STATUS_VALUES.includes(value as OrderStatus)) {
    return value as OrderStatus;
  }

  return DEFAULT_ORDER_LIST_FILTER;
}

export function getOrderStatusLabel(status: string): string {
  if (ORDER_STATUS_VALUES.includes(status as OrderStatus)) {
    return OrderStatuses[status as OrderStatus].label;
  }

  return status;
}

export function getOrderStatusBadgeClass(status: string): string | undefined {
  if (status === 'in progress') {
    return 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100';
  }

  if (status === 'finished') {
    return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
  }

  if (status === 'delivered') {
    return 'border-transparent bg-sky-100 text-sky-900 hover:bg-sky-100';
  }

  if (status === 'cancelled') {
    return 'border-transparent bg-rose-100 text-rose-800 hover:bg-rose-100';
  }

  return undefined;
}

export function isOrderOverdue(
  status: OrderStatus,
  estimatedDate?: string | Date | null
) {
  if (!estimatedDate) {
    return false;
  }

  if (status === 'delivered' || status === 'cancelled') {
    return false;
  }

  const estimated = new Date(estimatedDate);
  if (Number.isNaN(estimated.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return estimated < today;
}
