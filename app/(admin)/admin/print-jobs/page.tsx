import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/page-header';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import { InvoicesTableSkeleton } from '@/components/shared/skeletons';
import {
  fetchPrintJobsPages,
  parsePrintJobListFilter,
} from '@/lib/data/print-job-data';
import PrintJobsFilter from './_components/print-jobs-filter';
import PrintJobsTable from './_components/print-jobs-table';

export const metadata: Metadata = {
  title: 'Trabajos',
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
  const filter = parsePrintJobListFilter(searchParams?.filter);
  const totalPages = await fetchPrintJobsPages(query, filter);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Trabajos" />
        <Button asChild>
          <Link href="/admin/print-jobs/create">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Nuevo trabajo
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Cola de impresión. También se pueden crear desde el detalle de cada
        pedido.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search placeholder="Buscar por trabajo, pedido o cliente…" />
        <PrintJobsFilter />
      </div>

      <Suspense
        key={query + currentPage + filter}
        fallback={<InvoicesTableSkeleton />}
      >
        <PrintJobsTable
          query={query}
          currentPage={currentPage}
          filter={filter}
        />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
