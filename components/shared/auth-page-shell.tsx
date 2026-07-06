import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PelambresLogo from '@/components/shared/home-logo';

type AuthPageShellProps = {
  children: React.ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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

      <main className="flex min-h-screen items-center justify-center px-4 pb-8 pt-16 md:pt-20">
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5">
          <div className="flex w-full rounded-lg bg-primary p-3">
            <div className="w-32 text-white md:w-36">
              <PelambresLogo />
            </div>
          </div>

          {children}
        </div>
      </main>
    </>
  );
}
