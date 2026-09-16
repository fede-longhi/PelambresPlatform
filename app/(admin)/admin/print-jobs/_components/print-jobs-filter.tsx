'use client';

import AdminListFilter from '@/app/(admin)/admin/_components/list-filter';
import {
  DEFAULT_PRINT_JOB_LIST_FILTER,
  PRINT_JOB_LIST_FILTERS,
} from '@/lib/consts/print-job-consts';

export default function PrintJobsFilter() {
  return (
    <AdminListFilter
      id="print-jobs-filter"
      label="Filtrar trabajos"
      options={PRINT_JOB_LIST_FILTERS}
      defaultValue={DEFAULT_PRINT_JOB_LIST_FILTER}
    />
  );
}
