import { fetchUserById } from '@/lib/data/user-data';
import { fetchCustomerById } from '@/lib/data/customer-data';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import EditUserForm from '@/app/(admin)/admin/users/_components/edit-form';
import { getCustomerName } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await fetchUserById(id);

  if (!user) {
    notFound();
  }

  const linkedCustomerRecord = user.customer_id
    ? await fetchCustomerById(user.customer_id)
    : undefined;

  const linkedCustomer = linkedCustomerRecord
    ? {
        value: linkedCustomerRecord.id,
        label: getCustomerName(linkedCustomerRecord),
      }
    : undefined;

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Usuarios', href: '/admin/users' },
          {
            label: user.name,
            href: `/admin/users/${id}/edit`,
            active: true,
          },
        ]}
      />
      <div className="flex justify-center">
        <EditUserForm user={user} linkedCustomer={linkedCustomer} />
      </div>
    </main>
  );
}
