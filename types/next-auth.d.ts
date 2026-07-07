import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/types/user-definitions';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
      mustChangePassword: boolean;
      hasPlatformAccess: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    isActive: boolean;
    mustChangePassword: boolean;
    hasPlatformAccess: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    isActive: boolean;
    mustChangePassword: boolean;
    hasPlatformAccess: boolean;
  }
}
