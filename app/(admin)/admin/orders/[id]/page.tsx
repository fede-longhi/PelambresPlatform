import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchOrderAttachments, fetchOrderById, fetchOrderStatusEvents } from '@/lib/data/order-data';
import { fetchOrderPrintJobs } from '@/lib/data/print-job-data';
import { fetchQuoteItemsForOrder } from '@/lib/data/quote-document-data';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import OrderDetailCard from '@/app/(admin)/admin/orders/_components/card-detail';
import OrderCustomerDetailCard from '@/app/(admin)/admin/orders/_components/order-customer-detail';
import OrderPrintJobsDetail from '@/app/(admin)/admin/orders/_components/print-jobs-detail';
import OrderNotesForm from '@/app/(admin)/admin/orders/_components/order-notes-form';
import OrderStatusHistory from '@/app/(admin)/admin/orders/_components/order-status-history';
import OrderQuoteItems from '@/app/(admin)/admin/orders/_components/order-quote-items';
import OrderAttachments from '@/app/(admin)/admin/orders/_components/order-attachments';
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
  const [order, printJobs, statusEvents, attachments] = await Promise.all([
    fetchOrderById(id),
    fetchOrderPrintJobs(id),
    fetchOrderStatusEvents(id),
    fetchOrderAttachments(id),
  ]);

  if (!order) {
    notFound();
  }

  const quoteItems = order.quote_id
    ? await fetchQuoteItemsForOrder(order.quote_id)
    : [];

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

      {order.quote_id ? (
        <div className="mt-4">
          <OrderQuoteItems
            quoteId={order.quote_id}
            quoteNumber={order.quote_number}
            items={quoteItems}
          />
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Notas internas</h2>
          <OrderNotesForm orderId={order.id} notes={order.notes ?? ''} />
        </section>
        <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Historial de estados</h2>
          <OrderStatusHistory events={statusEvents} />
        </section>
      </div>

      <div className="mt-4">
        <section className="space-y-4 rounded-lg border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Archivos adjuntos</h2>
          <OrderAttachments orderId={order.id} attachments={attachments} />
        </section>
      </div>

      <div className="mt-4">
        <OrderPrintJobsDetail orderId={order.id} printJobs={printJobs} />
      </div>
    </div>
  );
}
