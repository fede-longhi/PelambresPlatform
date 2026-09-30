'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  applyAcceptedRevisionToOrder,
  type CreateOrderFromQuoteState,
} from '@/lib/actions/order-actions';

export default function ApplyRevisionToOrderButton({
  quoteId,
  trackingCode,
}: {
  quoteId: string;
  trackingCode?: string | null;
}) {
  const initialState: CreateOrderFromQuoteState = {
    message: null,
    success: false,
  };
  const boundAction = applyAcceptedRevisionToOrder.bind(null, quoteId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-stretch gap-1 sm:items-end">
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Aplicando...' : 'Aplicar al pedido'}
        {trackingCode ? ` ${trackingCode}` : ''}
      </Button>
      <p className="text-xs text-muted-foreground">
        Reemplaza las líneas del pedido abierto. El código y los pagos se mantienen.
      </p>
      {state.message && !state.success ? (
        <p className="text-xs text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
