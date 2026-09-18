import Link from 'next/link';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import {
  formatQuoteNumber,
  getQuoteOrderListHint,
} from '@/lib/consts/quote-document-consts';
import type { QuoteDocumentListItem } from '@/types/quote-document-definitions';
import QuoteStatusBadge from '@/app/(admin)/admin/quotes/_components/quote-status-badge';

export default function RelatedQuoteDocuments({
  quotes,
}: {
  quotes: QuoteDocumentListItem[];
}) {
  if (quotes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay presupuestos asociados a esta solicitud.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {quotes.map((quote) => {
        const orderHint = getQuoteOrderListHint(quote);

        return (
        <li key={quote.id}>
          <Link
            href={`/admin/quotes/${quote.id}`}
            className="flex flex-col gap-1 rounded-md border bg-muted/30 px-3 py-2 hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium">
              Nº {formatQuoteNumber(quote.quoteNumber)}
            </span>
            <QuoteStatusBadge status={quote.status} />
            <span className="text-sm">{formatCurrency(quote.totalCents)}</span>
            <span className="text-sm text-muted-foreground">
              {formatDateToLocal(quote.quoteDate, 'es-AR')}
            </span>
            {orderHint ? (
              <span className="text-xs text-muted-foreground">
                {orderHint}
              </span>
            ) : null}
          </Link>
        </li>
        );
      })}
    </ul>
  );
}
