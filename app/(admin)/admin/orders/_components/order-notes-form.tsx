'use client';

import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  updateOrderNotes,
  type OrderNotesFormState,
} from '@/lib/actions/order-actions';

export default function OrderNotesForm({
  orderId,
  notes,
}: {
  orderId: string;
  notes: string;
}) {
  const initialState: OrderNotesFormState = {
    message: null,
    success: false,
  };
  const saveNotes = updateOrderNotes.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(saveNotes, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Notas guardadas',
        description: 'Las notas internas del pedido se actualizaron.',
        variant: 'success',
      });
    }
  }, [state.success, state.message, toast]);

  return (
    <form action={formAction} className="space-y-3" aria-busy={isPending}>
      <div className="space-y-2">
        <Label htmlFor="order-notes" className="sr-only">
          Notas internas
        </Label>
        <Textarea
          id="order-notes"
          name="notes"
          defaultValue={notes}
          rows={5}
          placeholder="Comentarios de producción, empaquetado o entrega."
          aria-invalid={!!state.errors?.notes}
          aria-describedby="order-notes-error"
        />
        <FieldErrorDisplay id="order-notes-error" errors={state.errors?.notes} />
      </div>
      {state.message && !state.success ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar notas'}
      </Button>
    </form>
  );
}
