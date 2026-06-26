'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    console.log(prevState)
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
}

export async function doSocialLogin(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const action = formData.get('action') as string;
        await signIn(action, {redirectTo: "/admin"})
        console.log(action);
    } catch (error) {
        console.error(error);
        if (error instanceof AuthError) {
            switch (error.type) {
              case 'CredentialsSignin':
                return 'Invalid credentials.';
              default:
                return 'Something went wrong.';
            }
        }
        throw error;
    }
}
