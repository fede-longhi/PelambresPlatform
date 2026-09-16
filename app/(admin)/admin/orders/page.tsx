import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/page-header';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import { InvoicesTableSkeleton } from '@/components/shared/skeletons';
import { fetchOrdersPages, parseOrderListFilter } from '@/lib/data/order-data';
import OrdersFilter from '@/app/(admin)/admin/orders/_components/orders-filter';
import OrdersTable from '@/app/(admin)/admin/orders/_components/orders-table';

export const metadata: Metadata = {
  title: 'Pedidos',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    filter?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const filter = parseOrderListFilter(searchParams?.filter);
  const totalPages = await fetchOrdersPages(query, filter);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Pedidos" />
        <Button asChild>
          <Link href="/admin/orders/create">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Nuevo pedido
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Pedidos a medida. El filtro En curso muestra pendientes y en producción.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search placeholder="Buscar por código, cliente o estado…" />
        <OrdersFilter />
      </div>

      <Suspense
        key={query + currentPage + filter}
        fallback={<InvoicesTableSkeleton />}
      >
        <OrdersTable query={query} currentPage={currentPage} filter={filter} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
