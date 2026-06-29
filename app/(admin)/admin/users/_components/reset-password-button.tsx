'use client';

import { useState, useTransition } from 'react';
import { adminResetPassword } from '@/lib/actions/user-actions';
import { Button } from '@/components/ui/button';
import TempPasswordDisplay from './temp-password-display';

export default function ResetPasswordButton({ userId }: { userId: string }) {
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    setErrorMessage(null);
    setTempPassword(null);

    startTransition(async () => {
      const result = await adminResetPassword(userId);

      if (result.success && result.tempPassword) {
        setTempPassword(result.tempPassword);
        return;
      }

      setErrorMessage(result.message ?? 'No se pudo restablecer la contraseña.');
    });
  };

  return (
    <div className="mt-6 rounded-md border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-medium">Restablecer contraseña</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Genera una contraseña temporal. El usuario deberá cambiarla al ingresar.
      </p>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
      )}

      {tempPassword && <TempPasswordDisplay tempPassword={tempPassword} />}

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={isPending}
        onClick={handleReset}
      >
        {isPending ? 'Generando...' : 'Generar contraseña temporal'}
      </Button>
    </div>
  );
}
