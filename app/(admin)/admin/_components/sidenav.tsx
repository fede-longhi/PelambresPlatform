import Link from 'next/link';
import NavLinks from '@/app/(admin)/admin/_components/nav-links';
import { PelambresSidenavLogo } from '@/components/shared/pelambres-sidenav-logo';
import { PortalMobileNav } from '@/components/shared/portal-mobile-nav';
import RoleSwitchNavItem from '@/components/shared/role-switch-nav-item';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import UserProfile from '@/app/(admin)/admin/_components/user-profile';
import { fetchAdminNavBadges } from '@/lib/data/admin-dashboard-data';

export default async function SideNav() {
  const badges = await fetchAdminNavBadges();

  return (
    <PortalMobileNav logoHref="/admin">
      <div className="flex h-full min-h-0 flex-col px-3 py-4 md:px-2">
        <div className="shrink-0 space-y-2">
          <Link
            className="mb-2 hidden h-28 items-center rounded-md bg-primary p-3 md:flex"
            href="/admin"
          >
            <PelambresSidenavLogo />
          </Link>
          <UserProfile />
        </div>

        <nav
          aria-label="Navegación de administración"
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain py-3"
        >
          <NavLinks badges={badges} />
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
              className="flex h-12 w-full items-center gap-2 rounded-md bg-muted/60 p-3 text-sm font-medium hover:bg-primary/10 hover:text-primary md:justify-start md:p-2 md:px-3"
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
