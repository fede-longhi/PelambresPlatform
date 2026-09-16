'use client';

import AdminListFilter from '@/app/(admin)/admin/_components/list-filter';
import {
  DEFAULT_USER_LIST_FILTER,
  USER_LIST_FILTERS,
} from '@/lib/consts/user-list-consts';

export default function UsersFilter() {
  return (
    <AdminListFilter
      id="users-filter"
      label="Filtrar usuarios"
      options={USER_LIST_FILTERS}
      defaultValue={DEFAULT_USER_LIST_FILTER}
    />
  );
}
