'use client';

import { useActionState, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ORDER_STATUS_VALUES, OrderStatuses } from '@/types/order-definitions';
import type { OrderStatus } from '@/types/order-definitions';
import {
  updateOrderStatus,
  type OrderStatusFormState,
} from '@/lib/actions/order-actions';
import OrderStatusEmailButtons from './order-status-email-buttons';

export default function OrderStatusForm({
  orderId,
  status,
  customerEmail,
}: {
  orderId: string;
  status: OrderStatus;
  customerEmail?: string | null;
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
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const { toast } = useToast();
  const hasEmail = Boolean(customerEmail?.trim());

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Estado actualizado',
        description:
          state.emailStatus === 'sent'
            ? 'Se avisó al cliente por email.'
            : state.emailStatus === 'failed'
              ? 'El estado se guardó, pero no se pudo enviar el email.'
              : state.message ?? 'El pedido quedó con el nuevo estado.',
        variant: 'success',
      });
    }
  }, [state.success, state.savedStatus, state.emailStatus, state.message, toast]);

  function submitStatus(nextStatus: OrderStatus, sendEmail: boolean) {
    const formData = new FormData();
    formData.set('status', nextStatus);
    formData.set('sendEmail', sendEmail ? 'true' : 'false');
    formAction(formData);
  }

  const pendingLabel = pendingStatus
    ? OrderStatuses[pendingStatus].label.toLowerCase()
    : '';

  return (
    <div className="space-y-4" aria-busy={isPending}>
      <div>
        <Label htmlFor="order-status">Estado</Label>
        <select
          id="order-status"
          name="status"
          key={status}
          defaultValue={status}
          disabled={isPending}
          onChange={(event) => {
            const nextStatus = event.currentTarget.value as OrderStatus;
            event.currentTarget.value = status;

            if (nextStatus === 'cancelled') {
              const confirmed = window.confirm('¿Cancelar este pedido?');
              if (!confirmed) {
                return;
              }
              submitStatus(nextStatus, false);
              return;
            }

            if (nextStatus === 'finished' || nextStatus === 'delivered') {
              setPendingStatus(nextStatus);
              return;
            }

            submitStatus(nextStatus, false);
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

      <OrderStatusEmailButtons
        orderId={orderId}
        customerEmail={customerEmail}
      />

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

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingStatus(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === 'delivered'
                ? '¿Marcar el pedido como entregado?'
                : '¿Marcar el pedido como terminado?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasEmail
                ? `Podés avisar al cliente por email ahora, o enviarlo después con el botón de aviso de ${pendingLabel}.`
                : 'El cliente no tiene email cargado. El estado se va a guardar igual y podés enviar el aviso cuando haya un correo.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!pendingStatus) {
                  return;
                }
                submitStatus(pendingStatus, false);
                setPendingStatus(null);
              }}
            >
              Guardar
            </Button>
            <Button
              type="button"
              disabled={!hasEmail}
              onClick={() => {
                if (!pendingStatus) {
                  return;
                }
                submitStatus(pendingStatus, true);
                setPendingStatus(null);
              }}
            >
              Guardar y enviar email
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
