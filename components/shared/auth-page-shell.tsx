import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MainHeader from '@/components/layout/main-header';
import { PelambresAuthLogo } from '@/components/shared/pelambres-auth-logo';
import { getMainHeaderUser } from '@/lib/auth/main-header-user';

type AuthPageShellProps = {
  children: React.ReactNode;
};

export async function AuthPageShell({ children }: AuthPageShellProps) {
  const headerUser = await getMainHeaderUser();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="hidden md:block">
        <MainHeader user={headerUser} />
      </div>

      <div className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="mx-auto flex w-full max-w-[400px] px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col space-y-2.5 px-4 pb-8 pt-16 md:pt-8">
        <div className="flex w-full rounded-lg bg-primary p-3 shadow-sm md:hidden">
          <div className="w-32 text-white">
            <PelambresAuthLogo />
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
