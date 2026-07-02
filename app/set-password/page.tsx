import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PelambresLogo from '@/components/shared/home-logo';
import SetPasswordForm from '@/app/set-password/_components/set-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Establecer contraseña',
};

export default async function SetPasswordPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.mustChangePassword) {
    redirect(session.user.role === 'customer' ? '/customer' : '/admin');
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-primary p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <PelambresLogo />
          </div>
        </div>
        <SetPasswordForm />
      </div>
    </main>
  );
}
