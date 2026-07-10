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
    <header className="bg-gradient-to-r from-primary to-yellow-500 shadow-xl sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4 md:space-x-10">
          <div className="flex justify-start items-center space-x-2 z-20">
            <button
              ref={openMenuButtonRef}
              type="button"
              className="md:hidden p-2 text-white hover:opacity-80 transition"
              onClick={openMenu}
              aria-label="Abrir menú de navegación"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>

            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/pelambres_logo.svg"
                width={64}
                height={64}
                className="w-8 h-8 md:w-10 md:h-10"
                alt="Logo de Pelambres"
                priority={true}
              />
              <span className="text-2xl font-bold text-white tracking-tight">
                Pelambres
                <span className="text-orange-300">3D</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8 items-center" aria-label="Navegación principal">
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

          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            <Button
              asChild
              variant="secondary"
              className="rounded-full shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Link href="/quote-request">
                <DollarSign className="w-5 h-5 mr-2" aria-hidden="true" />
                Solicitar Presupuesto
              </Link>
            </Button>
            {user ? (
              <HeaderUserMenu user={user} />
            ) : showLoginLink ? (
              <Link
                href="/login"
                className={buttonVariants({ variant: 'ghost', className: 'text-white hover:bg-white/10' })}
              >
                Iniciar sesión
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-end">
          <button
            ref={closeMenuButtonRef}
            type="button"
            className="text-gray-800 hover:text-primary transition"
            onClick={closeMenu}
            aria-label="Cerrar menú de navegación"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2" aria-label="Navegación móvil">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded transition"
              onClick={closeMenu}
            >
              {item.title}
            </Link>
          ))}

          <hr className="my-4 border-gray-200" />

          <Button asChild className="w-full mt-2">
            <Link href="/quote-request" onClick={closeMenu}>
              <DollarSign className="w-5 h-5 mr-2" aria-hidden="true" />
              Solicitar Presupuesto
            </Link>
          </Button>

          {user ? (
            <div className="mt-2">
              <HeaderUserMenu user={user} variant="drawer" />
            </div>
          ) : showLoginLink ? (
            <Button asChild variant="ghost" className="w-full mt-2 text-gray-700 hover:bg-gray-100">
              <Link href="/login" onClick={closeMenu}>
                Iniciar sesión
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
