'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRINT_GUIDE_NAV } from '@/lib/consts/print-guide-consts';
import { cn } from '@/lib/utils';

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones de la guía" className="w-full">
      <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
        {PRINT_GUIDE_NAV.map((link) => {
          const LinkIcon = link.icon;
          const isActive =
            link.href === '/print-guide'
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href} className="shrink-0 md:w-full">
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-gray-700 ring-1 ring-border hover:bg-primary/5 hover:text-primary md:bg-transparent md:ring-0'
                )}
              >
                <LinkIcon className="size-4 shrink-0" aria-hidden="true" />
                <span>{link.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
