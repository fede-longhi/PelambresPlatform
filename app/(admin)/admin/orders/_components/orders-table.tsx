import { fetchFilteredOrders, fetchOrderPaymentsByOrderIds } from '@/lib/data/order-data';
import { formatCurrency, formatDateToLocal, getOrderCustomerName } from '@/lib/utils';
import { isOrderOverdue } from '@/lib/consts/order-list-consts';
import type { OrderListFilter } from '@/lib/consts/order-list-consts';
import Link from 'next/link';
import type { OrderPaymentStatus } from '@/types/order-definitions';
import { ORDER_PAYMENT_STATUS_VALUES } from '@/types/order-definitions';
import { OrderPaymentAction, OrderStatusAction } from './order-row-actions';

function paymentStatusOf(status: string | undefined): OrderPaymentStatus {
  if (
    status &&
    (ORDER_PAYMENT_STATUS_VALUES as readonly string[]).includes(status)
  ) {
    return status as OrderPaymentStatus;
  }

  return 'pending';
}

export default async function OrdersTable({
  query,
  currentPage,
  filter,
}: {
  query: string;
  currentPage: number;
  filter: OrderListFilter;
}) {
  const orders = await fetchFilteredOrders(query, currentPage, filter);
  const paymentsByOrder = await fetchOrderPaymentsByOrderIds(
    orders.map((order) => order.id)
  );

  if (orders.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {filter === 'open'
          ? 'No hay pedidos activos.'
          : filter === 'unpaid'
            ? 'No hay pedidos sin pagar.'
            : filter === 'overdue'
              ? 'No hay pedidos con la fecha estimada vencida.'
              : 'No se encontraron pedidos con esos filtros.'}
      </div>
    );
  }

  function renderStatus(order: (typeof orders)[number]) {
    return (
      <OrderStatusAction
        orderId={order.id}
        status={order.status}
        customerEmail={order.email || null}
      />
    );
  }

  function renderPayment(order: (typeof orders)[number]) {
    return (
      <OrderPaymentAction
        orderId={order.id}
        trackingCode={order.tracking_code}
        amountCents={Number(order.amount)}
        paidAmountCents={Number(order.paid_amount_cents ?? 0)}
        paymentStatus={paymentStatusOf(order.payment_status)}
        paidAt={order.paid_at ?? null}
        payments={paymentsByOrder[order.id] ?? []}
      />
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg md:overflow-hidden md:border md:border-border md:bg-card md:shadow-sm">
          <div className="md:hidden">
            {orders.map((order) => {
              const overdue = isOrderOverdue(order.status, order.estimated_date);

              return (
                <div
                  key={order.id}
                  className="mb-2 w-full rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 border-b pb-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="mb-1 block font-medium hover:underline"
                      >
                        {order.tracking_code}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">
                        {getOrderCustomerName(order)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {renderStatus(order)}
                      {renderPayment(order)}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateToLocal(order.created_date, 'es-AR')}
                      </p>
                    </div>
                    <p
                      className={
                        overdue
                          ? 'text-sm font-medium text-destructive'
                          : 'text-sm text-muted-foreground'
                      }
                    >
                      {overdue ? 'Vencido · ' : ''}
                      {formatDateToLocal(order.estimated_date, 'es-AR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="bg-muted/60 text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium">
                  Código
                </th>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Cliente
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Importe
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha estimada
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Creado
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Pago
                </th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {orders.map((order) => {
                const overdue = isOrderOverdue(
                  order.status,
                  order.estimated_date
                );

                return (
                  <tr
                    key={order.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap px-3 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {order.tracking_code}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      {getOrderCustomerName(order)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatCurrency(order.amount)}
                    </td>
                    <td
                      className={
                        overdue
                          ? 'whitespace-nowrap px-3 py-3 font-medium text-destructive'
                          : 'whitespace-nowrap px-3 py-3'
                      }
                    >
                      {overdue ? 'Vencido · ' : ''}
                      {formatDateToLocal(order.estimated_date, 'es-AR')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatDateToLocal(order.created_date, 'es-AR')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {renderStatus(order)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {renderPayment(order)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
