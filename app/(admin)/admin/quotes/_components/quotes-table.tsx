import Link from 'next/link';
import { fetchFilteredQuoteDocuments } from '@/lib/data/quote-document-data';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import {
  formatQuoteNumber,
  getQuoteOrderListHint,
} from '@/lib/consts/quote-document-consts';
import type { QuoteDocumentListFilter } from '@/lib/consts/quote-document-consts';
import type { QuoteDocumentListItem } from '@/types/quote-document-definitions';
import QuoteStatusAction from './quote-row-actions';

function QuoteOrderCell({ quote }: { quote: QuoteDocumentListItem }) {
  if (quote.orderId) {
    return (
      <Link
        href={`/admin/orders/${quote.orderId}`}
        className="font-medium text-primary hover:underline"
      >
        {quote.orderTrackingCode ?? 'Ver pedido'}
      </Link>
    );
  }

  if (quote.status === 'accepted') {
    return (
      <Link
        href={`/admin/quotes/${quote.id}`}
        className="text-primary hover:underline"
      >
        Crear pedido
      </Link>
    );
  }

  return <span className="text-muted-foreground">—</span>;
}

export default async function QuotesTable({
  query,
  currentPage,
  filter,
}: {
  query: string;
  currentPage: number;
  filter: QuoteDocumentListFilter;
}) {
  const quotes = await fetchFilteredQuoteDocuments(query, currentPage, filter);

  if (quotes.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {filter === 'accepted_without_order'
          ? 'No hay presupuestos aceptados sin pedido.'
          : filter === 'all'
            ? 'No hay presupuestos todavía.'
            : 'No se encontraron presupuestos con esos filtros.'}
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg md:overflow-hidden md:border md:border-border md:bg-card md:shadow-sm">
          <div className="md:hidden">
            {quotes.map((quote) => {
              const orderHint = getQuoteOrderListHint(quote);

              return (
                <div
                  key={quote.id}
                  className="mb-2 w-full rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 border-b pb-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="mb-2 block font-medium hover:underline"
                      >
                        Nº {formatQuoteNumber(quote.quoteNumber, quote.revision)}
                      </Link>
                      <p className="text-sm text-gray-500">{quote.clientName}</p>
                    </div>
                    <QuoteStatusAction
                      quoteId={quote.id}
                      status={quote.status}
                    />
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p className="text-sm">
                        {formatDateToLocal(quote.quoteDate, 'es-AR')}
                      </p>
                      {orderHint ? (
                        <p className="text-xs text-muted-foreground">{orderHint}</p>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(quote.totalCents)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="bg-muted/60 text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Número
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Cliente
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Pedido
                </th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {formatQuoteNumber(quote.quoteNumber, quote.revision)}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p>{quote.clientName}</p>
                    {quote.clientEmail ? (
                      <p className="text-xs text-muted-foreground">
                        {quote.clientEmail}
                      </p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(quote.quoteDate, 'es-AR')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(quote.totalCents)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <QuoteStatusAction
                      quoteId={quote.id}
                      status={quote.status}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <QuoteOrderCell quote={quote} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
