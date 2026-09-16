import type { PrintJobStatus } from '@/types/definitions';

export const PRINT_JOB_STATUS_LABELS: Record<PrintJobStatus, string> = {
  pending: 'Pendiente',
  printing: 'Imprimiendo',
  postprocess: 'Post-procesado',
  finished: 'Finalizado',
  failed: 'Fallido',
};

export type PrintJobListFilter = 'active' | PrintJobStatus | 'all';

export const PRINT_JOB_LIST_FILTERS: {
  value: PrintJobListFilter;
  label: string;
}[] = [
  { value: 'active', label: 'Activos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'printing', label: 'Imprimiendo' },
  { value: 'postprocess', label: 'Post-procesado' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'failed', label: 'Fallido' },
  { value: 'all', label: 'Todos' },
];

export const DEFAULT_PRINT_JOB_LIST_FILTER: PrintJobListFilter = 'active';

const PRINT_JOB_STATUSES: PrintJobStatus[] = [
  'pending',
  'printing',
  'postprocess',
  'finished',
  'failed',
];

export function parsePrintJobListFilter(
  value: string | undefined
): PrintJobListFilter {
  if (value === 'all' || value === 'active') {
    return value;
  }

  if (PRINT_JOB_STATUSES.includes(value as PrintJobStatus)) {
    return value as PrintJobStatus;
  }

  return DEFAULT_PRINT_JOB_LIST_FILTER;
}
