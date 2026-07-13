import {
  Book,
  House,
  Layers,
  Ruler,
  type LucideIcon,
} from 'lucide-react';

export type PrintGuideNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const PRINT_GUIDE_NAV: PrintGuideNavItem[] = [
  {
    name: 'Inicio',
    href: '/print-guide',
    icon: House,
    description: 'Qué es la impresión 3D y cómo trabajamos',
  },
  {
    name: 'Guía rápida',
    href: '/print-guide/quick-guide',
    icon: Book,
    description: 'Cómo empezar, modelos, materiales y costos',
  },
  {
    name: 'Tolerancias y acabados',
    href: '/print-guide/tolerances',
    icon: Ruler,
    description: 'Precisión, ensambles y postprocesado',
  },
  {
    name: 'Archivos y laminado',
    href: '/print-guide/slicing',
    icon: Layers,
    description: 'STL, slicing y parámetros que afectan el precio',
  },
];
