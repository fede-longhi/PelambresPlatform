import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/page-header';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import { InvoicesTableSkeleton } from '@/components/shared/skeletons';
import {
  fetchQuoteDocumentPages,
  parseQuoteDocumentListFilter,
} from '@/lib/data/quote-document-data';
import QuotesFilter from './_components/quotes-filter';
import QuotesTable from './_components/quotes-table';

export const metadata: Metadata = {
  title: 'Presupuestos',
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
  const filter = parseQuoteDocumentListFilter(searchParams?.filter);
  const totalPages = await fetchQuoteDocumentPages(query, filter);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Presupuestos" />
        <Button asChild>
          <Link href="/admin/quotes/create">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Nuevo presupuesto
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Presupuestos comerciales asociados a clientes. El número se asigna al
        guardar.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search placeholder="Buscar por número, cliente o email…" />
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
