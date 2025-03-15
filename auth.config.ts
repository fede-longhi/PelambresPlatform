import type { NextAuthConfig } from 'next-auth';
// import { getUser, createUser } from '@/app/lib/user-actions';
 
export const authConfig = {
    pages: {
        signIn: '/login',
    },
    secret: process.env.SECRET,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnPrivateApp = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/customer');
            if (isOnPrivateApp) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } 
            // TODO: commented the following line beacuse it was redirecting the public images urls
            // else if (isLoggedIn) {
            //     return Response.redirect(new URL('/admin', nextUrl));
            // }

            return true;
        },
        async signIn({ account, profile }) {
            console.log('sign in');
            return true
        },
    },
  
    providers: [],
} satisfies NextAuthConfig;