'use client';

import { useActionState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  sendQuoteDocumentToCustomer,
  type SendQuoteDocumentFormState,
} from '@/lib/actions/quote-document-actions';

export default function SendQuoteEmailButton({
  quoteId,
  clientEmail,
}: {
  quoteId: string;
  clientEmail: string;
}) {
  const initialState: SendQuoteDocumentFormState = {
    message: null,
    success: false,
  };
  const boundAction = sendQuoteDocumentToCustomer.bind(null, quoteId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const { toast } = useToast();
  const hasEmail = clientEmail.trim().length > 0;

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Presupuesto enviado',
        description: state.message ?? 'El cliente recibió el presupuesto por email.',
        variant: 'success',
      });
    }
  }, [state.success, state.message, toast]);

  return (
    <form action={formAction} className="flex flex-col items-stretch gap-1 sm:items-end">
      <Button type="submit" variant="outline" disabled={isPending || !hasEmail}>
        <Mail className="mr-2 size-4" aria-hidden="true" />
        {isPending ? 'Enviando...' : 'Enviar al cliente'}
      </Button>
      {!hasEmail ? (
        <p className="text-xs text-muted-foreground">
          Falta el email del cliente en el presupuesto.
        </p>
      ) : null}
      {state.message && !state.success ? (
        <p className="text-xs text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
