import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchOrderAmendments,
  fetchOrderAttachments,
  fetchOrderById,
  fetchOrderItems,
  fetchOrderPayments,
  fetchOrderStatusEvents,
  fetchOrderTaxes,
} from '@/lib/data/order-data';
import { fetchOrderPrintJobs } from '@/lib/data/print-job-data';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import OrderDetailCard from '@/app/(admin)/admin/orders/_components/card-detail';
import OrderCustomerDetailCard from '@/app/(admin)/admin/orders/_components/order-customer-detail';
import OrderPrintJobsDetail from '@/app/(admin)/admin/orders/_components/print-jobs-detail';
import OrderNotesForm from '@/app/(admin)/admin/orders/_components/order-notes-form';
import OrderStatusHistory from '@/app/(admin)/admin/orders/_components/order-status-history';
import OrderItemsForm from '@/app/(admin)/admin/orders/_components/order-items-form';
import OrderAmendments from '@/app/(admin)/admin/orders/_components/order-amendments';
import OrderAttachments from '@/app/(admin)/admin/orders/_components/order-attachments';
import OrderPaymentPanel from '@/app/(admin)/admin/orders/_components/order-payment-panel';
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
  const [order, printJobs, statusEvents, attachments, payments, orderItems, orderTaxes, amendments] =
    await Promise.all([
      fetchOrderById(id),
      fetchOrderPrintJobs(id),
      fetchOrderStatusEvents(id),
      fetchOrderAttachments(id),
      fetchOrderPayments(id),
      fetchOrderItems(id),
      fetchOrderTaxes(id),
      fetchOrderAmendments(id),
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
        <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Pago</h2>
          <OrderPaymentPanel
            orderId={order.id}
            amountCents={Number(order.amount)}
            paidAmountCents={Number(order.paid_amount_cents ?? 0)}
            paymentStatus={order.payment_status ?? 'pending'}
            paidAt={order.paid_at}
            payments={payments}
          />
        </section>
      </div>

      {orderItems.length > 0 ? (
        <div className="mt-4">
          <OrderItemsForm
            orderId={order.id}
            quoteId={order.quote_id}
            quoteNumber={order.quote_number}
            quoteRevision={order.quote_revision}
            quotedAmountCents={order.quoted_amount_cents ?? null}
            globalDiscountPercent={order.global_discount_percent ?? 0}
            taxes={orderTaxes}
            items={orderItems}
            hasPayments={Number(order.paid_amount_cents ?? 0) > 0}
          />
        </div>
      ) : null}

      {amendments.length > 0 ? (
        <div className="mt-4">
          <OrderAmendments amendments={amendments} />
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Notas internas</h2>
          <OrderNotesForm orderId={order.id} notes={order.notes ?? ''} />
        </section>
        <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Historial de estados</h2>
          <OrderStatusHistory events={statusEvents} />
        </section>
      </div>

      <div className="mt-4">
        <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
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
