import { requireCustomerPortalOrder } from '@/lib/auth/customer-portal';
import { lusitana } from '@/app/fonts';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusField from '@/app/(admin)/admin/orders/_components/status-field';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import { format } from 'date-fns';
import type { OrderStatus } from '@/types/order-definitions';

export default async function CustomerOrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { order } = await requireCustomerPortalOrder(id);

  return (
    <div className="w-full max-w-2xl">
      <Link href="/customer/orders" className="text-sm text-primary hover:underline">
        ← Volver a mis pedidos
      </Link>

      <h1 className={`${lusitana.className} mt-4 text-2xl`}>Pedido {order.tracking_code}</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Detalle del pedido</span>
            <OrderStatusField statusName={order.status as OrderStatus} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium">Código de seguimiento:</span> {order.tracking_code}
          </p>
          <p>
            <span className="font-medium">Creado:</span>{' '}
            {formatDateToLocal(order.created_date, 'es-AR')}
          </p>
          <p>
            <span className="font-medium">Entrega estimada:</span>{' '}
            {format(new Date(order.estimated_date), 'PPP')}
          </p>
          <p>
            <span className="font-medium">Monto total:</span> {formatCurrency(order.amount)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
