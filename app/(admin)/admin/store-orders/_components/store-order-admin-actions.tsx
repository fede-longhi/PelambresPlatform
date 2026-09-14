'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  cancelStoreOrder,
  markStoreOrderPaid,
  type StoreOrderAdminActionState,
} from '@/lib/actions/store-order-actions';
import type { StoreOrderStatus } from '@/types/store-definitions';

type StoreOrderAdminActionsProps = {
  orderId: string;
  status: StoreOrderStatus;
};

export function StoreOrderAdminActions({
  orderId,
  status,
}: StoreOrderAdminActionsProps) {
  const canMarkPaid =
    status === 'pending' || status === 'payment_review';
  const canCancel =
    status === 'pending' ||
    status === 'payment_review' ||
    status === 'failed';

  const paidInitial: StoreOrderAdminActionState = {
    message: null,
    success: false,
  };
  const cancelInitial: StoreOrderAdminActionState = {
    message: null,
    success: false,
  };

  const [paidState, paidAction, paidPending] = useActionState(
    markStoreOrderPaid,
    paidInitial
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelStoreOrder,
    cancelInitial
  );

  if (!canMarkPaid && !canCancel) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Acciones</h2>
      <div className="flex flex-wrap gap-3">
        {canMarkPaid ? (
          <form action={paidAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <Button type="submit" disabled={paidPending || cancelPending}>
              {paidPending ? (
                <>
                  <Loader2
                    className="mr-2 animate-spin"
                    size={16}
                    aria-hidden="true"
                  />
                  Guardando…
                </>
              ) : (
                'Marcar como pagado'
              )}
            </Button>
          </form>
        ) : null}
        {canCancel ? (
          <form action={cancelAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <Button
              type="submit"
              variant="outline"
              disabled={paidPending || cancelPending}
            >
              {cancelPending ? (
                <>
                  <Loader2
                    className="mr-2 animate-spin"
                    size={16}
                    aria-hidden="true"
                  />
                  Cancelando…
                </>
              ) : (
                'Cancelar pedido'
              )}
            </Button>
          </form>
        ) : null}
      </div>
      {paidState.message ? (
        <p
          className={
            paidState.success ? 'text-sm text-emerald-700' : 'text-sm text-red-600'
          }
        >
          {paidState.message}
        </p>
      ) : null}
      {cancelState.message ? (
        <p
          className={
            cancelState.success
              ? 'text-sm text-emerald-700'
              : 'text-sm text-red-600'
          }
        >
          {cancelState.message}
        </p>
      ) : null}
    </div>
  );
}
