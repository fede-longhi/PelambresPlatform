'use client';

import AdminListFilter from '@/app/(admin)/admin/_components/list-filter';
import {
  DEFAULT_ORDER_LIST_FILTER,
  ORDER_LIST_FILTERS,
} from '@/lib/consts/order-list-consts';

export default function OrdersFilter() {
  return (
    <AdminListFilter
      id="orders-filter"
      label="Filtrar pedidos"
      options={ORDER_LIST_FILTERS}
      defaultValue={DEFAULT_ORDER_LIST_FILTER}
    />
  );
}
