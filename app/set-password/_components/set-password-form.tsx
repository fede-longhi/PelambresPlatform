'use client';

import { useState, type FormEvent } from 'react';
import type { SetInitialPasswordResult } from '@/types/user-definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';

const initialState: SetInitialPasswordResult = { message: null, success: false };

export default function SetPasswordForm() {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState(initialState);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch('/api/set-initial-password', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        setState({ message: 'Hubo un error al establecer la contraseña.', success: false });
        return;
      }

      const result = (await response.json()) as SetInitialPasswordResult;
      setState(result);

      if (result.success) {
        window.location.assign('/auth/complete-password-setup');
      }
    } catch {
      setState({ message: 'Hubo un error al establecer la contraseña.', success: false });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-lg bg-gray-50 p-6">
      <h1 className="font-serif text-2xl">Establecer contraseña</h1>
      <p className="text-sm text-muted-foreground">
        Debés elegir una nueva contraseña antes de continuar.
      </p>

      {state.success && (
        <p className="text-sm text-green-700">Contraseña guardada. Redirigiendo al login...</p>
      )}

      {!state.success && state.message && state.message !== 'success' && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div>
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <Input
          id="new-password"
          name="new-password"
          type="password"
          minLength={6}
          required
          disabled={state.success || isPending}
          aria-describedby="new-password-error"
        />
        <FieldErrorDisplay id="new-password-error" errors={state.errors?.newPassword} />
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          minLength={6}
          required
          disabled={state.success || isPending}
          aria-describedby="confirm-password-error"
        />
        <FieldErrorDisplay id="confirm-password-error" errors={state.errors?.confirmPassword} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending || state.success}>
        {isPending ? 'Guardando...' : 'Guardar contraseña'}
      </Button>
    </form>
  );
}
