'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {Book, ChevronRight, House, Layers, Ruler, ScrollText, SwatchBook } from 'lucide-react';

const ALL_LINKS = [
    { name: 'Inicio', href: '/print-guide', icon: House },
    { name: 'Guía Rápida', href: '/print-guide/quick-guide', icon: Book },
    { name: 'Tolerancias y Acabados', href: '/print-guide/tolerances', icon: Ruler },
    { name: 'Laminado (Slicing)', href: '/print-guide/slicing', icon: Layers },
    { name: 'Formatos de Archivo', href: '/print-guide/formats', icon: ScrollText },
    { name: 'Materiales Comunes', href: '/print-guide/materials', icon: SwatchBook },
];

const isProduction = process.env.IS_PRODUCTION === 'true'; 

export default function NavLinks() {
    const pathname = usePathname();
    const links = isProduction ? ALL_LINKS.slice(0, 2) : ALL_LINKS;
    return (
        <>
        {links.map((link) => {
            const LinkIcon = link.icon;
            return (
            <Link
                key={link.name}
                href={link.href}
                className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-primary/20 text-sm font-medium hover:bg-secondary/20 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3',
                {
                    'bg-primary/100 text-primary-foreground font-semibold': pathname === link.href,
                },
                )}
            >
                <LinkIcon className="w-6" />
                <p className="hidden md:block">{link.name}</p>
                <span className="flex-1" />
                {pathname === link.href && <ChevronRight className="w-4 h-4" />}
            </Link>
            );
        })}
        </>
    );
}
