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
