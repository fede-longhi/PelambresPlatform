'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ADMIN_NAV_SECTIONS } from '@/lib/admin-consts';
import type { AdminNavBadgeCounts } from '@/lib/data/admin-dashboard-data';

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks({
  badges,
}: {
  badges?: Partial<AdminNavBadgeCounts>;
}) {
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
            const badgeCount = badges?.[link.href as keyof AdminNavBadgeCounts] ?? 0;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'flex h-12 w-full items-center gap-2 rounded-md bg-muted/60 p-3 text-sm font-medium hover:bg-primary/10 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3',
                  {
                    'bg-primary/10 text-primary': isActive,
                  }
                )}
              >
                <LinkIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{link.name}</span>
                {badgeCount > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary-foreground">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
