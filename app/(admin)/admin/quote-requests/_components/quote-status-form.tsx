'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  QUOTE_REQUEST_STATUSES,
  QUOTE_REQUEST_STATUS_LABELS,
  type QuoteRequestStatus,
} from '@/lib/consts/quote-request-consts';
import {
  updateQuoteRequestStatus,
  type QuoteStatusFormState,
} from '@/lib/actions/quote-actions';

export default function QuoteStatusForm({
  quoteRequestId,
  status,
}: {
  quoteRequestId: string;
  status: QuoteRequestStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: QuoteStatusFormState = {
    message: null,
    success: false,
  };
  const updateStatus = updateQuoteRequestStatus.bind(null, quoteRequestId);
  const [state, formAction, isPending] = useActionState(
    updateStatus,
    initialState
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Estado actualizado',
        description: 'La solicitud quedó con el nuevo estado.',
        variant: 'success',
      });
    }
  }, [state.success, state.savedStatus, toast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3"
      aria-busy={isPending}
    >
      <div>
        <Label htmlFor="quote-status">Estado</Label>
        <select
          id="quote-status"
          name="status"
          defaultValue={status}
          disabled={isPending}
          onChange={() => formRef.current?.requestSubmit()}
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
        >
          {QUOTE_REQUEST_STATUSES.map((value) => (
            <option key={value} value={value}>
              {QUOTE_REQUEST_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <FieldErrorDisplay id="quote-status-error" errors={state.errors?.status} />
      </div>
      {isPending ? (
        <p className="text-sm text-muted-foreground" role="status">
          Guardando...
        </p>
      ) : null}
      {state.message && !state.success ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
