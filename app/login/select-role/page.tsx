import { fetchActiveUsersByIds } from '@/lib/data/user-data';
import { verifyAccountSelectionToken } from '@/lib/auth/account-selection';
import { redirect } from 'next/navigation';
import SelectRoleForm from './_components/select-role-form';
import { PelambresAuthLogo } from '@/components/shared/pelambres-auth-logo';
import { lusitana } from '@/app/fonts';

type SelectRolePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function SelectRolePage({ searchParams }: SelectRolePageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/login');
  }

  const payload = verifyAccountSelectionToken(token);

  if (!payload) {
    redirect('/login?error=expired-selection');
  }

  const accounts = await fetchActiveUsersByIds(payload.userIds);

  if (accounts.length === 0) {
    redirect('/login');
  }

  if (accounts.length === 1) {
    redirect('/login');
  }

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-primary p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <PelambresAuthLogo />
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>Elegí cómo ingresar</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Tu cuenta de Google está asociada a más de un perfil en la plataforma.
          </p>
          <SelectRoleForm
            selectionToken={token}
            accounts={accounts.map((account) => ({
              userId: account.id,
              role: account.role,
              name: account.name,
            }))}
          />
        </div>
      </div>
    </main>
  );
}
