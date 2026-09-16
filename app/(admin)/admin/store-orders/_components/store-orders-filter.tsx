'use client';

import AdminListFilter from '@/app/(admin)/admin/_components/list-filter';
import {
  DEFAULT_STORE_ORDER_LIST_FILTER,
  STORE_ORDER_LIST_FILTERS,
} from '@/lib/consts/store-order-list-consts';

export default function StoreOrdersFilter() {
  return (
    <AdminListFilter
      id="store-orders-filter"
      label="Filtrar pedidos de tienda"
      options={STORE_ORDER_LIST_FILTERS}
      defaultValue={DEFAULT_STORE_ORDER_LIST_FILTER}
    />
  );
}
