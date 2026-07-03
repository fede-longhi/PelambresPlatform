'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import {
  resetPasswordWithToken,
  type ResetPasswordFormState,
} from '@/lib/actions/password-reset-actions';

export default function ResetPasswordForm({ token }: { token: string }) {
  const resetPassword = resetPasswordWithToken.bind(null, token);
  const initialState: ResetPasswordFormState = { message: null, success: false };
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  if (state.success) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Contraseña actualizada</h1>
        <p className="text-sm text-muted-foreground">
          Ya podés iniciar sesión con tu nueva contraseña.
        </p>
        <Button asChild className="w-full">
          <Link href="/login?passwordSet=1">Ir al inicio de sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Elegí una contraseña nueva para tu cuenta.
        </p>
      </div>

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
          aria-describedby="confirm-password-error"
        />
        <FieldErrorDisplay id="confirm-password-error" errors={state.errors?.confirmPassword} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Restablecer contraseña'}
      </Button>
    </form>
  );
}
