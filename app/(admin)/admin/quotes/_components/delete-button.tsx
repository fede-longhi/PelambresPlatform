'use client';

import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { deleteQuoteDocument } from '@/lib/actions/quote-document-actions';

export default function DeleteQuoteDocumentButton({
  quoteId,
  quoteNumber,
}: {
  quoteId: string;
  quoteNumber: string;
}) {
  const deleteQuote = deleteQuoteDocument.bind(null, quoteId);

  return (
    <ConfirmDeleteButton
      variant="outline"
      className="text-destructive hover:text-destructive"
      label="Eliminar"
      ariaLabel={`Eliminar presupuesto ${quoteNumber}`}
      title="Eliminar presupuesto"
      description={`Se va a eliminar el presupuesto Nº ${quoteNumber}. El número no se reutiliza.`}
      action={deleteQuote}
    />
  );
}
