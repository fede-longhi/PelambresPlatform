import { STORE_ORDER_STATUSES } from '@/lib/consts/store-consts';
import type { StoreOrderStatus } from '@/types/store-definitions';

export type StoreOrderListFilter = 'attention' | StoreOrderStatus | 'all';

export const STORE_ORDER_LIST_FILTERS: {
  value: StoreOrderListFilter;
  label: string;
}[] = [
  { value: 'attention', label: 'A revisar' },
  ...STORE_ORDER_STATUSES.map((status) => ({
    value: status.value,
    label: status.label,
  })),
  { value: 'all', label: 'Todos' },
];

export const DEFAULT_STORE_ORDER_LIST_FILTER: StoreOrderListFilter = 'attention';

export function parseStoreOrderListFilter(
  value: string | undefined
): StoreOrderListFilter {
  if (value === 'all' || value === 'attention') {
    return value;
  }

  if (STORE_ORDER_STATUSES.some((status) => status.value === value)) {
    return value as StoreOrderStatus;
  }

  return DEFAULT_STORE_ORDER_LIST_FILTER;
}
