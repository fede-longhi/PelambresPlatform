import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchCustomerIdForUser } from '@/lib/data/customer-portal-data';
import { lusitana } from '@/app/fonts';

export default async function CustomerUnlinkedPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/customer');
  }

  const customerId = await fetchCustomerIdForUser(session.user.id);

  if (customerId) {
    redirect('/customer');
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className={`${lusitana.className} text-2xl`}>Cuenta sin vincular</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Tu usuario de acceso no está vinculado a un cliente en nuestro sistema. Un administrador
        debe asignarte a la ficha de cliente correspondiente (persona o empresa) para que puedas
        ver pedidos y cursos.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Contactanos indicando tu email de acceso:{' '}
        <span className="font-medium">{session.user.email}</span>
      </p>
    </div>
  );
}
