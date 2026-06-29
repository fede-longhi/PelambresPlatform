import type { SessionUser, UserRole } from '@/types/user-definitions';

export function hasRole(user: SessionUser | null | undefined, role: UserRole): boolean {
  return !!user && user.isActive && user.role === role;
}

export function canAccessAdmin(user: SessionUser | null | undefined): boolean {
  return hasRole(user, 'admin');
}

export function canAccessCustomer(user: SessionUser | null | undefined): boolean {
  return hasRole(user, 'customer');
}

export function toSessionUser(sessionUser: {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
}): SessionUser {
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name ?? '',
    role: sessionUser.role,
    isActive: sessionUser.isActive,
    mustChangePassword: sessionUser.mustChangePassword,
  };
}
