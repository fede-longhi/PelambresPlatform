'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { DollarSign, ArrowRight, Menu, X } from 'lucide-react';
import { HeaderUserMenu } from '@/components/layout/header-user-menu';
import type { UserRole } from '@/types/user-definitions';

const navItems = [
  { title: 'Cursos', href: '/education' },
  { title: 'Guía', href: '/print-guide' },
  { title: 'Herramientas', href: '/tools' },
  { title: 'Mi pedido', href: '/print-status' },
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
};

export default function MainHeader({ user }: MainHeaderProps) {
  const isProduction = process.env.IS_PRODUCTION === 'true';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showLoginLink = !user && !isProduction;
  const openMenuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:space-x-10 md:py-4">
          <div className="z-20 flex items-center justify-start space-x-2">
            <button
              ref={openMenuButtonRef}
              type="button"
              className="p-2 text-white transition hover:opacity-80 md:hidden"
              onClick={openMenu}
              aria-label="Abrir menú de navegación"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/pelambres_logo.svg"
                width={64}
                height={64}
                className="h-8 w-8 md:h-10 md:w-10"
                alt="Logo de Pelambres"
                priority={true}
              />
              <span className="text-2xl font-bold tracking-tight text-white">
                Pelambres
                <span className="text-orange-300">3D</span>
              </span>
            </Link>
          </div>

          <nav
            className="hidden items-center space-x-8 md:flex"
            aria-label="Navegación principal"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-medium transition hover:text-white/80"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center justify-end space-x-4 md:flex md:flex-1 lg:w-0">
            <Button
              asChild
              variant="secondary"
              className="rounded-full shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Link href="/quote-request">
                <DollarSign className="mr-2 h-5 w-5" aria-hidden="true" />
                Solicitar Presupuesto
              </Link>
            </Button>
            {user ? (
              <HeaderUserMenu user={user} />
            ) : showLoginLink ? (
              <Link
                href="/login"
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'text-white hover:bg-white/10',
                })}
              >
                Iniciar sesión
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>

          <div className="flex items-center md:hidden">
            {user ? (
              <HeaderUserMenu user={user} />
            ) : showLoginLink ? (
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Ingresar
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
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
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
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
