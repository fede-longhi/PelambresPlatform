'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, OrderFormState } from '@/lib/actions/order-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  CustomerSelectField,
  StatusField,
  TrackingCodeInput,
} from './form-fields';

export default function CreateForm() {
  const router = useRouter();
  const initialState: OrderFormState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createOrder,
    initialState
  );

  return (
    <form action={formAction}>
      <div className="space-y-4 rounded-md bg-gray-50 p-4 md:p-6">
        <TrackingCodeInput
          errors={state.errors?.code}
        />
        <CustomerSelectField />
        <FieldErrorDisplay
          id="customer-error"
          errors={state.errors?.customerId}
        />

        <StatusField state={state} />

        <div className="space-y-2">
          <Label htmlFor="amount">Importe</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={(state.payload?.get('amount') || '') as string}
            placeholder="0,00"
            aria-invalid={!!state.errors?.amount}
            aria-describedby="amount-error"
          />
          <FieldErrorDisplay id="amount-error" errors={state.errors?.amount} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedDate">Fecha estimada</Label>
          <Input
            id="estimatedDate"
            type="date"
            name="estimatedDate"
            defaultValue={
              (state.payload?.get('estimatedDate') || '') as string
            }
            aria-invalid={!!state.errors?.estimatedDate}
            aria-describedby="estimated-date-error"
          />
          <FieldErrorDisplay
            id="estimated-date-error"
            errors={state.errors?.estimatedDate}
          />
        </div>

        {state.message ? (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-row space-x-2">
          <span className="flex-1" />
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
            {isPending ? 'Guardando...' : 'Crear pedido'}
          </Button>
        </div>
      </div>
    </form>
  );
}
