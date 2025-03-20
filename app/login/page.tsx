import PelambresLogo from '@/app/ui/home-logo';
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';
import { Metadata } from 'next';
import SocialLogin from '@/app/ui/social-login';

export const metadata: Metadata = {
    title: 'Login',
};
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
            <div className="flex h-20 w-full items-end rounded-lg bg-primary p-3 md:h-36">
                <div className="w-32 text-white md:w-36">
                    <PelambresLogo />
                </div>
            </div>
            <Suspense>
                <LoginForm />
                <div className='flex justify-center items-center'>
                    <p className='text-center'>
                        - or -
                    </p>
                </div>
                <SocialLogin />
            </Suspense>
        </div>
    </main>
    );    
}