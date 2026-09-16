import type { Metadata } from 'next';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import QuoteDocumentBuilder from '../_components/quote-document-builder';
import { fetchQuoteById } from '@/lib/data/quote-data';
import { fetchCustomerById } from '@/lib/data/customer-data';
import {
  getQuoteClientDisplayName,
} from '@/lib/consts/quote-document-consts';
import { getCustomerName } from '@/lib/utils';
import type { QuoteBuilderState } from '@/types/quote';

export const metadata: Metadata = {
  title: 'Nuevo presupuesto',
};

type PageProps = {
  searchParams?: Promise<{
    quoteRequestId?: string;
  }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawQuoteRequestId = params?.quoteRequestId;
  const quoteRequestId =
    rawQuoteRequestId && UUID_PATTERN.test(rawQuoteRequestId)
      ? rawQuoteRequestId
      : undefined;
  const quoteRequest = quoteRequestId
    ? await fetchQuoteById(quoteRequestId)
    : undefined;
  const linkedCustomer =
    quoteRequest?.customer ??
    (quoteRequest?.customer_id
      ? await fetchCustomerById(quoteRequest.customer_id)
      : undefined);

  const initialQuote: Partial<QuoteBuilderState> | undefined = quoteRequest
    ? {
        meta: {
          quoteNumber: '',
          showQuoteNumber: true,
          date: new Date().toISOString().split('T')[0],
          companyName: 'Pelambres 3D',
          clientName: linkedCustomer
            ? getQuoteClientDisplayName(linkedCustomer)
            : quoteRequest.name ||
              [quoteRequest.first_name, quoteRequest.last_name]
                .filter(Boolean)
                .join(' '),
          clientEmail: linkedCustomer?.email || quoteRequest.email || '',
          clientPhone: linkedCustomer?.phone || quoteRequest.phone || '',
          clientAddress: linkedCustomer?.address || '',
          notes:
            'Validez del presupuesto: 15 días. Pago por transferencia bancaria.',
        },
      }
    : undefined;

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col md:h-[calc(100vh-6rem)]">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Presupuestos', href: '/admin/quotes' },
          {
            label: 'Nuevo',
            href: '/admin/quotes/create',
            active: true,
          },
        ]}
      />
      <QuoteDocumentBuilder
        editorTitle="Nuevo presupuesto"
        quoteRequestId={quoteRequest?.id ?? null}
        initialQuote={initialQuote}
        initialCustomer={
          linkedCustomer
            ? {
                id: linkedCustomer.id,
                label: getCustomerName(linkedCustomer),
                type: linkedCustomer.type,
              }
            : undefined
        }
      />
    </div>
  );
}
