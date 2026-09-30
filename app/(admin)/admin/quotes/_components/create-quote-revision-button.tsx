'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  createQuoteRevision,
  type QuoteDocumentStatusFormState,
} from '@/lib/actions/quote-document-actions';

export default function CreateQuoteRevisionButton({ quoteId }: { quoteId: string }) {
  const initialState: QuoteDocumentStatusFormState = {
    message: null,
    success: false,
  };
  const boundAction = createQuoteRevision.bind(null, quoteId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? 'Creando versión...' : 'Nueva versión'}
      </Button>
      {state.message && !state.success ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
