import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import {
  getPortalPathForRole,
  shouldRedirectLoggedInUserFromAuthEntry,
} from '@/lib/auth/public-routes';
import { fetchUserById, fetchUserCanAccessPlatformById } from '@/lib/data/user-data';
import type { UserRole } from '@/types/user-definitions';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    secret: process.env.SECRET,
    callbacks: {
        authorized({ auth, request }) {
            // Server actions POST to page URLs; middleware must not redirect those requests.
            if (request.headers.get('Next-Action')) {
                return true;
            }

            const isLoggedIn = !!auth?.user;
            const pathname = request.nextUrl.pathname;
            const isOnAdmin = pathname.startsWith('/admin');
            const isOnCustomer = pathname.startsWith('/customer');
            const isOnPrivateApp = isOnAdmin || isOnCustomer;
            const isSetPasswordRoute = pathname.startsWith('/set-password');

            if (isOnPrivateApp) {
                if (!isLoggedIn) {
                    return false;
                }

                if (!auth.user.role) {
                    return false;
                }

                if (auth.user.isActive === false) {
                    return false;
                }

                if (auth.user.hasPlatformAccess === false) {
                    return false;
                }

                if (auth.user.mustChangePassword && !isSetPasswordRoute) {
                    return Response.redirect(new URL('/set-password', request.nextUrl));
                }

                if (isOnAdmin && auth.user.role !== 'admin') {
                    if (auth.user.role === 'customer') {
                        return Response.redirect(new URL('/customer', request.nextUrl));
                    }
                    return false;
                }

                if (isOnCustomer && auth.user.role !== 'customer') {
                    if (auth.user.role === 'admin') {
                        return Response.redirect(new URL('/admin', request.nextUrl));
                    }
                    return false;
                }

                return true;
            }

            if (
                isLoggedIn &&
                auth.user.isActive !== false &&
                auth.user.hasPlatformAccess !== false &&
                !auth.user.mustChangePassword
            ) {
                if (shouldRedirectLoggedInUserFromAuthEntry(pathname)) {
                    const role = auth.user.role as UserRole | undefined;

                    if (!role) {
                        return true;
                    }

                    return Response.redirect(
                        new URL(getPortalPathForRole(role), request.nextUrl)
                    );
                }
            }

            return true;
        },
        async signIn({ account }) {
            if (account?.provider === 'google') {
                return true;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id!;
                token.role = user.role;
                token.isActive = user.isActive;
                token.mustChangePassword = user.mustChangePassword;
                token.hasPlatformAccess = user.hasPlatformAccess;
            } else if (token.id) {
                if (!token.role) {
                    const dbUser = await fetchUserById(String(token.id));

                    if (dbUser) {
                        token.role = dbUser.role;
                        token.isActive = dbUser.is_active;
                        token.mustChangePassword = dbUser.must_change_password;
                    }
                }

                if (token.hasPlatformAccess === undefined) {
                    token.hasPlatformAccess = await fetchUserCanAccessPlatformById(String(token.id));
                }
            }

            return token;
        },
        async session({ session, token }) {
            const { id, role, isActive, mustChangePassword, hasPlatformAccess } = token as JWT;

            if (session.user) {
                session.user.id = id;
                session.user.role = role;
                session.user.isActive = isActive;
                session.user.mustChangePassword = mustChangePassword;
                session.user.hasPlatformAccess = hasPlatformAccess;
            }

            return session;
        },
    },

    providers: [],
} satisfies NextAuthConfig;
