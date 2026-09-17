'use client';

import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/definitions';
import { OrderFormState, updateOrder } from '@/lib/actions/order-actions';
import { dateLongStringToString, getOrderCustomerName } from '@/lib/utils';
import { centsToPesos } from '@/lib/quote-math';
import {
  CustomerSelectField,
  StatusField,
  TrackingCodeInput,
} from './form-fields';
import FieldErrorDisplay from '@/components/ui/field-error-display';

interface OrderEditFormProps {
  order: Order;
}

export default function OrderEditForm({ order }: OrderEditFormProps) {
  const router = useRouter();
  const initialState: OrderFormState = { message: null, errors: {} };
  const updateOrderWithId = updateOrder.bind(null, order.id);
  const [state, formAction, isPending] = useActionState(
    updateOrderWithId,
    initialState
  );

  const estimatedDate = dateLongStringToString(order.estimated_date);
  const amountInPesos = centsToPesos(order.amount);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4 shadow-md">
      <TrackingCodeInput
        defaultValue={order.tracking_code}
        errors={state.errors?.code}
      />

      <div className="space-y-2">
        <Label htmlFor="estimatedDate">Fecha estimada</Label>
        <Input
          type="date"
          id="estimatedDate"
          name="estimatedDate"
          defaultValue={
            (state.payload?.get('estimatedDate') as string) || estimatedDate
          }
          aria-invalid={!!state.errors?.estimatedDate}
          aria-describedby="estimated-date-error"
        />
        <FieldErrorDisplay
          id="estimated-date-error"
          errors={state.errors?.estimatedDate}
        />
      </div>

      <StatusField
        defaultValue={order.status}
        state={state}
        includeCancelled
      />

      <CustomerSelectField
        defaultValue={{
          value: order.customer_id,
          label: getOrderCustomerName(order),
        }}
      />
      <FieldErrorDisplay
        id="customer-error"
        errors={state.errors?.customerId}
      />

      <div className="space-y-2">
        <Label htmlFor="amount">Importe</Label>
        <Input
          type="number"
          id="amount"
          name="amount"
          min="0"
          step="0.01"
          defaultValue={
            (state.payload?.get('amount') as string) || String(amountInPesos)
          }
          aria-invalid={!!state.errors?.amount}
          aria-describedby="amount-error"
        />
        <FieldErrorDisplay id="amount-error" errors={state.errors?.amount} />
      </div>

      {state.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-row justify-end space-x-4 border-t">
        <Button
          className="mt-4"
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            router.back();
          }}
        >
          Cancelar
        </Button>
        <Button className="mt-4" type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
