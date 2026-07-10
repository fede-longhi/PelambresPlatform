import Link from 'next/link';
import CustomerNavLinks from '@/app/(customer)/customer/_components/nav-links';
import { PelambresSidenavLogo } from '@/components/shared/pelambres-sidenav-logo';
import { PortalMobileNav } from '@/components/shared/portal-mobile-nav';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut, auth } from '@/auth';
import CustomerUserProfile from '@/app/(customer)/customer/_components/user-profile';
import RoleSwitchNavItem from '@/components/shared/role-switch-nav-item';
import { redirect } from 'next/navigation';

export default async function CustomerSideNav() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/customer');
  }

  return (
    <PortalMobileNav logoHref="/customer">
      <div className="flex h-full min-h-0 flex-col px-3 py-4 md:px-2">
        <div className="shrink-0 space-y-2">
          <Link
            className="mb-2 hidden h-24 items-center rounded-md bg-primary p-3 md:flex"
            href="/customer"
          >
            <PelambresSidenavLogo />
          </Link>
          <CustomerUserProfile
            name={session.user.name ?? 'Cliente'}
            email={session.user.email ?? ''}
          />
        </div>

        <nav
          aria-label="Navegación de cliente"
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain py-3"
        >
          <CustomerNavLinks />
        </nav>

        <div className="shrink-0 space-y-2 border-t border-border/60 pt-3">
          <RoleSwitchNavItem />
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="flex h-[48px] w-full items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:justify-start md:p-2 md:px-3"
            >
              <PowerIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </div>
    </PortalMobileNav>
  );
}
