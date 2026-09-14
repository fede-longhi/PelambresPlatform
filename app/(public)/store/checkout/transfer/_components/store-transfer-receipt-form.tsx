'use client';

import { useActionState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  uploadStoreTransferReceipt,
  type StoreTransferReceiptFormState,
} from '@/lib/actions/store-checkout-actions';

type StoreTransferReceiptFormProps = {
  orderId: string;
  hasExistingReceipt: boolean;
};

export function StoreTransferReceiptForm({
  orderId,
  hasExistingReceipt,
}: StoreTransferReceiptFormProps) {
  const initialState: StoreTransferReceiptFormState = {
    message: null,
    success: false,
  };
  const [state, formAction, isPending] = useActionState(
    uploadStoreTransferReceipt,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="space-y-1.5">
        <Label htmlFor="receipt">
          {hasExistingReceipt
            ? 'Reemplazar comprobante'
            : 'Subir comprobante'}
        </Label>
        <Input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WEBP o PDF. Máximo 8 MB.
        </p>
      </div>

      {state.message ? (
        <p
          className={
            state.success ? 'text-sm text-emerald-700' : 'text-sm text-red-600'
          }
          role={state.success ? 'status' : 'alert'}
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={18} aria-hidden="true" />
            Subiendo…
          </>
        ) : (
          <>
            <Upload className="mr-2" size={18} aria-hidden="true" />
            {hasExistingReceipt ? 'Actualizar comprobante' : 'Enviar comprobante'}
          </>
        )}
      </Button>
    </form>
  );
}
