import type { OrderStatus } from '@/types/order-definitions';
import { OrderStatuses } from '@/types/order-definitions';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'in progress',
  'finished',
  'delivered',
  'cancelled',
];

export type OrderListFilter = 'open' | OrderStatus | 'all';

export const ORDER_LIST_FILTERS: {
  value: OrderListFilter;
  label: string;
}[] = [
  { value: 'open', label: 'En curso' },
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

  if (ORDER_STATUSES.includes(value as OrderStatus)) {
    return value as OrderStatus;
  }

  return DEFAULT_ORDER_LIST_FILTER;
}
