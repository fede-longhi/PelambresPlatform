'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { AtSymbolIcon, KeyIcon, UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Button } from '@/components/ui/button';
import { registerCustomer, type RegisterFormState } from '@/lib/actions/register-actions';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { resolveSafeRedirectPath } from '@/lib/auth/safe-redirect';

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = resolveSafeRedirectPath(searchParams.get('callbackUrl'));
  const loginHref =
    redirectTo === '/customer'
      ? '/login'
      : `/login?callbackUrl=${encodeURIComponent(redirectTo)}`;

  const initialState: RegisterFormState = { message: null, success: false };
  const [state, formAction, isPending] = useActionState(registerCustomer, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-1 text-2xl`}>Crear cuenta</h1>
        <p className="mb-3 text-sm text-muted-foreground">
          Registrate como cliente para ver pedidos, cursos y tu perfil.
        </p>

        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-3 mt-2 block text-xs font-medium text-gray-900" htmlFor="firstName">
                Nombre
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="Tu nombre"
                  required
                  disabled={isPending}
                />
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
              <FieldErrorDisplay id="first-name-error" errors={state.errors?.firstName} />
            </div>

            <div>
              <label className="mb-3 mt-2 block text-xs font-medium text-gray-900" htmlFor="lastName">
                Apellido
              </label>
              <input
                className="block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Tu apellido"
                disabled={isPending}
              />
              <FieldErrorDisplay id="last-name-error" errors={state.errors?.lastName} />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="tu@email.com"
                required
                disabled={isPending}
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <FieldErrorDisplay id="email-error" errors={state.errors?.email} />
          </div>

          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                disabled={isPending}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <FieldErrorDisplay id="password-error" errors={state.errors?.password} />
          </div>

          <div>
            <label
              className="mb-3 block text-xs font-medium text-gray-900"
              htmlFor="confirm-password"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="Repetí tu contraseña"
                required
                minLength={6}
                disabled={isPending}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <FieldErrorDisplay id="confirm-password-error" errors={state.errors?.confirmPassword} />
          </div>
        </div>

        <Button className="mt-4 w-full" disabled={isPending}>
          {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            Iniciá sesión
          </Link>
        </div>

        <div className="flex h-8 items-center space-x-1 mt-4">
          {state.success === false && state.message && (
            <>
              <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
              <p className="text-sm text-red-500">{state.message}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
