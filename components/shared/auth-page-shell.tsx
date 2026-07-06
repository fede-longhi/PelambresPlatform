import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PelambresLogo from '@/components/shared/home-logo';

type AuthPageShellProps = {
  children: React.ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="flex w-full rounded-lg bg-primary p-3">
          <div className="w-32 text-white md:w-36">
            <PelambresLogo />
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
