import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import { fetchQuoteById } from '@/lib/data/quote-data';
import { formatDateToLocal, getCustomerName } from '@/lib/utils';
import { lusitana } from '@/app/fonts';
import QuoteCustomerLinkForm from '../_components/quote-customer-link-form';
import { Paperclip } from 'lucide-react';

type PageProps = {
  params: Promise<{ id: string }>;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value || '—'}</dd>
    </div>
  );
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const quote = await fetchQuoteById(id);

  if (!quote) {
    notFound();
  }

  const displayName =
    quote.first_name || quote.last_name
      ? [quote.last_name, quote.first_name].filter(Boolean).join(', ')
      : quote.name;

  const attachmentFileName = (fileUrl: string) => {
    try {
      const pathname = new URL(fileUrl).pathname;
      return decodeURIComponent(pathname.split('/').pop() || fileUrl);
    } catch {
      return fileUrl;
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Solicitudes', href: '/admin/quote-requests' },
          {
            label: displayName || 'Solicitud',
            href: `/admin/quote-requests/${id}`,
            active: true,
          },
        ]}
      />

      <h1 className={`${lusitana.className} mb-6 text-2xl`}>Solicitud de presupuesto</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Datos de la solicitud</h2>
          <dl className="space-y-3">
            <DetailRow label="Nombre" value={displayName} />
            <DetailRow label="Email" value={quote.email} />
            <DetailRow label="Teléfono" value={quote.phone} />
            <DetailRow label="Fecha" value={formatDateToLocal(quote.date, 'es-AR')} />
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Detalle</dt>
              <dd className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                {quote.detail}
              </dd>
            </div>
          </dl>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-medium">Archivos adjuntos</h3>
            {quote.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin archivos adjuntos.</p>
            ) : (
              <ul className="space-y-2">
                {quote.attachments.map((attachment) => (
                  <li key={attachment.fileUrl}>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Paperclip className="size-4 shrink-0" aria-hidden="true" />
                      {attachmentFileName(attachment.fileUrl)}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Cliente</h2>

          {quote.customer ? (
            <div className="space-y-3">
              <dl className="space-y-3">
                <DetailRow
                  label="Nombre"
                  value={
                    <Link
                      href={`/admin/customers/${quote.customer.id}/edit`}
                      className="text-primary hover:underline"
                    >
                      {getCustomerName(quote.customer)}
                    </Link>
                  }
                />
                <DetailRow label="Email" value={quote.customer.email} />
                <DetailRow label="Teléfono" value={quote.customer.phone} />
                <DetailRow
                  label="Tipo"
                  value={quote.customer.type === 'business' ? 'Empresa' : 'Persona'}
                />
              </dl>
              <div className="border-t pt-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  Cambiar el cliente asociado a esta solicitud:
                </p>
                <QuoteCustomerLinkForm
                  quoteRequestId={quote.id}
                  quoteName={quote.name || displayName}
                  quoteEmail={quote.email}
                  quotePhone={quote.phone}
                  defaultCustomer={{
                    value: quote.customer.id,
                    label: getCustomerName(quote.customer),
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Esta solicitud no tiene un cliente asociado. Creá uno o vinculala a un cliente
                existente.
              </p>
              <QuoteCustomerLinkForm
                quoteRequestId={quote.id}
                quoteName={quote.name || displayName}
                quoteEmail={quote.email}
                quotePhone={quote.phone}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
