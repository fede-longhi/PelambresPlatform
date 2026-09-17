import { fetchFilteredOrders } from '@/lib/data/order-data';
import { formatCurrency, formatDateToLocal, getOrderCustomerName } from '@/lib/utils';
import { isOrderOverdue } from '@/lib/consts/order-list-consts';
import type { OrderListFilter } from '@/lib/consts/order-list-consts';
import Link from 'next/link';
import OrderStatusBadge from './order-status-badge';

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

  if (orders.length === 0) {
    return (
      <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
        {filter === 'open'
          ? 'No hay pedidos activos.'
          : 'No se encontraron pedidos con esos filtros.'}
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {orders.map((order) => {
              const overdue = isOrderOverdue(order.status, order.estimated_date);

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="mb-2 block w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3 border-b pb-4">
                    <div className="min-w-0">
                      <p className="mb-1 font-medium">{order.tracking_code}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {getOrderCustomerName(order)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
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
                </Link>
              );
            })}
          </div>

          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
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
              </tr>
            </thead>
            <tbody className="bg-white">
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
                      <OrderStatusBadge status={order.status} />
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
