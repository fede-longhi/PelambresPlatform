'use client';

import {
  AtSymbolIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useActionState, useState } from 'react';
import {
  authenticate,
  completeAccountSelection,
  type AuthenticateState,
} from '@/lib/actions/auth-actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const passwordWasSet = searchParams.get('passwordSet') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [authState, formAction, isPending] = useActionState<AuthenticateState, FormData>(
    authenticate,
    undefined
  );
  const [selectionState, selectionAction, isSelecting] = useActionState<
    AuthenticateState,
    FormData
  >(completeAccountSelection, undefined);

  const activeState = selectionState ?? authState;
  const isSubmitting = isPending || isSelecting;

  if (activeState?.status === 'role_selection') {
    return (
      <AuthFormPanel>
        <AuthFormTitle>Elegí cómo ingresar</AuthFormTitle>
        <AuthFormDescription>
          Tu email tiene más de un perfil. Seleccioná con cuál querés continuar.
        </AuthFormDescription>
        <form action={selectionAction} className="space-y-3">
          <input type="hidden" name="selectionToken" value={activeState.selectionToken} />
          <input type="hidden" name="redirectTo" value={activeState.redirectTo} />
          {activeState.roles.map((account) => (
            <button
              key={account.userId}
              type="submit"
              name="userId"
              value={account.userId}
              disabled={isSubmitting}
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
        <AuthFormTitle>Iniciar sesión</AuthFormTitle>
        <AuthFormDescription>
          Ingresá tu email y contraseña para acceder a tu cuenta.
        </AuthFormDescription>

        {passwordWasSet && (
          <p className="mb-3 text-sm text-green-700">
            Contraseña establecida. Ingresá con tu nueva contraseña.
          </p>
        )}

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
              disabled={isSubmitting}
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className={authFieldLabelClassName} htmlFor="password">
              Contraseña
            </label>
            <Link href="/login/forgot-password" className="text-xs text-primary hover:underline">
              Olvidé mi contraseña
            </Link>
          </div>
          <div className="relative">
            <input
              className={authFieldInputClassName}
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              required
              minLength={6}
              disabled={isSubmitting}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button className="mt-6 w-full" aria-disabled={isSubmitting} disabled={isSubmitting}>
          Iniciar sesión <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        <AuthFormFooterText>
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Creá tu cuenta
          </Link>
        </AuthFormFooterText>

        {activeState?.status === 'error' && <AuthFormError message={activeState.message} />}
      </AuthFormPanel>
    </form>
  );
}
