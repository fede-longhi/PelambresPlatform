import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

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

                if (auth.user.isActive === false) {
                    return false;
                }

                if (auth.user.mustChangePassword && !isSetPasswordRoute) {
                    return Response.redirect(new URL('/set-password', request.nextUrl));
                }

                if (isOnAdmin && auth.user.role !== 'admin') {
                    return false;
                }

                if (isOnCustomer && auth.user.role !== 'customer') {
                    return false;
                }

                return true;
            }

            if (
                isLoggedIn &&
                auth.user.role === 'admin' &&
                auth.user.isActive !== false &&
                !auth.user.mustChangePassword
            ) {
                return Response.redirect(new URL('/admin', request.nextUrl));
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
            }

            return token;
        },
        async session({ session, token }) {
            const { id, role, isActive, mustChangePassword } = token as JWT;

            if (session.user) {
                session.user.id = id;
                session.user.role = role;
                session.user.isActive = isActive;
                session.user.mustChangePassword = mustChangePassword;
            }

            return session;
        },
    },

    providers: [],
} satisfies NextAuthConfig;
