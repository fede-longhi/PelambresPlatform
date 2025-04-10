'use client';
import {
    HomeIcon,
    CubeIcon,
} from '@heroicons/react/24/outline';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
    { name: 'Home', href: '/admin', icon: HomeIcon },
    {
        name: 'Quotes',
        href: '/admin/quotes',
        icon: RequestQuoteIcon,
    },
    {
        name: 'Orders',
        href: '/admin/orders',
        icon: ConstructionIcon,
    },
    {
        name: 'Print Jobs',
        href: '/admin/print-jobs',
        icon: CubeIcon,
    },
    {
        name: 'Customers',
        href: '/admin/customers',
        icon: PersonIcon,
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
