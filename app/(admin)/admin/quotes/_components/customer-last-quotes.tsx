import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchCustomerQuoteDocuments } from '@/lib/data/quote-document-data';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import {
  formatQuoteNumber,
  getQuoteOrderListHint,
} from '@/lib/consts/quote-document-consts';
import QuoteStatusBadge from './quote-status-badge';

export default async function CustomerLastQuotes({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const quotes = await fetchCustomerQuoteDocuments(id);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Presupuestos</CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este cliente todavía no tiene presupuestos.
          </p>
        ) : (
          <ul className="space-y-2">
            {quotes.map((quote) => {
              const orderHint = getQuoteOrderListHint(quote);

              return (
              <li key={quote.id}>
                <Link
                  href={`/admin/quotes/${quote.id}`}
                  className="flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2 hover:bg-gray-200 sm:flex-row sm:items-center sm:justify-between sm:space-x-4"
                >
                  <span className="font-medium">
                    Nº {formatQuoteNumber(quote.quoteNumber)}
                  </span>
                  <QuoteStatusBadge status={quote.status} />
                  <span className="text-sm">
                    {formatCurrency(quote.totalCents)}
                  </span>
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
        )}
      </CardContent>
    </Card>
  );
}
