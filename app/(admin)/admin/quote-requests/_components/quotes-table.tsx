import { fetchFilteredQuotes } from '@/lib/data/quote-data';
import { formatDateToLocal } from '@/lib/utils';
import Link from 'next/link';

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

export default async function QuotesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const quotes = await fetchFilteredQuotes(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {quotes?.map((quote) => (
              <Link
                key={quote.id}
                href={`/admin/quote-requests/${quote.id}`}
                className="mb-2 block w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="mb-2 font-medium">{quoteDisplayName(quote)}</p>
                    <p className="text-sm text-gray-500">{quote.email}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <p className="text-sm">{formatDateToLocal(quote.date)}</p>
                  {quote.customer_id ? (
                    <span className="text-xs text-muted-foreground">Con cliente</span>
                  ) : (
                    <span className="text-xs text-amber-700">Sin cliente</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
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
                  Cliente
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {quotes?.map((quote) => (
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
                    {quote.customer_id ? (
                      <span className="text-muted-foreground">Asociado</span>
                    ) : (
                      <span className="text-amber-700">Sin asociar</span>
                    )}
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
