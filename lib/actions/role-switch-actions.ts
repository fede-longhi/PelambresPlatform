'use server';

import { auth, signIn } from '@/auth';
import { getPortalPathForRole } from '@/lib/auth/public-routes';
import { createRoleSwitchToken } from '@/lib/auth/role-switch';
import { fetchAlternateAccountsForUser } from '@/lib/data/user-data';
import { AuthError } from 'next-auth';

export async function switchRoleAccountForUser(targetUserId: string) {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.email) {
    throw new Error('No estás autenticado.');
  }

  const alternateAccounts = await fetchAlternateAccountsForUser(
    sessionUser.email,
    sessionUser.id
  );
  const targetAccount = alternateAccounts.find((account) => account.id === targetUserId);

  if (!targetAccount) {
    throw new Error('No podés cambiar a ese perfil.');
  }

  const roleSwitchToken = createRoleSwitchToken(
    sessionUser.id,
    targetAccount.id,
    sessionUser.email
  );

  try {
    await signIn('credentials', {
      userId: targetAccount.id,
      roleSwitchToken,
      redirectTo: getPortalPathForRole(targetAccount.role),
      redirect: true,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error('No se pudo cambiar de perfil.');
    }

    throw error;
  }
}
