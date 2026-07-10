'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ADMIN_NAV_SECTIONS } from '@/lib/admin-consts';

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {ADMIN_NAV_SECTIONS.map((section, sectionIndex) => (
        <div key={section.label ?? `section-${sectionIndex}`} className="space-y-2">
          {section.label ? (
            <p className="hidden px-3 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:block">
              {section.label}
            </p>
          ) : null}

          {section.links.map((link) => {
            const LinkIcon = link.icon;
            const isActive = isNavLinkActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex h-[48px] w-full items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3',
                  {
                    'bg-sky-100 text-primary': isActive,
                  }
                )}
              >
                <LinkIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
