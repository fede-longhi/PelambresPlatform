import { Suspense } from 'react';
import type { Metadata } from 'next';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import PageHeader from '@/components/ui/page-header';
import { fetchFilamentsPages } from '@/lib/data/filaments-data';
import { CreateFilamentButton } from './_components/buttons';
import FilamentsTable from './_components/filaments-table';

export const metadata: Metadata = {
  title: 'Filamentos',
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
  const totalPages = await fetchFilamentsPages(query);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Filamentos" />
        <CreateFilamentButton />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Materiales del taller y precio por kilogramo para cotizar.
      </p>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Search placeholder="Buscar por marca o tipo…" />
      </div>

      <div className="mt-6">
        <Suspense key={query + currentPage} fallback={null}>
          <FilamentsTable query={query} currentPage={currentPage} />
        </Suspense>
      </div>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
