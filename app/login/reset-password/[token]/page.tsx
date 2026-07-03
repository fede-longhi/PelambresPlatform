import type { Metadata } from 'next';
import Link from 'next/link';
import PelambresLogo from '@/components/shared/home-logo';
import { fetchPasswordResetByRawToken } from '@/lib/data/password-reset-data';
import ResetPasswordForm from './_components/reset-password-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
};

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;
  const resetUser = await fetchPasswordResetByRawToken(token);

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-primary p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <PelambresLogo />
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          {resetUser ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold">Enlace inválido</h1>
              <p className="text-sm text-muted-foreground">
                El enlace de restablecimiento expiró o ya fue utilizado. Podés solicitar uno
                nuevo.
              </p>
              <Button asChild className="w-full">
                <Link href="/login/forgot-password">Solicitar nuevo enlace</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
