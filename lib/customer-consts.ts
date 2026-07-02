import { House, Package, User, GraduationCap } from 'lucide-react';

export const CUSTOMER_NAV_LINKS = [
  {
    name: 'Inicio',
    href: '/customer',
    icon: House,
  },
  {
    name: 'Mis pedidos',
    href: '/customer/orders',
    icon: Package,
  },
  {
    name: 'Mis cursos',
    href: '/customer/courses',
    icon: GraduationCap,
  },
  {
    name: 'Mi perfil',
    href: '/customer/profile',
    icon: User,
  },
];
