import type { NextAuthConfig } from 'next-auth';
// import { getUser, createUser } from '@/app/lib/user-actions';
 
export const authConfig = {
    pages: {
        signIn: '/login',
    },
    secret: process.env.SECRET,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            console.log('authorized');
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async signIn({ account, profile }) {
            console.log('sign in');
            // if (account?.provider === "google") {
            //     if (profile == null) {
            //         return false
            //     }
            //     if (profile?.email && profile?.name) {
            //         console.log(profile)
            //         const user = await getUser(profile.email)
            //         if (!user) {
            //             await createUser({id: "", name: profile.name, email: profile.email, password: "", image_url: profile.picture})
            //         }
            //     }
            //     return true
            //     // return profile?.email_verified && profile?.email?.endsWith("@example.com")
            // }
            return true
        },
    },
  
    providers: [],
} satisfies NextAuthConfig;