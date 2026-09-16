import { fetchCustomersPages } from '@/lib/data/customer-data';
import CustomersTable from '@/app/(admin)/admin/customers/_components/customers-table';
import Pagination from '@/components/ui/pagination';
import Search from '@/app/(admin)/admin/_components/search';
import { CustomersTableSkeleton } from '@/components/shared/skeletons';
import PageHeader from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clientes',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCustomersPages(query);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Clientes" />
        <Button asChild>
          <Link href="/admin/customers/create">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Nuevo cliente
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Personas y empresas asociadas a pedidos a medida.
      </p>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Search placeholder="Buscar clientes…" />
      </div>
      <div className="mt-6">
        <Suspense key={query + currentPage} fallback={<CustomersTableSkeleton />}>
          <CustomersTable query={query} currentPage={currentPage} />
        </Suspense>
      </div>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
