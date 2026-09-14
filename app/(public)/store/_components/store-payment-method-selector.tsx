'use client';

import type { StorePaymentMethod } from '@/types/store-definitions';

type StorePaymentMethodSelectorProps = {
  value: StorePaymentMethod;
  onChange: (value: StorePaymentMethod) => void;
  transferAvailable: boolean;
  disabled?: boolean;
};

export function StorePaymentMethodSelector({
  value,
  onChange,
  transferAvailable,
  disabled,
}: StorePaymentMethodSelectorProps) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="mb-1 text-sm font-medium text-slate-700">
        Método de pago
      </legend>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <input
          type="radio"
          name="paymentMethodUi"
          value="mercadopago"
          checked={value === 'mercadopago'}
          onChange={() => onChange('mercadopago')}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium text-slate-900">
            Mercado Pago
          </span>
          <span className="block text-xs text-muted-foreground">
            Tarjeta, débito o dinero en cuenta. Confirmación inmediata.
          </span>
        </span>
      </label>
      {transferAvailable ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="paymentMethodUi"
            value="transfer"
            checked={value === 'transfer'}
            onChange={() => onChange('transfer')}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900">
              Transferencia bancaria
            </span>
            <span className="block text-xs text-muted-foreground">
              Te mostramos CBU/alias y subís el comprobante.
            </span>
          </span>
        </label>
      ) : null}
    </fieldset>
  );
}
