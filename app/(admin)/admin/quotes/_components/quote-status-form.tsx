'use client';

import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  QUOTE_DOCUMENT_STATUSES,
  QUOTE_DOCUMENT_STATUS_LABELS,
  type QuoteDocumentStatus,
} from '@/lib/consts/quote-document-consts';
import {
  updateQuoteDocumentStatus,
  type QuoteDocumentStatusFormState,
} from '@/lib/actions/quote-document-actions';

export default function QuoteDocumentStatusForm({
  quoteId,
  status,
}: {
  quoteId: string;
  status: QuoteDocumentStatus;
}) {
  const initialState: QuoteDocumentStatusFormState = {
    message: null,
    success: false,
  };
  const updateStatus = updateQuoteDocumentStatus.bind(null, quoteId);
  const [state, formAction, isPending] = useActionState(
    updateStatus,
    initialState
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Estado actualizado',
        description: 'El presupuesto quedó con el nuevo estado.',
        variant: 'success',
      });
    }
  }, [state.success, toast]);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="quote-document-status">Estado</Label>
        <select
          id="quote-document-status"
          name="status"
          defaultValue={status}
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
        >
          {QUOTE_DOCUMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {QUOTE_DOCUMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <FieldErrorDisplay
          id="quote-document-status-error"
          errors={state.errors?.status}
        />
      </div>
      {state.message && !state.success ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Actualizar estado'}
      </Button>
    </form>
  );
}
