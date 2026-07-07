import { fetchUsersPages, parseUserListFilter } from '@/lib/data/user-data';
import UsersTable from '@/app/(admin)/admin/users/_components/users-table';
import UsersFilter from '@/app/(admin)/admin/users/_components/users-filter';
import { lusitana } from '@/app/fonts';
import Pagination from '@/components/ui/pagination';
import Search from '@/app/(admin)/admin/_components/search';
import { UsersTableSkeleton } from '@/components/shared/skeletons';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Suspense } from 'react';

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
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Usuarios</h1>
      </div>
      <div className="mt-4">
        <div className="flex">
          <Link
            href="/admin/users/create"
            className="flex h-10 w-auto items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>Crear usuario</span>
            <PlusIcon className="h-5 md:ml-4" />
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-8">
          <Search placeholder="Buscar usuarios..." />
          <UsersFilter />
        </div>

        <div className="mt-4">
          <Suspense key={query + currentPage + filter} fallback={<UsersTableSkeleton />}>
            <UsersTable query={query} currentPage={currentPage} filter={filter} />
          </Suspense>
        </div>

        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
