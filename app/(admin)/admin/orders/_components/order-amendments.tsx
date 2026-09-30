import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import type { OrderAmendment } from '@/types/definitions';

export default function OrderAmendments({
  amendments,
}: {
  amendments: OrderAmendment[];
}) {
  if (amendments.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">Ajustes del pedido</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Fecha</th>
              <th className="py-2 pr-4 font-medium">Motivo</th>
              <th className="py-2 pr-4 font-medium text-right">Antes</th>
              <th className="py-2 font-medium text-right">Después</th>
            </tr>
          </thead>
          <tbody>
            {amendments.map((amendment) => (
              <tr key={amendment.id} className="border-b last:border-0">
                <td className="py-2 pr-4 whitespace-nowrap">
                  {formatDateToLocal(amendment.createdAt, 'es-AR')}
                </td>
                <td className="py-2 pr-4">
                  {amendment.reason}
                  {amendment.quoteNumber != null ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Presupuesto Nº{' '}
                      {formatQuoteNumber(
                        amendment.quoteNumber,
                        amendment.quoteRevision ?? 1
                      )}
                    </span>
                  ) : null}
                </td>
                <td className="py-2 pr-4 text-right">
                  {formatCurrency(amendment.previousAmountCents)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(amendment.nextAmountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
