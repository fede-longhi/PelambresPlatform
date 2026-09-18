'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { formatCurrency, formatDateTimeToLocal } from '@/lib/utils';
import { centsToPesos } from '@/lib/quote-math';
import {
  ORDER_PAYMENT_KIND_LABELS,
  ORDER_PAYMENT_METHOD_OPTIONS,
  getOrderPaymentKindLabel,
  getOrderPaymentMethodLabel,
  getOrderPaymentRemainingCents,
} from '@/lib/consts/order-payment-consts';
import {
  createOrderPayment,
  deleteOrderPayment,
  type OrderPaymentFormState,
} from '@/lib/actions/order-actions';
import type {
  OrderPayment,
  OrderPaymentKind,
  OrderPaymentStatus,
} from '@/types/order-definitions';
import OrderPaymentBadge from './order-payment-badge';

const KIND_OPTIONS: { value: OrderPaymentKind; label: string }[] = [
  { value: 'deposit', label: ORDER_PAYMENT_KIND_LABELS.deposit },
  { value: 'partial', label: ORDER_PAYMENT_KIND_LABELS.partial },
  { value: 'full', label: ORDER_PAYMENT_KIND_LABELS.full },
];

export default function OrderPaymentPanel({
  orderId,
  amountCents,
  paidAmountCents,
  paymentStatus,
  paidAt,
  payments,
}: {
  orderId: string;
  amountCents: number;
  paidAmountCents: number;
  paymentStatus: OrderPaymentStatus;
  paidAt?: string | null;
  payments: OrderPayment[];
}) {
  const remainingCents = getOrderPaymentRemainingCents(
    amountCents,
    paidAmountCents
  );
  const remainingPesos = centsToPesos(remainingCents);
  const defaultKind: OrderPaymentKind =
    payments.length === 0 ? 'deposit' : remainingCents > 0 ? 'partial' : 'full';

  const initialState: OrderPaymentFormState = {
    message: null,
    success: false,
  };
  const registerPayment = createOrderPayment.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(
    registerPayment,
    initialState
  );
  const [kind, setKind] = useState<OrderPaymentKind>(defaultKind);
  const [amount, setAmount] = useState(
    remainingCents > 0 ? String(remainingPesos) : ''
  );
  const { toast } = useToast();

  const remainingLabel = useMemo(
    () => formatCurrency(remainingCents),
    [remainingCents]
  );

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Pago actualizado',
        description: state.message ?? 'El pago se registró correctamente.',
        variant: 'success',
      });
    }
  }, [state.success, state.message, toast]);

  function handleKindChange(nextKind: OrderPaymentKind) {
    setKind(nextKind);
    if (nextKind === 'full' && remainingCents > 0) {
      setAmount(String(remainingPesos));
    }
  }

  const isPaid = remainingCents <= 0 && paymentStatus === 'paid';

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Estado</dt>
          <dd className="mt-1">
            <OrderPaymentBadge status={paymentStatus} />
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cobrado</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {formatCurrency(paidAmountCents)} / {formatCurrency(amountCents)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Saldo</dt>
          <dd className="mt-1 font-medium tabular-nums">{remainingLabel}</dd>
        </div>
      </dl>

      {paidAt && paymentStatus === 'paid' ? (
        <p className="text-sm text-muted-foreground">
          Pagado el {formatDateTimeToLocal(paidAt, 'es-AR')}
        </p>
      ) : null}

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay pagos registrados.
        </p>
      ) : (
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex flex-col gap-2 rounded-md border bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {getOrderPaymentKindLabel(payment.kind)} ·{' '}
                  {formatCurrency(payment.amountCents)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getOrderPaymentMethodLabel(payment.method)} ·{' '}
                  {formatDateTimeToLocal(payment.paidAt, 'es-AR')}
                </p>
                {payment.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {payment.notes}
                  </p>
                ) : null}
              </div>
              <ConfirmDeleteButton
                variant="ghost"
                className="text-destructive hover:text-destructive"
                ariaLabel="Eliminar pago"
                title="Eliminar pago"
                description="Se va a quitar este pago y se va a recalcular el saldo del pedido."
                action={deleteOrderPayment.bind(null, orderId, payment.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {isPaid ? null : (
        <form action={formAction} className="space-y-4" aria-busy={isPending}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-payment-kind">Tipo</Label>
              <select
                id="order-payment-kind"
                name="kind"
                value={kind}
                onChange={(event) =>
                  handleKindChange(event.target.value as OrderPaymentKind)
                }
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                aria-invalid={!!state.errors?.kind}
                aria-describedby="order-payment-kind-error"
              >
                {KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldErrorDisplay
                id="order-payment-kind-error"
                errors={state.errors?.kind}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-payment-amount">Importe</Label>
              <Input
                id="order-payment-amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                readOnly={kind === 'full'}
                className="bg-white"
                aria-invalid={!!state.errors?.amount}
                aria-describedby="order-payment-amount-error"
              />
              <FieldErrorDisplay
                id="order-payment-amount-error"
                errors={state.errors?.amount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-payment-method">Método</Label>
              <select
                id="order-payment-method"
                name="method"
                defaultValue="transfer"
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                aria-invalid={!!state.errors?.method}
                aria-describedby="order-payment-method-error"
              >
                {ORDER_PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldErrorDisplay
                id="order-payment-method-error"
                errors={state.errors?.method}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="order-payment-notes">Notas</Label>
              <Textarea
                id="order-payment-notes"
                name="notes"
                rows={2}
                placeholder="Opcional. Referencia, comprobante o comentario interno."
                aria-invalid={!!state.errors?.notes}
                aria-describedby="order-payment-notes-error"
              />
              <FieldErrorDisplay
                id="order-payment-notes-error"
                errors={state.errors?.notes}
              />
            </div>
          </div>

          {state.message && !state.success ? (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Registrando...' : 'Registrar pago'}
            </Button>
            {kind !== 'full' ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending || remainingCents <= 0}
                onClick={() => {
                  handleKindChange('full');
                }}
              >
                Completar saldo ({remainingLabel})
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
