import Link from 'next/link';
import NavLinks from '@/app/(admin)/admin/_components/nav-links';
import { PelambresSidenavLogo } from '@/components/shared/pelambres-sidenav-logo';
import { PortalMobileNav } from '@/components/shared/portal-mobile-nav';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import UserProfile from '@/app/(admin)/admin/_components/user-profile';
import RoleSwitchNavItem from '@/components/shared/role-switch-nav-item';

export default async function SideNav() {
  return (
    <PortalMobileNav logoHref="/">
      <div className="flex flex-col px-3 py-4 md:h-full md:px-2">
        <Link
          className="mb-2 hidden h-28 items-center rounded-md bg-primary p-3 md:flex"
          href="/"
        >
          <PelambresSidenavLogo />
        </Link>

        <UserProfile />

        <div className="flex flex-col space-y-2 md:grow">
          <NavLinks />
          <div className="hidden grow md:block" />
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
              <PowerIcon className="h-6 w-6 shrink-0" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </PortalMobileNav>
  );
}
