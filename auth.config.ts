import type { NextAuthConfig } from 'next-auth';
import { AUTHORIZED_USERS } from './app/lib/user-definitions';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    secret: process.env.SECRET,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnPrivateApp = 
                nextUrl.pathname.startsWith('/admin') ||
                nextUrl.pathname.startsWith('/customer');
            
            if (isOnPrivateApp) {
                if (!AUTHORIZED_USERS.includes(auth?.user?.email ?? "")){
                    return false;
                } else if (isLoggedIn) {
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            }
            else if (isLoggedIn) {
                return Response.redirect(new URL('/admin', nextUrl));
            }

            return true;
        },
        async signIn({ account, profile }) {
            console.log('sign in');
            return true
        },
    },
  
    providers: [],
} satisfies NextAuthConfig;