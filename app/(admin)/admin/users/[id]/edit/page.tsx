import { fetchUserById } from '@/lib/data/user-data';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import EditUserForm from '@/app/(admin)/admin/users/_components/edit-form';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await fetchUserById(id);

  if (!user) {
    notFound();
  }

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
        <EditUserForm user={user} />
      </div>
    </main>
  );
}
