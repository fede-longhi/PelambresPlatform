export type UserListFilter = 'platform' | 'provisional' | 'inactive' | 'all';

export const USER_LIST_FILTERS: { value: UserListFilter; label: string }[] = [
  { value: 'platform', label: 'Con acceso a la plataforma' },
  { value: 'provisional', label: 'Solo inscripción' },
  { value: 'inactive', label: 'Inactivos' },
  { value: 'all', label: 'Todos' },
];

export const DEFAULT_USER_LIST_FILTER: UserListFilter = 'platform';

export function parseUserListFilter(value: string | undefined): UserListFilter {
  if (value === 'provisional' || value === 'inactive' || value === 'all') {
    return value;
  }

  return DEFAULT_USER_LIST_FILTER;
}
