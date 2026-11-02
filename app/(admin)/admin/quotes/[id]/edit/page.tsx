import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import { fetchQuoteDocumentById } from '@/lib/data/quote-document-data';
import { fetchCustomerById } from '@/lib/data/customer-data';
import {
  formatQuoteNumber,
  toQuoteBuilderState,
} from '@/lib/consts/quote-document-consts';
import { getCustomerName } from '@/lib/utils';
import QuoteDocumentBuilder from '../../_components/quote-document-builder';

export const metadata: Metadata = {
  title: 'Editar presupuesto',
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
  const quoteLabel = formatQuoteNumber(quote.quoteNumber, quote.revision);

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-12">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Presupuestos', href: '/admin/quotes' },
          { label: `Nº ${quoteLabel}`, href: `/admin/quotes/${id}` },
          {
            label: 'Editar',
            href: `/admin/quotes/${id}/edit`,
            active: true,
          },
        ]}
      />
      {quote.status !== 'draft' ? (
        <p className="mb-3 shrink-0 text-sm text-muted-foreground">
          Esta versión ya no se edita. Para cambiar el alcance, creá una nueva
          versión desde la ficha. Podés seguir viendo el PDF desde acá.
        </p>
      ) : null}
      <QuoteDocumentBuilder
        quoteId={quote.id}
        quoteRequestId={quote.quoteRequestId}
        editorTitle={`Presupuesto ${quoteLabel}`}
        initialQuote={toQuoteBuilderState(quote)}
        initialCustomer={
          customer
            ? {
                id: customer.id,
                label: getCustomerName(customer),
                type: customer.type,
              }
            : undefined
        }
      />
    </div>
  );
}
