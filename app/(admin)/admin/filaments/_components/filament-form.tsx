'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  createFilament,
  updateFilament,
  type FilamentFormState,
} from '@/lib/actions/filament-actions';
import type { Filament } from '@/types/definitions';

const initialState: FilamentFormState = {
  errors: {},
  message: null,
  success: false,
};

const FILAMENTS_PATH = '/admin/filaments';

export default function FilamentForm({
  filament,
  onSuccess,
}: {
  filament?: Filament;
  onSuccess?: () => void;
}) {
  const action = filament
    ? updateFilament.bind(null, filament.id, {
        redirect: false,
        path: FILAMENTS_PATH,
      })
    : createFilament.bind(null, { redirect: false, path: FILAMENTS_PATH });

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={filament ? `type-${filament.id}` : 'type'}>Tipo</Label>
        <Input
          id={filament ? `type-${filament.id}` : 'type'}
          name="type"
          defaultValue={filament?.type ?? ''}
          aria-invalid={!!state.errors?.type}
          aria-describedby={filament ? `type-${filament.id}-error` : 'type-error'}
        />
        <FieldErrorDisplay
          errors={state.errors?.type}
          id={filament ? `type-${filament.id}-error` : 'type-error'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={filament ? `brand-${filament.id}` : 'brand'}>Marca</Label>
        <Input
          id={filament ? `brand-${filament.id}` : 'brand'}
          name="brand"
          defaultValue={filament?.brand ?? ''}
          aria-invalid={!!state.errors?.brand}
          aria-describedby={
            filament ? `brand-${filament.id}-error` : 'brand-error'
          }
        />
        <FieldErrorDisplay
          errors={state.errors?.brand}
          id={filament ? `brand-${filament.id}-error` : 'brand-error'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={filament ? `price-${filament.id}` : 'price_per_kg'}>
          Precio por kg (ARS)
        </Label>
        <Input
          id={filament ? `price-${filament.id}` : 'price_per_kg'}
          name="price_per_kg"
          type="number"
          step="any"
          min="0"
          defaultValue={filament?.price_per_kg ?? ''}
          aria-invalid={!!state.errors?.price_per_kg}
          aria-describedby={
            filament ? `price-${filament.id}-error` : 'price_per_kg-error'
          }
        />
        <FieldErrorDisplay
          errors={state.errors?.price_per_kg}
          id={filament ? `price-${filament.id}-error` : 'price_per_kg-error'}
        />
      </div>

      {!state.success && state.message ? (
        <FieldErrorDisplay errors={[state.message]} id="filament-form-error" />
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending
          ? 'Guardando…'
          : filament
            ? 'Guardar cambios'
            : 'Crear filamento'}
      </Button>
    </form>
  );
}
