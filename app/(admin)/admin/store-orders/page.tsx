import { Suspense } from 'react';
import type { Metadata } from 'next';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import PageHeader from '@/components/ui/page-header';
import { fetchStoreOrderPages } from '@/lib/data/store-order-data';
import StoreOrdersTable from './_components/store-orders-table';

export const metadata: Metadata = {
  title: 'Pedidos de tienda',
};

export default async function StoreOrdersPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchStoreOrderPages(query);

  return (
    <div>
      <PageHeader title="Pedidos de tienda" />
      <p className="mt-2 text-sm text-muted-foreground">
        Compras online vía Mercado Pago (artículos y diseños).
      </p>
      <div className="mt-6 flex items-center justify-between gap-2">
        <Search placeholder="Buscar por email, nombre, estado…" />
      </div>
      <div className="mt-6">
        <Suspense key={query + currentPage} fallback={null}>
          <StoreOrdersTable query={query} currentPage={currentPage} />
        </Suspense>
      </div>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
