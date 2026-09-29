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
import InlineStatusSelect from '@/components/shared/inline-status-select';
import QuoteRequestStatusBadge from './quote-request-status-badge';
import {
  updateQuoteRequestStatus,
  type QuoteStatusFormState,
} from '@/lib/actions/quote-actions';

export default function QuoteStatusForm({
  quoteRequestId,
  status,
  inline = false,
}: {
  quoteRequestId: string;
  status: QuoteRequestStatus;
  inline?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const fieldId = inline ? `quote-status-${quoteRequestId}` : 'quote-status';
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
      className={inline ? undefined : 'space-y-3'}
      aria-busy={isPending}
    >
      <div>
        {inline ? (
          <InlineStatusSelect
            id={fieldId}
            value={status}
            disabled={isPending}
            renderBadge={(value) => <QuoteRequestStatusBadge status={value} />}
            options={QUOTE_REQUEST_STATUSES.map((value) => ({
              value,
              label: QUOTE_REQUEST_STATUS_LABELS[value],
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
              onChange={() => formRef.current?.requestSubmit()}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            >
              {QUOTE_REQUEST_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {QUOTE_REQUEST_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </>
        )}
        <FieldErrorDisplay id={`${fieldId}-error`} errors={state.errors?.status} />
      </div>
      {inline || !isPending ? null : (
        <p className="text-sm text-muted-foreground" role="status">
          Guardando...
        </p>
      )}
      {state.message && !state.success ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
