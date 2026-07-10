import {
  Book,
  BookUser,
  Calculator,
  FileBox,
  FileInput,
  Hammer,
  House,
  LifeBuoy,
  Printer,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AdminNavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type AdminNavSection = {
  label?: string;
  links: AdminNavLink[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    links: [{ name: 'Inicio', href: '/admin', icon: House }],
  },
  {
    label: 'Operación',
    links: [
      { name: 'Solicitudes', href: '/admin/quote-requests', icon: FileInput },
      { name: 'Pedidos', href: '/admin/orders', icon: FileBox },
      { name: 'Trabajos', href: '/admin/print-jobs', icon: Hammer },
      { name: 'Clientes', href: '/admin/customers', icon: BookUser },
    ],
  },
  {
    label: 'Educación',
    links: [{ name: 'Cursos', href: '/admin/courses', icon: Book }],
  },
  {
    label: 'Taller',
    links: [
      { name: 'Impresoras', href: '/admin/printers', icon: Printer },
      { name: 'Filamentos', href: '/admin/filaments', icon: LifeBuoy },
      { name: 'Cotizador', href: '/admin/quote-calculator', icon: Calculator },
    ],
  },
  {
    label: 'Sistema',
    links: [
      { name: 'Usuarios', href: '/admin/users', icon: Users },
      { name: 'Configuración', href: '/admin/configuration', icon: Settings },
    ],
  },
];

/** @deprecated Prefer ADMIN_NAV_SECTIONS */
export const NAV_LINKS = ADMIN_NAV_SECTIONS.flatMap((section) => section.links);
