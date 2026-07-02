'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { lusitana } from '@/app/fonts';
import { AtSymbolIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from '@/lib/actions/password-reset-actions';
import { ROLE_SELECTION_LABELS } from '@/lib/auth/account-selection';
import type { UserRole } from '@/types/user-definitions';

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ForgotPasswordState, FormData>(
    requestPasswordReset,
    undefined
  );

  if (state?.status === 'success') {
    return (
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Revisá tu correo</h1>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </div>
    );
  }

  if (state?.status === 'role_selection') {
    return (
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Elegí la cuenta</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Tu email tiene más de un perfil con contraseña. ¿Cuál querés restablecer?
        </p>
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
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
      <h1 className={`${lusitana.className} mb-3 text-2xl`}>Olvidé mi contraseña</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Ingresá tu email y te enviaremos un enlace para restablecer la contraseña.
      </p>

      <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="email">
        Email
      </label>
      <div className="relative">
        <input
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          id="email"
          type="email"
          name="email"
          placeholder="usuario@ejemplo.com"
          required
        />
        <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      <Button className="mt-6 w-full" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar enlace'}
      </Button>

      {state?.status === 'error' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
          <ExclamationCircleIcon className="h-5 w-5" />
          <p>{state.message}</p>
        </div>
      )}

      <Button asChild variant="link" className="mt-4 w-full">
        <Link href="/login">Volver al inicio de sesión</Link>
      </Button>
    </form>
  );
}
