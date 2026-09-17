import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchOrderById } from '@/lib/data/order-data';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import OrderEditForm from '@/app/(admin)/admin/orders/_components/edit-form';

export const metadata: Metadata = {
  title: 'Editar pedido',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const order = await fetchOrderById(id);

  if (!order) {
    notFound();
  }

  const trackingCode = order.tracking_code ?? id;

  return (
    <main className="w-full max-w-xl">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Pedidos', href: '/admin/orders' },
          {
            label: trackingCode,
            href: `/admin/orders/${id}`,
          },
          {
            label: 'Editar pedido',
            href: `/admin/orders/${id}/edit`,
            active: true,
          },
        ]}
      />
      <OrderEditForm order={order} />
    </main>
  );
}
