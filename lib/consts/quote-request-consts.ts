export const QUOTE_REQUEST_STATUSES = [
  'new',
  'in_progress',
  'quoted',
  'closed',
] as const;

export type QuoteRequestStatus = (typeof QUOTE_REQUEST_STATUSES)[number];

export const QUOTE_REQUEST_STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  new: 'Nueva',
  in_progress: 'En curso',
  quoted: 'Cotizada',
  closed: 'Cerrada',
};

export type QuoteRequestListFilter = 'open' | QuoteRequestStatus | 'all';

export const QUOTE_REQUEST_LIST_FILTERS: {
  value: QuoteRequestListFilter;
  label: string;
}[] = [
  { value: 'open', label: 'Abiertas' },
  { value: 'new', label: 'Nuevas' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'quoted', label: 'Cotizadas' },
  { value: 'closed', label: 'Cerradas' },
  { value: 'all', label: 'Todas' },
];

export const DEFAULT_QUOTE_REQUEST_LIST_FILTER: QuoteRequestListFilter = 'open';

export function parseQuoteRequestListFilter(
  value: string | undefined
): QuoteRequestListFilter {
  if (value === 'all' || value === 'open') {
    return value;
  }

  if (QUOTE_REQUEST_STATUSES.includes(value as QuoteRequestStatus)) {
    return value as QuoteRequestStatus;
  }

  return DEFAULT_QUOTE_REQUEST_LIST_FILTER;
}

export function getQuoteRequestStatusLabel(status: string): string {
  return (
    QUOTE_REQUEST_STATUS_LABELS[status as QuoteRequestStatus] ?? status
  );
}

export function getQuoteRequestStatusBadgeClass(status: string): string | undefined {
  if (status === 'new') {
    return 'border-transparent bg-slate-200 text-slate-800 hover:bg-slate-200';
  }

  if (status === 'in_progress') {
    return 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100';
  }

  if (status === 'quoted') {
    return 'border-transparent bg-sky-100 text-sky-900 hover:bg-sky-100';
  }

  if (status === 'closed') {
    return 'border-transparent bg-zinc-200 text-zinc-700 hover:bg-zinc-200';
  }

  return undefined;
}
