'use client';

import { lusitana } from '@/app/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useActionState } from 'react';
import {
  authenticate,
  completeAccountSelection,
  type AuthenticateState,
} from '@/lib/actions/auth-actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROLE_SELECTION_LABELS } from '@/lib/auth/account-selection';
import type { UserRole } from '@/types/user-definitions';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const passwordWasSet = searchParams.get('passwordSet') === '1';
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
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Elegí cómo ingresar</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Tu email tiene más de un perfil. Seleccioná con cuál querés continuar.
        </p>
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
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <p className="mb-3 text-sm text-muted-foreground">
          Ingrese su email y contraseña para acceder a su cuenta.
        </p>
        {passwordWasSet && (
          <p className="mb-3 text-sm text-green-700">
            Contraseña establecida. Ingresá con tu nueva contraseña.
          </p>
        )}
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <div className="mt-2 text-right">
          <Link href="/login/forgot-password" className="text-sm text-primary hover:underline">
            Olvidé mi contraseña
          </Link>
        </div>
        <Button className="mt-4 w-full" aria-disabled={isSubmitting}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Creá tu cuenta
          </Link>
        </p>
        <div className="flex h-8 items-end space-x-1">
          {activeState?.status === 'error' && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{activeState.message}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
