import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderTable } from '@/types/definitions';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import { isOrderOverdue } from '@/lib/consts/order-list-consts';
import Link from 'next/link';
import OrderStatusForm from './order-status-form';

function OrderDetailCard({ order }: { order: OrderTable }) {
  const overdue = isOrderOverdue(order.status, order.estimated_date);

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Datos del pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <OrderStatusForm orderId={order.id} status={order.status} />
        <dl className="space-y-3 text-sm">
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-muted-foreground">Código</dt>
            <dd>{order.tracking_code}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-muted-foreground">Entrega estimada</dt>
            <dd className={overdue ? 'font-medium text-destructive' : undefined}>
              {overdue ? 'Vencido · ' : ''}
              {formatDateToLocal(order.estimated_date, 'es-AR')}
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-muted-foreground">Importe</dt>
            <dd>{formatCurrency(order.amount)}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-muted-foreground">Creado</dt>
            <dd>{formatDateToLocal(order.created_date, 'es-AR')}</dd>
          </div>
          {order.quote_id ? (
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground">Presupuesto</dt>
              <dd>
                <Link
                  href={`/admin/quotes/${order.quote_id}`}
                  className="text-primary hover:underline"
                >
                  Nº {formatQuoteNumber(order.quote_number ?? 0)}
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

export default OrderDetailCard;
