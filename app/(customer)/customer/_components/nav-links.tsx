'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { CUSTOMER_NAV_LINKS } from '@/lib/customer-consts';

export default function CustomerNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {CUSTOMER_NAV_LINKS.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          link.href === '/customer'
            ? pathname === '/customer'
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-primary': isActive,
              }
            )}
          >
            <LinkIcon className="h-6 w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
