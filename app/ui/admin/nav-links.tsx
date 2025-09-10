'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { BookUser, Calculator, FileBox, FileInput, Hammer, House, LifeBuoy, Printer, Settings } from 'lucide-react';

const links = [
    { 
        name: 'Home',
        href: '/admin',
        icon: House
    },
    {
        name: 'Quote Requests',
        href: '/admin/quote-requests',
        icon: FileInput,
    },
    {
        name: 'Orders',
        href: '/admin/orders',
        icon: FileBox,
    },
    {
        name: 'Print Jobs',
        href: '/admin/print-jobs',
        icon: Hammer,
    },
    {
        name: 'Customers',
        href: '/admin/customers',
        icon: BookUser,
    },
    {
        name: 'Printers',
        href: '/admin/printers',
        icon: Printer,
    },
    {
        name: 'Filaments',
        href: '/admin/filaments',
        icon: LifeBuoy,
    },
    {
        name: 'Cotizador',
        href: '/admin/quote-calculator',
        icon: Calculator,
    },
    {
        name: 'Configuration',
        href: '/admin/configuration',
        icon: Settings,
    },
];

export default function NavLinks() {
    const pathname = usePathname();
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
