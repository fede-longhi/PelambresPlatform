import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import CreateUserForm from '@/app/(admin)/admin/users/_components/create-form';

export default function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Usuarios', href: '/admin/users' },
          {
            label: 'Crear usuario',
            href: '/admin/users/create',
            active: true,
          },
        ]}
      />
      <div className="flex justify-center">
        <CreateUserForm />
      </div>
    </main>
  );
}
