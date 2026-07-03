import { requireCustomerPortalContext } from '@/lib/auth/customer-portal';
import { fetchCustomerPortalOrders } from '@/lib/data/customer-portal-data';
import { lusitana } from '@/app/fonts';
import Link from 'next/link';
import OrderStatusField from '@/app/(admin)/admin/orders/_components/status-field';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import type { OrderStatus } from '@/types/order-definitions';

export default async function CustomerOrdersPage() {
  const { customer } = await requireCustomerPortalContext();
  const orders = await fetchCustomerPortalOrders(customer.id);

  return (
    <div className="w-full max-w-4xl">
      <h1 className={`${lusitana.className} text-2xl`}>Mis pedidos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Historial y estado de todos tus pedidos.
      </p>

      <div className="mt-6">
        {orders.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
            No hay pedidos para mostrar.
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="space-y-2 md:hidden">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/customer/orders/${order.id}`}
                  className="block rounded-lg bg-white p-4"
                >
                  <p className="font-medium">{order.tracking_code}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateToLocal(order.created_date, 'es-AR')}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <OrderStatusField statusName={order.status as OrderStatus} />
                    <span className="text-sm font-medium">{formatCurrency(order.amount)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <table className="hidden min-w-full text-sm md:table">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-4 font-medium">Código</th>
                  <th className="px-4 py-4 font-medium">Fecha</th>
                  <th className="px-4 py-4 font-medium">Estado</th>
                  <th className="px-4 py-4 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/customer/orders/${order.id}`} className="hover:underline">
                        {order.tracking_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {formatDateToLocal(order.created_date, 'es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusField statusName={order.status as OrderStatus} />
                    </td>
                    <td className="px-4 py-3">{formatCurrency(order.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
