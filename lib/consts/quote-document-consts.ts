import type { Customer } from '@/types/definitions';
import type { QuoteBuilderState, QuoteItem, TaxItem } from '@/types/quote';
import {
  QUOTE_DOCUMENT_STATUSES,
  type QuoteDocumentStatus,
} from '@/types/quote-document-definitions';

export { QUOTE_DOCUMENT_STATUSES };
export type { QuoteDocumentStatus };

export const QUOTE_DOCUMENT_STATUS_LABELS: Record<QuoteDocumentStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviado',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
};

export type QuoteDocumentListFilter =
  | QuoteDocumentStatus
  | 'all'
  | 'accepted_without_order';

export const QUOTE_DOCUMENT_LIST_FILTERS: {
  value: QuoteDocumentListFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borradores' },
  { value: 'sent', label: 'Enviados' },
  { value: 'accepted', label: 'Aceptados' },
  { value: 'accepted_without_order', label: 'Aceptados sin pedido' },
  { value: 'rejected', label: 'Rechazados' },
];

export const DEFAULT_QUOTE_DOCUMENT_LIST_FILTER: QuoteDocumentListFilter = 'all';

export function parseQuoteDocumentListFilter(
  value: string | undefined
): QuoteDocumentListFilter {
  if (value === 'all' || value === 'accepted_without_order') {
    return value;
  }

  if (QUOTE_DOCUMENT_STATUSES.includes(value as QuoteDocumentStatus)) {
    return value as QuoteDocumentStatus;
  }

  return DEFAULT_QUOTE_DOCUMENT_LIST_FILTER;
}

export function getQuoteOrderListHint(quote: {
  status: QuoteDocumentStatus;
  orderId?: string | null;
  orderTrackingCode?: string | null;
}): string | null {
  if (quote.orderId) {
    const trackingCode = quote.orderTrackingCode?.trim();
    return trackingCode ? `Pedido ${trackingCode}` : 'Pedido';
  }

  if (quote.status === 'accepted') {
    return 'Crear pedido';
  }

  return null;
}

export function getQuoteDocumentStatusLabel(status: string): string {
  return (
    QUOTE_DOCUMENT_STATUS_LABELS[status as QuoteDocumentStatus] ?? status
  );
}

export function getQuoteDocumentStatusBadgeClass(status: string): string | undefined {
  if (status === 'accepted') {
    return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
  }

  if (status === 'rejected') {
    return 'border-transparent bg-rose-100 text-rose-800 hover:bg-rose-100';
  }

  if (status === 'sent') {
    return 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100';
  }

  return undefined;
}

export function formatQuoteNumber(quoteNumber: number | string): string {
  return String(quoteNumber).padStart(7, '0');
}

export function getQuoteClientDisplayName(customer: Customer): string {
  if (customer.type === 'business') {
    return customer.name;
  }

  return [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function toQuoteBuilderState(quote: {
  quoteNumber: number;
  showQuoteNumber: boolean;
  quoteDate: string;
  companyName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  notes: string;
  items: QuoteItem[];
  taxes: TaxItem[];
  globalDiscountPercent: number;
}): QuoteBuilderState {
  return {
    meta: {
      quoteNumber: formatQuoteNumber(quote.quoteNumber),
      showQuoteNumber: quote.showQuoteNumber,
      date: quote.quoteDate,
      companyName: quote.companyName,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientPhone: quote.clientPhone,
      clientAddress: quote.clientAddress,
      notes: quote.notes,
    },
    items: quote.items,
    taxes: quote.taxes,
    globalDiscount: quote.globalDiscountPercent,
  };
}
