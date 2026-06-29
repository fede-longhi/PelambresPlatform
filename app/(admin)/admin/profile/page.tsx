import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import ChangePasswordForm from '@/app/(admin)/admin/profile/_components/change-password-form';
import { fetchUserByEmail } from '@/lib/data/user-data';
import { lusitana } from '@/app/fonts';

export default async function Page() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await fetchUserByEmail(session.user.email);

  return (
    <main className="w-full max-w-2xl">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Perfil', href: '/admin/profile', active: true },
        ]}
      />

      <h1 className={`${lusitana.className} mb-6 text-2xl`}>Mi perfil</h1>

      <div className="mb-6 rounded-md border bg-white p-4 text-sm">
        <p><span className="font-medium">Nombre:</span> {session.user.name}</p>
        <p className="mt-1"><span className="font-medium">Email:</span> {session.user.email}</p>
      </div>

      <ChangePasswordForm hasExistingPassword={!!user?.password} />
    </main>
  );
}
