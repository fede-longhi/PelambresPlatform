'use client';

import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  QUOTE_DOCUMENT_STATUSES,
  QUOTE_DOCUMENT_STATUS_LABELS,
  type QuoteDocumentStatus,
} from '@/lib/consts/quote-document-consts';
import InlineStatusSelect from '@/components/shared/inline-status-select';
import QuoteStatusBadge from './quote-status-badge';
import {
  updateQuoteDocumentStatus,
  type QuoteDocumentStatusFormState,
} from '@/lib/actions/quote-document-actions';

export default function QuoteDocumentStatusForm({
  quoteId,
  status,
  inline = false,
}: {
  quoteId: string;
  status: QuoteDocumentStatus;
  inline?: boolean;
}) {
  const fieldId = inline ? `quote-document-status-${quoteId}` : 'quote-document-status';
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
  }, [state.success, state.savedStatus, toast]);

  return (
    <div className={inline ? undefined : 'space-y-3'} aria-busy={isPending}>
      <div>
        {inline ? (
          <InlineStatusSelect
            id={fieldId}
            value={status}
            disabled={isPending}
            renderBadge={(value) => <QuoteStatusBadge status={value} />}
            options={QUOTE_DOCUMENT_STATUSES.map((value) => ({
              value,
              label: QUOTE_DOCUMENT_STATUS_LABELS[value],
            }))}
            onChange={(nextStatus) => {
              const formData = new FormData();
              formData.set('status', nextStatus);
              formAction(formData);
            }}
          />
        ) : (
          <>
            <Label htmlFor={fieldId}>Estado</Label>
            <select
              id={fieldId}
              name="status"
              key={status}
              defaultValue={status}
              disabled={isPending}
              onChange={(event) => {
                const formData = new FormData();
                formData.set('status', event.currentTarget.value);
                formAction(formData);
              }}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            >
              {QUOTE_DOCUMENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {QUOTE_DOCUMENT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </>
        )}
        <FieldErrorDisplay
          id={`${fieldId}-error`}
          errors={state.errors?.status}
        />
      </div>
      {inline || !isPending ? null : (
        <p className="text-sm text-muted-foreground" role="status">
          Guardando...
        </p>
      )}
      {state.message && !state.success ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
    </div>
  );
}
