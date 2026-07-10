import { auth } from '@/auth';
import type { MainHeaderUser } from '@/components/layout/main-header';
import { getPortalPathForRole } from '@/lib/auth/public-routes';
import { fetchAlternateAccountsForUser, fetchUserById } from '@/lib/data/user-data';
import { getUserDisplayName } from '@/lib/utils';

export async function getMainHeaderUser(): Promise<MainHeaderUser | null> {
  const session = await auth();
  const sessionUser = session?.user;

  if (
    !sessionUser?.id ||
    sessionUser.isActive === false ||
    sessionUser.hasPlatformAccess === false ||
    !sessionUser.role
  ) {
    return null;
  }

  const dbUser = await fetchUserById(sessionUser.id);

  if (!dbUser) {
    return null;
  }

  const alternateAccounts = sessionUser.email
    ? await fetchAlternateAccountsForUser(sessionUser.email, sessionUser.id)
    : [];
  const alternateAccount = alternateAccounts[0];

  return {
    username: dbUser.username,
    displayName: getUserDisplayName(dbUser),
    email: dbUser.email,
    imageUrl: dbUser.image_url ?? sessionUser.image,
    role: sessionUser.role,
    portalHref: getPortalPathForRole(sessionUser.role),
    profileHref:
      sessionUser.role === 'customer' ? '/customer/profile' : '/admin/profile',
    alternateAccount: alternateAccount
      ? {
          userId: alternateAccount.id,
          role: alternateAccount.role,
        }
      : null,
  };
}
