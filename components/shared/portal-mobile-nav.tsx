'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PelambresSidenavLogo } from '@/components/shared/pelambres-sidenav-logo';
import { cn } from '@/lib/utils';

type PortalMobileNavProps = {
  logoHref: string;
  children: React.ReactNode;
};

export function PortalMobileNav({ logoHref, children }: PortalMobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-border/40 bg-primary px-3 py-2 md:hidden">
        <Link href={logoHref} className="min-w-0 flex-1 overflow-hidden">
          <PelambresSidenavLogo />
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-white hover:bg-white/10 hover:text-white"
          aria-label="Abrir menú de navegación"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {isOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw,20rem)] flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:w-full md:translate-x-0 md:shadow-none',
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full max-md:pointer-events-none md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-end border-b p-2 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar menú de navegación"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {children}
      </aside>
    </>
  );
}
