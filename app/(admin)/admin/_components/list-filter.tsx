'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';

type FilterOption = {
  value: string;
  label: string;
};

export default function AdminListFilter({
  id,
  label,
  options,
  defaultValue,
}: {
  id: string;
  label: string;
  options: readonly FilterOption[];
  defaultValue: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') ?? defaultValue;
  const selectedValue = options.some((option) => option.value === currentFilter)
    ? currentFilter
    : defaultValue;

  function handleFilterChange(nextFilter: string) {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (nextFilter === defaultValue) {
      params.delete('filter');
    } else {
      params.set('filter', nextFilter);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full sm:w-auto">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <select
        id={id}
        value={selectedValue}
        onChange={(event) => handleFilterChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm sm:min-w-[200px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
