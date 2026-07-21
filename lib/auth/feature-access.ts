import { auth } from '@/auth';
import { canAccessAdmin } from '@/lib/auth/permissions';
import {
  canAccessFeature,
  fetchAccessibleFeatureKeys,
} from '@/lib/data/feature-flag-data';
import type { FeatureKey } from '@/lib/consts/feature-flag-consts';

export async function getSessionFeatureContext() {
  const session = await auth();
  const sessionUser = session?.user;
  const isAdmin = canAccessAdmin(
    sessionUser?.id && sessionUser.role
      ? {
          id: sessionUser.id,
          email: sessionUser.email ?? '',
          name: sessionUser.name ?? '',
          role: sessionUser.role,
          isActive: sessionUser.isActive ?? false,
          mustChangePassword: sessionUser.mustChangePassword ?? false,
        }
      : null
  );

  return {
    userId: sessionUser?.id ?? null,
    isAdmin,
  };
}

export async function getAccessibleFeatureKeysForSession(): Promise<
  FeatureKey[]
> {
  const { userId, isAdmin } = await getSessionFeatureContext();
  return fetchAccessibleFeatureKeys({ userId, isAdmin });
}

export async function sessionCanAccessFeature(
  featureKey: FeatureKey
): Promise<boolean> {
  const { userId, isAdmin } = await getSessionFeatureContext();
  return canAccessFeature(featureKey, { userId, isAdmin });
}
