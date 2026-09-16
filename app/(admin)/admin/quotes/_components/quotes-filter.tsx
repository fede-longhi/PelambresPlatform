'use client';

import AdminListFilter from '@/app/(admin)/admin/_components/list-filter';
import {
  DEFAULT_QUOTE_DOCUMENT_LIST_FILTER,
  QUOTE_DOCUMENT_LIST_FILTERS,
} from '@/lib/consts/quote-document-consts';

export default function QuotesFilter() {
  return (
    <AdminListFilter
      id="quote-documents-filter"
      label="Filtrar presupuestos"
      options={QUOTE_DOCUMENT_LIST_FILTERS}
      defaultValue={DEFAULT_QUOTE_DOCUMENT_LIST_FILTER}
    />
  );
}
