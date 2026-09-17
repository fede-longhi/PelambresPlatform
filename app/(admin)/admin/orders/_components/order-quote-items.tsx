import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { getItemTotal } from '@/lib/quote-math';
import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import type { QuoteItem } from '@/types/quote';

export default function OrderQuoteItems({
  quoteId,
  quoteNumber,
  items,
}: {
  quoteId: string;
  quoteNumber?: number | null;
  items: QuoteItem[];
}) {
  return (
    <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Ítems del presupuesto</h2>
        <Link
          href={`/admin/quotes/${quoteId}`}
          className="text-sm text-primary hover:underline"
        >
          Ver presupuesto
          {quoteNumber != null ? ` Nº ${formatQuoteNumber(quoteNumber)}` : ''}
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          El presupuesto no tiene ítems.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Descripción
                </th>
                <th scope="col" className="py-2 pr-4 font-medium text-right">
                  Cant.
                </th>
                <th scope="col" className="py-2 font-medium text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{item.description || '—'}</td>
                  <td className="py-2 pr-4 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(Math.round(getItemTotal(item) * 100))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
