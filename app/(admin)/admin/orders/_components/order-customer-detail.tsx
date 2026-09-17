import { OrderTable } from '@/types/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrderCustomerName } from '@/lib/utils';
import Link from 'next/link';
import CustomerTypeField from '@/app/(admin)/admin/customers/_components/type-field';

export default function OrderCustomerDetailCard({
  order,
}: {
  order: OrderTable;
}) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CustomerTypeField type={order.customer_type} />
        <dl className="space-y-3 text-sm">
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-muted-foreground">Nombre</dt>
            <dd>
              <Link
                href={`/admin/customers/${order.customer_id}`}
                className="text-primary hover:underline"
              >
                {getOrderCustomerName(order)}
              </Link>
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-muted-foreground">Email</dt>
            <dd>{order.email || '—'}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-muted-foreground">Teléfono</dt>
            <dd>{order.phone || '—'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
