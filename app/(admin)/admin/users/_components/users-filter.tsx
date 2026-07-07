'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_USER_LIST_FILTER,
  USER_LIST_FILTERS,
  type UserListFilter,
} from '@/lib/consts/user-list-consts';

export default function UsersFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter =
    (searchParams.get('filter') as UserListFilter | null) ?? DEFAULT_USER_LIST_FILTER;

  function handleFilterChange(nextFilter: string) {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (nextFilter === DEFAULT_USER_LIST_FILTER) {
      params.delete('filter');
    } else {
      params.set('filter', nextFilter);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full sm:w-auto">
      <Label htmlFor="users-filter" className="sr-only">
        Filtrar usuarios
      </Label>
      <select
        id="users-filter"
        value={currentFilter}
        onChange={(event) => handleFilterChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm sm:min-w-[240px]"
      >
        {USER_LIST_FILTERS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
