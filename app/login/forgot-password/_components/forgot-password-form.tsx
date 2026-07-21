'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { AtSymbolIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from '@/lib/actions/password-reset-actions';
import { ROLE_SELECTION_LABELS } from '@/lib/auth/role-labels';
import type { UserRole } from '@/types/user-definitions';
import {
  AuthFormDescription,
  AuthFormError,
  AuthFormFooterText,
  AuthFormPanel,
  AuthFormTitle,
  authFieldInputClassName,
  authFieldLabelClassName,
} from '@/components/shared/auth-form-panel';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [state, formAction, isPending] = useActionState<ForgotPasswordState, FormData>(
    requestPasswordReset,
    undefined
  );

  if (state?.status === 'success') {
    return (
      <AuthFormPanel>
        <AuthFormTitle>Revisá tu correo</AuthFormTitle>
        <AuthFormDescription>{state.message}</AuthFormDescription>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </AuthFormPanel>
    );
  }

  if (state?.status === 'role_selection') {
    return (
      <AuthFormPanel>
        <AuthFormTitle>Elegí la cuenta</AuthFormTitle>
        <AuthFormDescription>
          Tu email tiene más de un perfil con contraseña. ¿Cuál querés restablecer?
        </AuthFormDescription>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="email" value={state.email} />
          {state.accounts.map((account) => (
            <button
              key={account.userId}
              type="submit"
              name="userId"
              value={account.userId}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 text-left text-sm transition hover:border-primary hover:bg-primary/5"
            >
              <span>
                <span className="block font-medium">
                  {ROLE_SELECTION_LABELS[account.role as UserRole]}
                </span>
                <span className="text-muted-foreground">{account.name}</span>
              </span>
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </form>
      </AuthFormPanel>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <AuthFormPanel>
        <AuthFormTitle>Olvidé mi contraseña</AuthFormTitle>
        <AuthFormDescription>
          Ingresá tu email y te enviaremos un enlace para restablecer la contraseña.
        </AuthFormDescription>

        <div>
          <label className={`mb-3 mt-2 block ${authFieldLabelClassName}`} htmlFor="email">
            Email
          </label>
          <div className="relative">
            <input
              className={authFieldInputClassName}
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isPending}
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>

        <Button className="mt-6 w-full" disabled={isPending}>
          {isPending ? 'Enviando...' : 'Enviar enlace'}
        </Button>

        {state?.status === 'error' && <AuthFormError message={state.message} />}

        <AuthFormFooterText>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </AuthFormFooterText>
      </AuthFormPanel>
    </form>
  );
}
