import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import GoogleProvider from 'next-auth/providers/google';
import { fetchUserByEmail } from '@/lib/data/user-data';
import { verifyPassword } from '@/lib/utils/password';

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
        const dbUser = await fetchUserByEmail(user.email);
        if (!dbUser || !dbUser.is_active) {
          return false;
        }

        user.id = dbUser.id;
        user.name = dbUser.name;
        user.role = dbUser.role;
        user.isActive = dbUser.is_active;
        user.mustChangePassword = dbUser.must_change_password;
        user.image = dbUser.image_url ?? user.image;
      }

      return true;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;
        const user = await fetchUserByEmail(email);

        if (!user || !user.is_active) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const passwordsMatch = await verifyPassword(password, user.password);
        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image_url,
          role: user.role,
          isActive: user.is_active,
          mustChangePassword: user.must_change_password,
        };
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
