import { requireCustomerPortalContext } from '@/lib/auth/customer-portal';
import { fetchCustomerPortalOrders } from '@/lib/data/customer-portal-data';
import { lusitana } from '@/app/fonts';
import { getCustomerName, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusField from '@/app/(admin)/admin/orders/_components/status-field';
import type { OrderStatus } from '@/types/order-definitions';

export default async function CustomerHomePage() {
  const { customer } = await requireCustomerPortalContext();
  const orders = await fetchCustomerPortalOrders(customer.id);
  const recentOrders = orders.slice(0, 3);
  const activeOrders = orders.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled');

  return (
    <div className="w-full max-w-4xl">
      <h1 className={`${lusitana.className} text-2xl md:text-3xl`}>
        Hola, {getCustomerName(customer)}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Seguí el estado de tus pedidos desde tu portal de cliente.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pedidos activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{activeOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total de pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimos pedidos</h2>
          {orders.length > 0 && (
            <Link href="/customer/orders" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Todavía no tenés pedidos registrados.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="flex flex-col gap-2 rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{order.tracking_code}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(order.amount)}
                  </p>
                </div>
                <OrderStatusField statusName={order.status as OrderStatus} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
