'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { NAV_LINKS } from '@/lib/admin-consts';

export default function NavLinks() {
    const pathname = usePathname();
    const links = NAV_LINKS;
    
    return (
        <>
        {links.map((link) => {
            const LinkIcon = link.icon;
            return (
            <Link
                key={link.name}
                href={link.href}
                className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3',
                {
                    'bg-sky-100 text-primary': pathname === link.href,
                },
                )}
            >
                <LinkIcon className="w-6" />
                <p className="hidden md:block">{link.name}</p>
            </Link>
            );
        })}
        </>
    );
}
