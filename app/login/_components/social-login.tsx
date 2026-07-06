'use client';

import { useActionState } from 'react';
import { doSocialLogin } from '@/lib/actions/auth-actions';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import GoogleIcon from '@mui/icons-material/Google';
import { useSearchParams } from 'next/navigation';

function resolveGoogleRedirectTo(callbackUrl: string | null): string {
  if (callbackUrl && callbackUrl.startsWith('/')) {
    return callbackUrl;
  }

  return '/customer';
}

export default function SocialLogin() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const redirectTo = resolveGoogleRedirectTo(callbackUrl);
  const [errorMessage, formAction, isPending] = useActionState(doSocialLogin, undefined);

  return (
    <div className="w-full space-y-2">
      <form action={formAction} className="flex flex-col items-center justify-center">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button
          className="flex w-full items-center justify-center rounded-md bg-blue-500 p-2 text-white"
          type="submit"
          name="action"
          value="google"
          aria-disabled={isPending}
        >
          <GoogleIcon className="mr-2" />
          Ingresar con Google
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Pedidos, cursos y tu perfil de cliente.
        </p>
        <div className="flex h-8 items-end space-x-1">
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
