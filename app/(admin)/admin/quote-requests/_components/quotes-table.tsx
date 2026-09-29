import { fetchFilteredQuotes } from '@/lib/data/quote-data';
import { formatDateToLocal } from '@/lib/utils';
import Link from 'next/link';
import type { QuoteTable } from '@/types/definitions';
import type { QuoteRequestListFilter } from '@/lib/consts/quote-request-consts';
import QuoteRequestCustomerAction from './quote-request-customer-action';
import QuoteRequestRowActions from './quote-request-row-actions';
import QuoteRequestStatusAction from './quote-request-status-action';

function quoteDisplayName(quote: {
  first_name: string | null;
  last_name: string | null;
  name: string;
}) {
  if (quote.first_name || quote.last_name) {
    return [quote.last_name, quote.first_name].filter(Boolean).join(', ');
  }
  return quote.name || 'Sin nombre';
}

function quoteCustomer(quote: QuoteTable) {
  if (!quote.customer_id) {
    return null;
  }

  const label = quote.customer_name?.replace(/^,\s*|,\s*$/g, '').trim();

  return {
    id: quote.customer_id,
    label: label || 'Cliente',
  };
}

export default async function QuotesTable({
  query,
  currentPage,
  filter,
}: {
  query: string;
  currentPage: number;
  filter: QuoteRequestListFilter;
}) {
  const quotes = await fetchFilteredQuotes(query, currentPage, filter);

  if (quotes.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {filter === 'open'
          ? 'No hay solicitudes abiertas.'
          : 'No se encontraron solicitudes con esos filtros.'}
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg md:overflow-hidden md:border md:border-border md:bg-card md:shadow-sm">
          <div className="md:hidden">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="mb-2 w-full rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 border-b pb-4">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/quote-requests/${quote.id}`}
                      className="mb-2 block font-medium hover:underline"
                    >
                      {quoteDisplayName(quote)}
                    </Link>
                    <p className="text-sm text-gray-500">{quote.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <QuoteRequestStatusAction
                      quoteRequestId={quote.id}
                      status={quote.status}
                    />
                    <QuoteRequestRowActions
                      quoteRequestId={quote.id}
                      quoteName={quote.name || quoteDisplayName(quote)}
                    />
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <p className="text-sm">{formatDateToLocal(quote.date)}</p>
                  <QuoteRequestCustomerAction
                    quoteRequestId={quote.id}
                    quoteName={quote.name || quoteDisplayName(quote)}
                    quoteEmail={quote.email}
                    quotePhone={quote.phone || ''}
                    customer={quoteCustomer(quote)}
                    compactLabel
                  />
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="bg-muted/60 text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Teléfono
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Cliente
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:first-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:first-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <Link
                      href={`/admin/quote-requests/${quote.id}`}
                      className="hover:underline"
                    >
                      {quoteDisplayName(quote)}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{quote.email}</td>
                  <td className="whitespace-nowrap px-3 py-3">{quote.phone || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(quote.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <QuoteRequestStatusAction
                      quoteRequestId={quote.id}
                      status={quote.status}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <QuoteRequestCustomerAction
                      quoteRequestId={quote.id}
                      quoteName={quote.name || quoteDisplayName(quote)}
                      quoteEmail={quote.email}
                      quotePhone={quote.phone || ''}
                      customer={quoteCustomer(quote)}
                    />
                  </td>
                  <td className="w-px whitespace-nowrap px-2 py-3 pr-4">
                    <QuoteRequestRowActions
                      quoteRequestId={quote.id}
                      quoteName={quote.name || quoteDisplayName(quote)}
                    />
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
