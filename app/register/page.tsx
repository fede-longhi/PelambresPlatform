import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthPageShell } from '@/components/shared/auth-page-shell';
import RegisterForm from './_components/register-form';
import SocialLogin from '@/app/login/_components/social-login';

export const metadata: Metadata = {
  title: 'Crear cuenta',
};

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <RegisterForm />
        <div className="flex items-center justify-center">
          <p className="text-center text-sm text-muted-foreground">o</p>
        </div>
        <SocialLogin />
      </Suspense>
    </AuthPageShell>
  );
}
