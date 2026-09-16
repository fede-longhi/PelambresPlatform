import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import CreateForm from '@/app/(admin)/admin/print-jobs/_components/create-form';
import { fetchOrdersForPrintJobSelect } from '@/lib/data/order-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuevo trabajo',
};

export default async function Page() {
  const orders = await fetchOrdersForPrintJobSelect();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Trabajos', href: '/admin/print-jobs' },
          {
            label: 'Nuevo trabajo',
            href: '/admin/print-jobs/create',
            active: true,
          },
        ]}
      />
      <div className="flex w-full">
        <div className="flex justify-center">
          <CreateForm orders={orders} />
        </div>
      </div>
    </main>
  );
}
