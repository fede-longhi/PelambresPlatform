import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthPageShell } from '@/components/shared/auth-page-shell';
import ForgotPasswordForm from './_components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Olvidé mi contraseña',
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
