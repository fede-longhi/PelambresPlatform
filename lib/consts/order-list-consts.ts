import { statusBadgeClass } from '@/lib/consts/status-badge';
import type { OrderStatus } from '@/types/order-definitions';
import { ORDER_STATUS_VALUES, OrderStatuses } from '@/types/order-definitions';

export type OrderListFilter = 'open' | 'unpaid' | 'overdue' | OrderStatus | 'all';

export const ORDER_LIST_FILTERS: {
  value: OrderListFilter;
  label: string;
}[] = [
  { value: 'open', label: 'Activos' },
  { value: 'overdue', label: 'Vencidos' },
  { value: 'unpaid', label: 'Sin pagar' },
  { value: 'pending', label: OrderStatuses.pending.label },
  { value: 'in progress', label: OrderStatuses['in progress'].label },
  { value: 'finished', label: OrderStatuses.finished.label },
  { value: 'delivered', label: OrderStatuses.delivered.label },
  { value: 'cancelled', label: OrderStatuses.cancelled.label },
  { value: 'all', label: 'Todos' },
];

export const DEFAULT_ORDER_LIST_FILTER: OrderListFilter = 'all';

export function parseOrderListFilter(
  value: string | undefined
): OrderListFilter {
  if (value === 'all' || value === 'open' || value === 'unpaid' || value === 'overdue') {
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

export function getOrderStatusBadgeClass(status: string): string {
  if (status === 'in progress') {
    return statusBadgeClass('progress');
  }

  if (status === 'finished') {
    return statusBadgeClass('success');
  }

  if (status === 'delivered') {
    return statusBadgeClass('info');
  }

  if (status === 'cancelled') {
    return statusBadgeClass('danger');
  }

  return statusBadgeClass('neutral');
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
