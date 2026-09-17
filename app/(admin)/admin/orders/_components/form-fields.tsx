'use client';

import { useEffect, useState } from 'react';
import { OrderFormState } from '@/lib/actions/order-actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import CustomerSelectField from '@/components/shared/customer-select-field';
import type { CustomerField } from '@/components/shared/customer-select-field';
import {
  ORDER_CREATE_STATUS_VALUES,
  ORDER_STATUS_VALUES,
  OrderStatuses,
} from '@/types/order-definitions';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { generateCode } from '@/lib/utils';
import { TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH } from '@/lib/consts';
import { Dices } from 'lucide-react';
import FieldErrorDisplay from '@/components/ui/field-error-display';

export { CustomerSelectField };
export type { CustomerField };

export function StatusField({
  defaultValue,
  state,
  includeCancelled = false,
}: {
  defaultValue?: string;
  state: OrderFormState;
  includeCancelled?: boolean;
}) {
  const [orderStatus, setOrderStatus] = useState<string>(
    defaultValue ?? 'pending'
  );
  const statuses = includeCancelled
    ? ORDER_STATUS_VALUES
    : ORDER_CREATE_STATUS_VALUES;

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Estado del pedido</legend>
      <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-col gap-4 md:flex-row">
          {statuses.map((statusValue) => {
            const status = OrderStatuses[statusValue];
            const Icon = status.icon;
            return (
              <div key={status.value} className="flex items-center">
                <input
                  id={`order-status-${status.value}`}
                  name="status"
                  type="radio"
                  value={status.value}
                  checked={orderStatus === status.value}
                  onChange={() => setOrderStatus(status.value)}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-primary focus:ring-2"
                  aria-describedby="status-error"
                />
                <label
                  htmlFor={`order-status-${status.value}`}
                  className={`ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status.class}`}
                >
                  {status.label}
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <FieldErrorDisplay id="status-error" errors={state.errors?.status} />
    </fieldset>
  );
}

export function TrackingCodeInput({
  defaultValue,
  errors,
}: {
  defaultValue?: string;
  errors?: string[];
}) {
  const [code, setCode] = useState<string>(defaultValue ?? '');

  useEffect(() => {
    if (!defaultValue) {
      setCode(generateCode(TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH));
    }
  }, [defaultValue]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex flex-col">
        <Label htmlFor="code" className="mb-2">
          Código
        </Label>
        <InputOTP
          className="bg-white"
          id="code"
          name="code"
          maxLength={TRACKING_CODE_LENGTH}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          value={code}
          onChange={(newCode) => {
            setCode(newCode);
          }}
          aria-describedby="code-error"
          aria-invalid={!!errors?.length}
        >
          <InputOTPGroup className="bg-white">
            {[...Array(TRACKING_CODE_LENGTH)].map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldErrorDisplay id="code-error" errors={errors} />
      </div>
      <Button
        className="md:ml-4"
        type="button"
        variant="outline"
        aria-label="Generar código de seguimiento"
        onClick={() => {
          setCode(generateCode(TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH));
        }}
      >
        Generar
        <Dices className="ml-2 size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
