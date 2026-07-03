import { Suspense } from 'react';
import type { Metadata } from 'next';
import PelambresLogo from '@/components/shared/home-logo';
import ForgotPasswordForm from './_components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Olvidé mi contraseña',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-primary p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <PelambresLogo />
          </div>
        </div>
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
