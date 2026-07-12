'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { MainHeaderUser } from '@/components/layout/main-header';
import type { UserRole } from '@/types/user-definitions';

type HeaderUserMenuProps = {
  user: MainHeaderUser;
};

type AccountAction = {
  key: string;
  href?: string;
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  destructive?: boolean;
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

function useAccountMenuItems(user: MainHeaderUser) {
  const pathname = usePathname();
  const onPublicSurface = isPublicSurface(pathname);
  const onCustomerSurface = isCustomerSurface(pathname);
  const switchAction = user.alternateAccount
    ? switchRoleAccountForUser.bind(null, user.alternateAccount.userId)
    : null;

  const links: AccountAction[] = [];

  if (onPublicSurface) {
    links.push({
      key: 'portal',
      href: user.portalHref,
      label: portalLabel(user.role),
      icon: LayoutDashboard,
    });
  }

  if (onCustomerSurface) {
    links.push(
      {
        key: 'orders',
        href: '/customer/orders',
        label: 'Mis pedidos',
        icon: Package,
      },
      {
        key: 'courses',
        href: '/customer/courses',
        label: 'Mis cursos',
        icon: BookOpen,
      },
      {
        key: 'site',
        href: '/',
        label: 'Ir al sitio',
        icon: Store,
      }
    );
  }

  links.push({
    key: 'profile',
    href: user.profileHref,
    label: 'Configuración de perfil',
    icon: Settings,
  });

  return { links, switchAction, alternateRole: user.alternateAccount?.role };
}

export function HeaderUserMenu({ user }: HeaderUserMenuProps) {
  const { links, switchAction, alternateRole } = useAccountMenuItems(user);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-2 py-1.5 pr-3 text-left text-white outline-none transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Abrir menú de cuenta"
          >
            <UserAvatar
              imageUrl={user.imageUrl}
              displayName={user.displayName}
              size="sm"
            />
            <span className="max-w-[140px] truncate text-sm font-medium">
              {user.username}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium text-foreground">
                {user.displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {links.map((item) => (
              <DropdownMenuItem key={item.key} asChild className="cursor-pointer">
                <Link href={item.href!}>
                  <item.icon aria-hidden="true" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}

            {switchAction && alternateRole ? (
              <>
                <DropdownMenuSeparator />
                <form action={switchAction}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full cursor-pointer">
                      <ArrowLeftRight aria-hidden="true" />
                      Cambiar a {ROLE_SELECTION_LABELS[alternateRole]}
                    </button>
                  </DropdownMenuItem>
                </form>
              </>
            ) : null}

            <DropdownMenuSeparator />
            <form action={signOutUser}>
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="w-full cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut aria-hidden="true" />
                  Cerrar sesión
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="rounded-full p-1 outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Abrir menú de cuenta"
            >
              <UserAvatar
                imageUrl={user.imageUrl}
                displayName={user.displayName}
                size="sm"
              />
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl px-4 pb-8 pt-4"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" aria-hidden="true" />
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="truncate">{user.displayName}</SheetTitle>
              <SheetDescription className="truncate">{user.email}</SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-1" aria-label="Menú de cuenta">
              {links.map((item) => (
                <Link
                  key={item.key}
                  href={item.href!}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted'
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}

              {switchAction && alternateRole ? (
                <form action={switchAction}>
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <ArrowLeftRight className="size-4 shrink-0" aria-hidden="true" />
                    Cambiar a {ROLE_SELECTION_LABELS[alternateRole]}
                  </button>
                </form>
              ) : null}

              <form action={signOutUser}>
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="size-4 shrink-0" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </form>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
