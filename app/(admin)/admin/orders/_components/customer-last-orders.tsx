import { fetchCustomerOrders } from '@/lib/data/order-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import OrderStatusBadge from './order-status-badge';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';

export default async function CustomerLastOrders({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const orders = await fetchCustomerOrders(id);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este cliente todavía no tiene pedidos.
          </p>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2 hover:bg-gray-200 sm:flex-row sm:items-center sm:justify-between sm:space-x-4"
                >
                  <span className="font-medium">{order.tracking_code}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm">
                    {formatCurrency(order.amount)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateToLocal(order.created_date, 'es-AR')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
