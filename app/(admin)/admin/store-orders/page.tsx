import { Suspense } from 'react';
import type { Metadata } from 'next';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import PageHeader from '@/components/ui/page-header';
import {
  fetchStoreOrderPages,
  parseStoreOrderListFilter,
} from '@/lib/data/store-order-data';
import StoreOrdersFilter from './_components/store-orders-filter';
import StoreOrdersTable from './_components/store-orders-table';

export const metadata: Metadata = {
  title: 'Pedidos de tienda',
};

export default async function StoreOrdersPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    filter?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const filter = parseStoreOrderListFilter(searchParams?.filter);
  const totalPages = await fetchStoreOrderPages(query, filter);

  return (
    <div>
      <PageHeader title="Pedidos de tienda" />
      <p className="mt-2 text-sm text-muted-foreground">
        Compras online. A revisar muestra los comprobantes de transferencia
        pendientes.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search placeholder="Buscar por email, nombre, estado…" />
        <StoreOrdersFilter />
      </div>
      <div className="mt-6">
        <Suspense key={query + currentPage + filter} fallback={null}>
          <StoreOrdersTable
            query={query}
            currentPage={currentPage}
            filter={filter}
          />
        </Suspense>
      </div>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
