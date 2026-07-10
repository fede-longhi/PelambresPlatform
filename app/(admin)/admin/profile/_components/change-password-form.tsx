'use client';

import { changeOwnPassword, type PasswordFormState } from '@/lib/actions/user-actions';
import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { useToast } from '@/hooks/use-toast';

export default function ChangePasswordForm({
  hasExistingPassword,
  onSuccess,
}: {
  hasExistingPassword: boolean;
  onSuccess?: () => void;
}) {
  const initialState: PasswordFormState = { message: null, success: false };
  const [state, formAction, isPending] = useActionState(changeOwnPassword, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: hasExistingPassword ? 'Contraseña actualizada' : 'Contraseña establecida',
        description: 'Tu contraseña se guardó correctamente.',
        variant: 'success',
      });
      onSuccess?.();
    }
  }, [state.message, toast, hasExistingPassword, onSuccess]);

  return (
    <form action={formAction} className="space-y-4 rounded-md border bg-gray-50 p-6">
      <h2 className="text-lg font-medium">
        {hasExistingPassword ? 'Cambiar contraseña' : 'Establecer contraseña'}
      </h2>

      {!hasExistingPassword && (
        <p className="text-sm text-muted-foreground">
          Tu cuenta usa inicio de sesión con Google. Podés agregar una contraseña para ingresar también con email.
        </p>
      )}

      {!state.success && state.message && state.message !== 'success' && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      {hasExistingPassword && (
        <div>
          <Label htmlFor="current-password">Contraseña actual</Label>
          <Input
            id="current-password"
            name="current-password"
            type="password"
            required
            aria-describedby="current-password-error"
          />
          <FieldErrorDisplay id="current-password-error" errors={state.errors?.currentPassword} />
        </div>
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

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : hasExistingPassword ? 'Actualizar contraseña' : 'Establecer contraseña'}
      </Button>
    </form>
  );
}
