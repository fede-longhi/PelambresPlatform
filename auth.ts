import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import GoogleProvider from 'next-auth/providers/google';
import {
  fetchActiveUsersByEmail,
  fetchUserById,
} from '@/lib/data/user-data';
import { verifyAccountSelectionToken } from '@/lib/auth/account-selection';
import { verifyRoleSwitchToken } from '@/lib/auth/role-switch';
import {
  ensureCustomerAccountForOAuth,
  syncOAuthUserImage,
} from '@/lib/actions/oauth-customer-actions';
import { verifyPassword } from '@/lib/utils/password';
import type { User, UserListItem } from '@/types/user-definitions';

function toAuthUser(user: User | UserListItem) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image_url,
    role: user.role,
    isActive: user.is_active,
    mustChangePassword: user.must_change_password,
  };
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        await ensureCustomerAccountForOAuth({
          email: user.email,
          name: user.name ?? user.email,
          imageUrl: user.image,
        });

        const activeUsers = await fetchActiveUsersByEmail(user.email);

        if (activeUsers.length === 0) {
          return false;
        }

        if (activeUsers.length === 1) {
          const dbUser = activeUsers[0];
          await syncOAuthUserImage(dbUser.id, user.image);
          user.id = dbUser.id;
          user.name = dbUser.name;
          user.role = dbUser.role;
          user.isActive = dbUser.is_active;
          user.mustChangePassword = dbUser.must_change_password;
          user.image = dbUser.image_url ?? user.image;
          return true;
        }

        const { createAccountSelectionToken } = await import('@/lib/auth/account-selection');
        const selectionToken = createAccountSelectionToken(
          user.email,
          activeUsers.map((activeUser) => activeUser.id)
        );

        return `/login/select-role?token=${encodeURIComponent(selectionToken)}`;
      }

      return true;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
        userId: { label: 'User ID', type: 'text' },
        selectionToken: { label: 'Selection Token', type: 'text' },
        roleSwitchToken: { label: 'Role Switch Token', type: 'text' },
        redirectTo: { label: 'Redirect To', type: 'text' },
      },
      async authorize(credentials) {
        const selectionToken = credentials?.selectionToken;
        const roleSwitchToken = credentials?.roleSwitchToken;
        const selectedUserId = credentials?.userId;

        if (typeof roleSwitchToken === 'string' && typeof selectedUserId === 'string') {
          const payload = verifyRoleSwitchToken(roleSwitchToken, selectedUserId);

          if (!payload) {
            return null;
          }

          const user = await fetchUserById(selectedUserId);

          if (
            !user ||
            !user.is_active ||
            user.email.trim().toLowerCase() !== payload.email ||
            user.id !== payload.targetUserId
          ) {
            return null;
          }

          return toAuthUser(user);
        }

        if (typeof selectionToken === 'string' && typeof selectedUserId === 'string') {
          const payload = verifyAccountSelectionToken(selectionToken);

          if (!payload || !payload.userIds.includes(selectedUserId)) {
            return null;
          }

          const user = await fetchUserById(selectedUserId);

          if (!user || !user.is_active) {
            return null;
          }

          return toAuthUser(user);
        }

        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(['admin', 'customer']).optional(),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password, role } = parsedCredentials.data;
        const activeUsers = await fetchActiveUsersByEmail(email);
        const candidates = role
          ? activeUsers.filter((activeUser) => activeUser.role === role)
          : activeUsers;

        for (const candidate of candidates) {
          if (!candidate.password) {
            continue;
          }

          const passwordsMatch = await verifyPassword(password, candidate.password);

          if (passwordsMatch) {
            return toAuthUser(candidate);
          }
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        prompt: 'consent',
        access_type: 'offline',
        response_type: 'code',
      },
    }),
  ],
});
