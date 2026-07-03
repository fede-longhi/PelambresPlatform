'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { fetchActiveUsersByEmail, fetchUserById } from '@/lib/data/user-data';
import { createAccountSelectionToken } from '@/lib/auth/account-selection';
import { getPortalPathForRole } from '@/lib/auth/public-routes';
import { verifyPassword } from '@/lib/utils/password';
import type { UserRole } from '@/types/user-definitions';

export type AuthenticateState =
  | {
      status: 'error';
      message: string;
    }
  | {
      status: 'role_selection';
      selectionToken: string;
      roles: Array<{ role: UserRole; name: string; userId: string }>;
      redirectTo: string;
    }
  | undefined;

function resolveRedirectTo(formData: FormData, role?: UserRole): string {
  const redirectTo = String(formData.get('redirectTo') ?? '').trim();

  if (redirectTo && redirectTo.startsWith('/')) {
    return redirectTo;
  }

  return role ? getPortalPathForRole(role) : '/admin';
}

export async function authenticate(
  _prevState: AuthenticateState,
  formData: FormData
): Promise<AuthenticateState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? '').trim() as UserRole | '';
  const redirectTo = resolveRedirectTo(formData, role || undefined);

  try {
    const activeUsers = await fetchActiveUsersByEmail(email);
    const passwordMatches = [];

    for (const activeUser of activeUsers) {
      if (!activeUser.password) {
        continue;
      }

      const passwordsMatch = await verifyPassword(password, activeUser.password);

      if (passwordsMatch) {
        passwordMatches.push(activeUser);
      }
    }

    if (passwordMatches.length === 0) {
      return { status: 'error', message: 'Credenciales inválidas.' };
    }

    if (passwordMatches.length > 1 && !role) {
      return {
        status: 'role_selection',
        selectionToken: createAccountSelectionToken(
          email,
          passwordMatches.map((matchedUser) => matchedUser.id)
        ),
        roles: passwordMatches.map((matchedUser) => ({
          role: matchedUser.role,
          name: matchedUser.name,
          userId: matchedUser.id,
        })),
        redirectTo,
      };
    }

    const selectedUser = role
      ? passwordMatches.find((matchedUser) => matchedUser.role === role)
      : passwordMatches[0];

    if (!selectedUser) {
      return { status: 'error', message: 'Credenciales inválidas.' };
    }

    await signIn('credentials', {
      email,
      password,
      role: selectedUser.role,
      redirectTo: resolveRedirectTo(formData, selectedUser.role),
      redirect: true,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { status: 'error', message: 'Credenciales inválidas.' };
        default:
          return { status: 'error', message: 'Ocurrió un error al iniciar sesión.' };
      }
    }

    throw error;
  }

  return undefined;
}

export async function completeAccountSelection(
  _prevState: AuthenticateState,
  formData: FormData
): Promise<AuthenticateState> {
  const userId = String(formData.get('userId') ?? '');
  const selectionToken = String(formData.get('selectionToken') ?? '');

  const selectedUser = await fetchUserById(userId);

  if (!selectedUser) {
    return { status: 'error', message: 'No se pudo completar el inicio de sesión.' };
  }

  const redirectTo = resolveRedirectTo(formData, selectedUser.role);

  try {
    await signIn('credentials', {
      userId,
      selectionToken,
      redirectTo,
      redirect: true,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: 'error', message: 'No se pudo completar el inicio de sesión.' };
    }

    throw error;
  }

  return undefined;
}

export async function doSocialLogin(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    const action = formData.get('action') as string;
    const redirectTo = String(formData.get('redirectTo') ?? '/customer');
    await signIn(action, { redirectTo });
  } catch (error) {
    console.error(error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas.';
        default:
          return 'Ocurrió un error al iniciar sesión.';
      }
    }
    throw error;
  }
}
