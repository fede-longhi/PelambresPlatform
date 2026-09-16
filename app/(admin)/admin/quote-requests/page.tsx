import { Suspense } from 'react';
import type { Metadata } from 'next';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import PageHeader from '@/components/ui/page-header';
import { InvoicesTableSkeleton } from '@/components/shared/skeletons';
import {
  fetchQuotesPages,
  parseQuoteRequestListFilter,
} from '@/lib/data/quote-data';
import QuotesFilter from './_components/quotes-filter';
import QuotesTable from './_components/quotes-table';

export const metadata: Metadata = {
  title: 'Solicitudes',
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
  const filter = parseQuoteRequestListFilter(searchParams?.filter);
  const totalPages = await fetchQuotesPages(query, filter);

  return (
    <div className="w-full">
      <PageHeader title="Solicitudes" />
      <p className="mt-2 text-sm text-muted-foreground">
        Pedidos de presupuesto. Las abiertas son las nuevas y las que están en
        curso.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search placeholder="Buscar por nombre, email o teléfono…" />
        <QuotesFilter />
      </div>

      <Suspense
        key={query + currentPage + filter}
        fallback={<InvoicesTableSkeleton />}
      >
        <QuotesTable query={query} currentPage={currentPage} filter={filter} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
