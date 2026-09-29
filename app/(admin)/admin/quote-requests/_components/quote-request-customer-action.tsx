'use client';

import { useState } from 'react';
import ColumnActionButton from '@/components/shared/column-action-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuoteCustomerLinkForm from './quote-customer-link-form';

export default function QuoteRequestCustomerAction({
  quoteRequestId,
  quoteName,
  quoteEmail,
  quotePhone,
  customer,
  compactLabel = false,
}: {
  quoteRequestId: string;
  quoteName: string;
  quoteEmail: string;
  quotePhone: string;
  customer: { id: string; label: string } | null;
  compactLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const linked = Boolean(customer);
  const label = compactLabel
    ? linked
      ? 'Con cliente'
      : 'Sin cliente'
    : linked
      ? 'Asociado'
      : 'Sin asociar';

  return (
    <>
      <ColumnActionButton
        label={linked ? 'Cambiar cliente' : 'Asignar cliente'}
        onClick={() => setOpen(true)}
        className={
          linked
            ? 'text-xs text-muted-foreground hover:underline md:text-sm'
            : 'text-xs text-amber-700 hover:underline md:text-sm'
        }
      >
        {label}
      </ColumnActionButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Asignar cliente</DialogTitle>
            <DialogDescription>
              Elegí un cliente existente o creá uno nuevo con los datos de la
              solicitud.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <QuoteCustomerLinkForm
              key={customer?.id ?? 'none'}
              quoteRequestId={quoteRequestId}
              quoteName={quoteName}
              quoteEmail={quoteEmail}
              quotePhone={quotePhone}
              defaultCustomer={
                customer
                  ? { value: customer.id, label: customer.label }
                  : undefined
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
