import { auth } from '@/auth';
import type { MainHeaderUser } from '@/components/layout/main-header';
import { fetchUserById } from '@/lib/data/user-data';
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

  return {
    username: dbUser.username,
    displayName: getUserDisplayName(dbUser),
    imageUrl: dbUser.image_url ?? sessionUser.image,
    profileHref:
      sessionUser.role === 'customer' ? '/customer/profile' : '/admin/profile',
  };
}
