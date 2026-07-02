import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchCustomerIdForUser } from '@/lib/data/customer-portal-data';
import { lusitana } from '@/app/fonts';

export default async function CustomerUnlinkedPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/customer');
  }

  const customerId = await fetchCustomerIdForUser(
    session.user.id,
    session.user.email ?? ''
  );

  if (customerId) {
    redirect('/customer');
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className={`${lusitana.className} text-2xl`}>Cuenta sin vincular</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Tu usuario de acceso no está asociado a un cliente en nuestro sistema. El email de tu
        cuenta debe coincidir con el registrado en tu ficha de cliente.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Contactanos para que podamos vincular tu cuenta:{' '}
        <span className="font-medium">{session.user.email}</span>
      </p>
    </div>
  );
}
