'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { DollarSign, ArrowRight, Menu, X } from 'lucide-react';
import { HeaderUserMenu } from '@/components/layout/header-user-menu';
import {
  isHrefAllowedForFeatures,
  type FeatureKey,
} from '@/lib/consts/feature-flag-consts';
import type { UserRole } from '@/types/user-definitions';

const PUBLIC_NAV_ITEMS = [
  { title: 'Tienda', href: '/store' },
  { title: 'Cursos', href: '/education' },
  { title: 'Guía', href: '/print-guide' },
  { title: 'FAQ', href: '/faq' },
  { title: 'Herramientas', href: '/tools' },
  { title: 'Mi pedido', href: '/print-status' },
];

const CUSTOMER_NAV_ITEMS = [
  { title: 'Mi cuenta', href: '/customer' },
  { title: 'Mis pedidos', href: '/customer/orders' },
  { title: 'Tienda', href: '/store' },
  { title: 'Cursos', href: '/education' },
  { title: 'Herramientas', href: '/tools' },
  { title: 'FAQ', href: '/faq' },
];

export type MainHeaderUser = {
  username: string;
  displayName: string;
  email: string;
  imageUrl?: string | null;
  role: UserRole;
  portalHref: string;
  profileHref: string;
  alternateAccount?: {
    userId: string;
    role: UserRole;
  } | null;
};

type MainHeaderProps = {
  user?: MainHeaderUser | null;
  accessibleFeatures?: FeatureKey[];
};

export default function MainHeader({
  user,
  accessibleFeatures = [],
}: MainHeaderProps) {
  const isProduction = process.env.IS_PRODUCTION === 'true';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showLoginLink = !user && !isProduction;
  const openMenuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const navItems = (
    user?.role === 'customer' ? CUSTOMER_NAV_ITEMS : PUBLIC_NAV_ITEMS
  ).filter((item) => isHrefAllowedForFeatures(item.href, accessibleFeatures));

  const closeMenu = () => {
    setIsMenuOpen(false);
    openMenuButtonRef.current?.focus();
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    closeMenuButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
        return;
      }

      if (event.key !== 'Tab' || !menuPanelRef.current) {
        return;
      }

      const focusableElements = menuPanelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-yellow-500 text-white shadow-xl">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-none xl:px-4 2xl:px-6">
        <div className="flex items-center justify-between gap-3 py-3 sm:gap-4 lg:py-4">
          <div className="z-20 flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            <button
              ref={openMenuButtonRef}
              type="button"
              className="p-2 text-white transition hover:opacity-80 xl:hidden"
              onClick={openMenu}
              aria-label="Abrir menú de navegación"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <Link href="/" className="flex min-w-0 items-center gap-2">
              <Image
                src="/pelambres_logo.svg"
                width={64}
                height={64}
                className="h-8 w-8 shrink-0 md:h-10 md:w-10"
                alt="Logo de Pelambres"
                priority={true}
              />
              <span className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                Pelambres
                <span className="text-orange-300">3D</span>
              </span>
            </Link>
          </div>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-5 pl-6 xl:flex 2xl:gap-8"
            aria-label="Navegación principal"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-base font-medium transition hover:text-white/80"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <Button
              asChild
              variant="secondary"
              className="rounded-full shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Link href="/quote-request" className="inline-flex items-center">
                <DollarSign className="h-5 w-5 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline xl:hidden">Presupuesto</span>
                <span className="hidden xl:inline">Solicitar Presupuesto</span>
                <span className="sr-only sm:hidden">Solicitar Presupuesto</span>
              </Link>
            </Button>
            {user ? (
              <HeaderUserMenu user={user} />
            ) : showLoginLink ? (
              <Link
                href="/login"
                className={buttonVariants({
                  variant: 'ghost',
                  className:
                    'px-2 text-white hover:bg-white/10 sm:px-4',
                })}
              >
                <span className="sm:hidden">Ingresar</span>
                <span className="hidden sm:inline">Iniciar sesión</span>
                <ArrowRight
                  className="ml-1.5 hidden h-4 w-4 sm:inline"
                  aria-hidden="true"
                />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity xl:hidden ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      <div
        ref={menuPanelRef}
        id="mobile-navigation-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen ? true : undefined}
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out xl:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            ref={closeMenuButtonRef}
            type="button"
            className="text-gray-800 transition hover:text-primary"
            onClick={closeMenu}
            aria-label="Cerrar menú de navegación"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-col space-y-2 p-4" aria-label="Navegación móvil">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded p-3 text-lg font-medium text-gray-700 transition hover:bg-gray-100"
              onClick={closeMenu}
            >
              {item.title}
            </Link>
          ))}

          <hr className="my-4 border-gray-200" />

          <Button asChild className="mt-2 w-full">
            <Link href="/quote-request" onClick={closeMenu}>
              <DollarSign className="mr-2 h-5 w-5" aria-hidden="true" />
              Solicitar Presupuesto
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
