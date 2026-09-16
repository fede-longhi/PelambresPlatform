'use client';

import AdminListFilter from '@/app/(admin)/admin/_components/list-filter';
import {
  DEFAULT_QUOTE_REQUEST_LIST_FILTER,
  QUOTE_REQUEST_LIST_FILTERS,
} from '@/lib/consts/quote-request-consts';

export default function QuotesFilter() {
  return (
    <AdminListFilter
      id="quotes-filter"
      label="Filtrar solicitudes"
      options={QUOTE_REQUEST_LIST_FILTERS}
      defaultValue={DEFAULT_QUOTE_REQUEST_LIST_FILTER}
    />
  );
}
