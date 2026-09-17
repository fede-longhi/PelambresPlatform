import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchOrderById } from '@/lib/data/order-data';
import { fetchOrderPrintJobs } from '@/lib/data/print-job-data';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import OrderDetailCard from '@/app/(admin)/admin/orders/_components/card-detail';
import OrderCustomerDetailCard from '@/app/(admin)/admin/orders/_components/order-customer-detail';
import OrderPrintJobsDetail from '@/app/(admin)/admin/orders/_components/print-jobs-detail';
import { DeleteOrder, EditOrder } from '@/app/(admin)/admin/orders/_components/buttons';
import { lusitana } from '@/app/fonts';

export const metadata: Metadata = {
  title: 'Pedido',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [order, printJobs] = await Promise.all([
    fetchOrderById(id),
    fetchOrderPrintJobs(id),
  ]);

  if (!order) {
    notFound();
  }

  const trackingCode = order.tracking_code ?? id;

  return (
    <div className="w-full max-w-5xl">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Pedidos', href: '/admin/orders' },
          {
            label: trackingCode,
            href: `/admin/orders/${id}`,
            active: true,
          },
        ]}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          Pedido {trackingCode}
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <EditOrder id={order.id} label="Editar" />
          <DeleteOrder
            id={order.id}
            trackingCode={trackingCode}
            hasPrintJobs={(printJobs?.length ?? 0) > 0}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <OrderDetailCard order={order} />
        <OrderCustomerDetailCard order={order} />
      </div>

      <div className="mt-4">
        <OrderPrintJobsDetail orderId={order.id} printJobs={printJobs} />
      </div>
    </div>
  );
}
