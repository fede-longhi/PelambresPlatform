import { BookUser, Calculator, FileBox, FileInput, Hammer, House, LifeBuoy, Printer, Settings, Book } from 'lucide-react';

export const NAV_LINKS = [
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
        name: 'Courses',
        href: '/admin/courses',
        icon: Book,
    },
    {
        name: 'Configuration',
        href: '/admin/configuration',
        icon: Settings,
    },
];