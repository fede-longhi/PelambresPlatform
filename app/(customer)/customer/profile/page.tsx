import { redirect } from 'next/navigation';
import { fetchUserById, fetchUserHasPassword } from '@/lib/data/user-data';
import { requireCustomerPortalContext } from '@/lib/auth/customer-portal';
import { lusitana } from '@/app/fonts';
import ProfileSettings from './_components/profile-settings';

export default async function CustomerProfilePage() {
  const { userId, email, customer } = await requireCustomerPortalContext();
  const [user, hasExistingPassword] = await Promise.all([
    fetchUserById(userId),
    fetchUserHasPassword(userId),
  ]);

  if (!user) {
    redirect('/login?callbackUrl=/customer/profile');
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div>
        <h1 className={`${lusitana.className} text-2xl md:text-3xl`}>
          Configuración de perfil
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Datos de tu cuenta y opciones de acceso.
        </p>
      </div>

      <ProfileSettings
        key={`${user.first_name}-${user.last_name}-${customer.phone}-${customer.address}-${user.image_url}`}
        firstName={user.first_name}
        lastName={user.last_name}
        email={email}
        phone={customer.phone ?? ''}
        address={customer.address ?? ''}
        imageUrl={user.image_url}
        customerType={customer.type}
        businessName={customer.type === 'business' ? customer.name : null}
        hasExistingPassword={hasExistingPassword}
      />
    </div>
  );
}
