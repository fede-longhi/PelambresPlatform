import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchCustomerQuoteDocuments } from '@/lib/data/quote-document-data';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import {
  formatQuoteNumber,
  getQuoteOrderListHint,
} from '@/lib/consts/quote-document-consts';
import QuoteStatusBadge from './quote-status-badge';
import { Plus } from 'lucide-react';

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2">
        <CardTitle>Presupuestos</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/quotes/create?customerId=${id}`}>
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            Nuevo
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Este cliente todavía no tiene presupuestos.
            </p>
            <Button asChild className="mt-3" size="sm">
              <Link href={`/admin/quotes/create?customerId=${id}`}>
                <Plus className="mr-1.5 size-4" aria-hidden="true" />
                Crear primer presupuesto
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {quotes.map((quote) => {
              const orderHint = getQuoteOrderListHint(quote);

              return (
                <li key={quote.id}>
                  <Link
                    href={`/admin/quotes/${quote.id}`}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-card px-3 py-2 shadow-sm hover:bg-muted sm:flex-row sm:items-center sm:justify-between sm:space-x-4"
                  >
                    <span className="font-medium">
                      Nº {formatQuoteNumber(quote.quoteNumber, quote.revision)}
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
