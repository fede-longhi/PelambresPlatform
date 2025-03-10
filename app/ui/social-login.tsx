'use client';

import { useActionState } from 'react';
import { doSocialLogin } from '@/app/lib/actions';
// import { useSearchParams } from 'next/navigation';
import {
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import GoogleIcon from '@mui/icons-material/Google';

export default function SocialLogin() {
  // const searchParams = useSearchParams();
  // const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(
    doSocialLogin,
    undefined,
  );

  return (
    <form action={formAction} className="flex justify-center items-center">
        <button className="bg-blue-500 text-white p-2 rounded-md m-1" type="submit" name="action" value="google" aria-disabled={isPending}>
            <GoogleIcon className="mr-2"/>Sign in with google
        </button>
        <div className="flex h-8 items-end space-x-1">
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
    </form>
  );
}



