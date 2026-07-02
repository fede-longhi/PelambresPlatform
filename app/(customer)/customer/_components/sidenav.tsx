import Link from 'next/link';
import CustomerNavLinks from '@/app/(customer)/customer/_components/nav-links';
import PelambresLogo from '@/components/shared/home-logo';
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
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-primary p-4 md:h-32"
        href="/customer"
      >
        <div className="w-32 text-white md:w-36">
          <PelambresLogo />
        </div>
      </Link>

      <CustomerUserProfile
        name={session.user.name ?? 'Cliente'}
        email={session.user.email ?? ''}
      />

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <CustomerNavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block" />
        <RoleSwitchNavItem />
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button
            type="submit"
            className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <PowerIcon className="h-6 w-6" />
            <div className="hidden md:block">Cerrar sesión</div>
          </button>
        </form>
      </div>
    </div>
  );
}
