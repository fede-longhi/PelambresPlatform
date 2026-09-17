'use client';

import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { ORDER_STATUS_VALUES, OrderStatuses } from '@/types/order-definitions';
import type { OrderStatus } from '@/types/order-definitions';
import {
  updateOrderStatus,
  type OrderStatusFormState,
} from '@/lib/actions/order-actions';

export default function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const initialState: OrderStatusFormState = {
    message: null,
    success: false,
  };
  const updateStatus = updateOrderStatus.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(
    updateStatus,
    initialState
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Estado actualizado',
        description: 'El pedido quedó con el nuevo estado.',
        variant: 'success',
      });
    }
  }, [state.success, state.savedStatus, toast]);

  return (
    <div className="space-y-3" aria-busy={isPending}>
      <div>
        <Label htmlFor="order-status">Estado</Label>
        <select
          id="order-status"
          name="status"
          defaultValue={status}
          disabled={isPending}
          onChange={(event) => {
            const nextStatus = event.currentTarget.value as OrderStatus;
            if (nextStatus === 'cancelled' || nextStatus === 'delivered') {
              const confirmed = window.confirm(
                nextStatus === 'cancelled'
                  ? '¿Cancelar este pedido?'
                  : '¿Marcar el pedido como entregado?'
              );
              if (!confirmed) {
                event.currentTarget.value = status;
                return;
              }
            }

            const formData = new FormData();
            formData.set('status', nextStatus);
            formAction(formData);
          }}
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
        >
          {ORDER_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {OrderStatuses[value].label}
            </option>
          ))}
        </select>
        <FieldErrorDisplay
          id="order-status-error"
          errors={state.errors?.status}
        />
      </div>
      {isPending ? (
        <p className="text-sm text-muted-foreground" role="status">
          Guardando...
        </p>
      ) : null}
      {state.message && !state.success ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
