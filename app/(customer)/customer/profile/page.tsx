import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchUserById } from '@/lib/data/user-data';
import { requireCustomerPortalContext } from '@/lib/auth/customer-portal';
import { getCustomerName } from '@/lib/utils';
import { lusitana } from '@/app/fonts';
import ChangePasswordForm from '@/app/(admin)/admin/profile/_components/change-password-form';

export default async function CustomerProfilePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/customer/profile');
  }

  const { customer } = await requireCustomerPortalContext();
  const user = await fetchUserById(session.user.id);

  return (
    <main className="w-full max-w-2xl">
      <h1 className={`${lusitana.className} mb-6 text-2xl`}>Mi perfil</h1>

      <div className="mb-6 space-y-2 rounded-md border bg-white p-4 text-sm">
        <p>
          <span className="font-medium">Nombre:</span> {session.user.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {session.user.email}
        </p>
        <p>
          <span className="font-medium">Cliente:</span> {getCustomerName(customer)}
        </p>
        <p>
          <span className="font-medium">Teléfono:</span> {customer.phone}
        </p>
      </div>

      <ChangePasswordForm hasExistingPassword={!!user?.password} />
    </main>
  );
}
