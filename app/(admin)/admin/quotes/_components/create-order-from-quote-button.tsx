'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  createOrderFromQuote,
  type CreateOrderFromQuoteState,
} from '@/lib/actions/order-actions';
import { formatCurrency } from '@/lib/utils';

export default function CreateOrderFromQuoteButton({
  quoteId,
  totalCents,
}: {
  quoteId: string;
  totalCents: number;
}) {
  const initialState: CreateOrderFromQuoteState = {
    message: null,
    success: false,
  };
  const boundAction = createOrderFromQuote.bind(null, quoteId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-stretch gap-1 sm:items-end">
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creando pedido...' : `Crear pedido · ${formatCurrency(totalCents)}`}
      </Button>
      <p className="text-xs text-muted-foreground">
        Pendiente, con entrega estimada a 14 días.
      </p>
      {state.message && !state.success ? (
        <p className="text-xs text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
