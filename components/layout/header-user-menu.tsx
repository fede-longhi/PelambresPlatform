'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Store,
} from 'lucide-react';
import { ROLE_SELECTION_LABELS } from '@/lib/auth/account-selection';
import { signOutUser } from '@/lib/actions/auth-actions';
import { switchRoleAccountForUser } from '@/lib/actions/role-switch-actions';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { MainHeaderUser } from '@/components/layout/main-header';
import type { UserRole } from '@/types/user-definitions';

type HeaderUserMenuProps = {
  user: MainHeaderUser;
  variant?: 'header' | 'drawer';
};

function isPublicSurface(pathname: string): boolean {
  return !pathname.startsWith('/customer') && !pathname.startsWith('/admin');
}

function isCustomerSurface(pathname: string): boolean {
  return pathname.startsWith('/customer');
}

function portalLabel(role: UserRole): string {
  return role === 'customer' ? 'Ir a mi portal' : 'Ir al panel de admin';
}

export function HeaderUserMenu({ user, variant = 'header' }: HeaderUserMenuProps) {
  const pathname = usePathname();
  const onPublicSurface = isPublicSurface(pathname);
  const onCustomerSurface = isCustomerSurface(pathname);
  const switchAction = user.alternateAccount
    ? switchRoleAccountForUser.bind(null, user.alternateAccount.userId)
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2 rounded-full px-2 py-1.5 pr-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70',
          variant === 'header'
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'w-full bg-gray-50 text-gray-900 hover:bg-gray-100'
        )}
        aria-label="Abrir menú de cuenta"
      >
        <UserAvatar
          imageUrl={user.imageUrl}
          displayName={user.displayName}
          size="sm"
          fallbackClassName={
            variant === 'drawer' ? 'bg-primary/10 text-primary' : undefined
          }
        />
        <span className="max-w-[140px] truncate text-sm font-medium">{user.username}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">{user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {onPublicSurface ? (
          <DropdownMenuItem asChild>
            <Link href={user.portalHref}>
              <LayoutDashboard aria-hidden="true" />
              {portalLabel(user.role)}
            </Link>
          </DropdownMenuItem>
        ) : null}

        {onCustomerSurface ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/customer/orders">
                <Package aria-hidden="true" />
                Mis pedidos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/customer/courses">
                <BookOpen aria-hidden="true" />
                Mis cursos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/">
                <Store aria-hidden="true" />
                Ir al sitio
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuItem asChild>
          <Link href={user.profileHref}>
            <Settings aria-hidden="true" />
            Configuración de perfil
          </Link>
        </DropdownMenuItem>

        {user.alternateAccount && switchAction ? (
          <>
            <DropdownMenuSeparator />
            <form action={switchAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-default">
                  <ArrowLeftRight aria-hidden="true" />
                  Cambiar a {ROLE_SELECTION_LABELS[user.alternateAccount.role]}
                </button>
              </DropdownMenuItem>
            </form>
          </>
        ) : null}

        <DropdownMenuSeparator />
        <form action={signOutUser}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-default text-red-600 focus:text-red-600">
              <LogOut aria-hidden="true" />
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
