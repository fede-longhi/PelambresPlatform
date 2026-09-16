import { fetchUsersPages, parseUserListFilter } from '@/lib/data/user-data';
import UsersTable from '@/app/(admin)/admin/users/_components/users-table';
import UsersFilter from '@/app/(admin)/admin/users/_components/users-filter';
import Pagination from '@/components/ui/pagination';
import Search from '@/app/(admin)/admin/_components/search';
import { UsersTableSkeleton } from '@/components/shared/skeletons';
import PageHeader from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usuarios',
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
  const filter = parseUserListFilter(searchParams?.filter);
  const totalPages = await fetchUsersPages(query, filter);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Usuarios" />
        <Button asChild>
          <Link href="/admin/users/create">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Nuevo usuario
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Acceso a la plataforma, inscripciones y cuentas inactivas.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search placeholder="Buscar usuarios…" />
        <UsersFilter />
      </div>

      <div className="mt-6">
        <Suspense key={query + currentPage + filter} fallback={<UsersTableSkeleton />}>
          <UsersTable query={query} currentPage={currentPage} filter={filter} />
        </Suspense>
      </div>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
