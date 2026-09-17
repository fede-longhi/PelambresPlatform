'use client';

import { useActionState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { OrderStatuses } from '@/types/order-definitions';
import {
  sendOrderStatusEmailToCustomer,
  type SendOrderStatusEmailFormState,
} from '@/lib/actions/order-actions';

export default function OrderStatusEmailButtons({
  orderId,
  customerEmail,
}: {
  orderId: string;
  customerEmail?: string | null;
}) {
  const initialState: SendOrderStatusEmailFormState = {
    message: null,
    success: false,
  };
  const sendEmail = sendOrderStatusEmailToCustomer.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(sendEmail, initialState);
  const { toast } = useToast();
  const hasEmail = Boolean(customerEmail?.trim());

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Email enviado',
        description: state.message ?? 'El cliente recibió el aviso.',
        variant: 'success',
      });
    }
  }, [state.success, state.message, toast]);

  function confirmSend(label: string) {
    if (!hasEmail) {
      return false;
    }

    return window.confirm(
      `¿Enviar el aviso de pedido ${label.toLowerCase()} a ${customerEmail?.trim()}?`
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Avisos al cliente</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <form
          action={formAction}
          onSubmit={(event) => {
            if (!confirmSend(OrderStatuses.finished.label)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="status" value="finished" />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending || !hasEmail}
          >
            <Mail className="mr-2 size-4" aria-hidden="true" />
            Aviso de terminado
          </Button>
        </form>
        <form
          action={formAction}
          onSubmit={(event) => {
            if (!confirmSend(OrderStatuses.delivered.label)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="status" value="delivered" />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending || !hasEmail}
          >
            <Mail className="mr-2 size-4" aria-hidden="true" />
            Aviso de entregado
          </Button>
        </form>
      </div>
      {!hasEmail ? (
        <p className="text-xs text-muted-foreground">
          Falta el email del cliente para enviar avisos.
        </p>
      ) : null}
      {isPending ? (
        <p className="text-xs text-muted-foreground" role="status">
          Enviando aviso...
        </p>
      ) : null}
      {state.message && !state.success ? (
        <p className="text-xs text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
