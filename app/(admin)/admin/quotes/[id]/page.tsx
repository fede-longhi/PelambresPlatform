import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import { fetchQuoteDocumentById } from '@/lib/data/quote-document-data';
import { formatCurrency, formatDateToLocal, getCustomerName } from '@/lib/utils';
import { lusitana } from '@/app/fonts';
import { Button } from '@/components/ui/button';
import {
  formatQuoteNumber,
} from '@/lib/consts/quote-document-consts';
import { fetchCustomerById } from '@/lib/data/customer-data';
import QuoteDocumentStatusForm from '../_components/quote-status-form';
import DeleteQuoteDocumentButton from '../_components/delete-button';
import type { QuoteDocumentStatus } from '@/types/quote-document-definitions';

export const metadata: Metadata = {
  title: 'Presupuesto',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const quote = await fetchQuoteDocumentById(id);

  if (!quote) {
    notFound();
  }

  const customer = await fetchCustomerById(quote.customerId);
  const quoteLabel = formatQuoteNumber(quote.quoteNumber);

  return (
    <div className="w-full max-w-5xl">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Presupuestos', href: '/admin/quotes' },
          {
            label: `Nº ${quoteLabel}`,
            href: `/admin/quotes/${id}`,
            active: true,
          },
        ]}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          Presupuesto {quoteLabel}
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={`/admin/quotes/${id}/edit`}>Editar / PDF</Link>
          </Button>
          <DeleteQuoteDocumentButton
            quoteId={id}
            quoteNumber={quoteLabel}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Datos del presupuesto</h2>
          <dl className="space-y-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Número</dt>
              <dd>{quoteLabel}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Fecha</dt>
              <dd>{formatDateToLocal(quote.quoteDate, 'es-AR')}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Empresa</dt>
              <dd>{quote.companyName}</dd>
            </div>
            <div className="border-t pt-4">
              <QuoteDocumentStatusForm
                quoteId={quote.id}
                status={quote.status as QuoteDocumentStatus}
              />
            </div>
            {quote.quoteRequestId ? (
              <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
                <dt className="font-medium text-muted-foreground">Solicitud</dt>
                <dd>
                  <Link
                    href={`/admin/quote-requests/${quote.quoteRequestId}`}
                    className="text-primary hover:underline"
                  >
                    Ver solicitud de origen
                  </Link>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Cliente</h2>
          <dl className="space-y-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Asociado</dt>
              <dd>
                {customer ? (
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-primary hover:underline"
                  >
                    {getCustomerName(customer)}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">En el PDF</dt>
              <dd>{quote.clientName}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Email</dt>
              <dd>{quote.clientEmail || '—'}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Teléfono</dt>
              <dd>{quote.clientPhone || '—'}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Dirección</dt>
              <dd>{quote.clientAddress || '—'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 space-y-4 rounded-lg border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Ítems</h2>
        {quote.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ítems.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Descripción</th>
                  <th className="py-2 pr-4 font-medium text-right">Cant.</th>
                  <th className="py-2 pr-4 font-medium text-right">Unitario</th>
                  <th className="py-2 font-medium text-right">Desc.</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{item.description || '—'}</td>
                    <td className="py-2 pr-4 text-right">{item.quantity}</td>
                    <td className="py-2 pr-4 text-right">
                      {formatCurrency(Math.round(item.price * 100))}
                    </td>
                    <td className="py-2 text-right">
                      {item.discount > 0 ? `${item.discount}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end border-t pt-4 text-sm">
          <dl className="w-full max-w-xs space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatCurrency(quote.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Impuestos</dt>
              <dd>{formatCurrency(quote.taxCents)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatCurrency(quote.totalCents)}</dd>
            </div>
          </dl>
        </div>
        {quote.notes ? (
          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-medium">Notas</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {quote.notes}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
