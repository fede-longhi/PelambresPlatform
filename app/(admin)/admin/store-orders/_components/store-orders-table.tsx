import Link from 'next/link';
import {
  formatStorePrice,
  getStoreOrderStatusLabel,
  getStorePaymentMethodLabel,
  getStoreProductTypeLabel,
} from '@/lib/consts/store-consts';
import { fetchFilteredStoreOrders } from '@/lib/data/store-order-data';
import type { StoreOrderListFilter } from '@/lib/consts/store-order-list-consts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function statusBadgeClass(status: string): string | undefined {
  if (status === 'paid') {
    return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
  }
  if (status === 'payment_review') {
    return 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100';
  }
  return undefined;
}

export default async function StoreOrdersTable({
  query,
  currentPage,
  filter,
}: {
  query: string;
  currentPage: number;
  filter: StoreOrderListFilter;
}) {
  const orders = await fetchFilteredStoreOrders(query, currentPage, filter);

  if (orders.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
        {filter === 'attention'
          ? 'No hay comprobantes en revisión.'
          : 'No se encontraron pedidos de tienda con esos filtros.'}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
      <div className="md:hidden">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/store-orders/${order.id}`}
            className="mb-2 block w-full rounded-md bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3 border-b pb-3">
              <div className="min-w-0">
                <p className="font-medium">{order.buyerName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {order.buyerEmail}
                </p>
              </div>
              <Badge
                variant={order.status === 'paid' ? 'default' : 'secondary'}
                className={statusBadgeClass(order.status)}
              >
                {getStoreOrderStatusLabel(order.status)}
              </Badge>
            </div>
            <div className="space-y-1 pt-3 text-sm text-muted-foreground">
              <p>{order.itemName ?? 'Sin artículo'}</p>
              <p>{formatStorePrice(order.totalCents, order.currency)}</p>
              <p>{getStorePaymentMethodLabel(order.paymentMethod)}</p>
              <p>{new Date(order.createdAt).toLocaleString('es-AR')}</p>
            </div>
          </Link>
        ))}
      </div>

      <Table className="hidden min-w-full text-secondary-foreground md:table">
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="border-0">
            <TableHead className="px-4 py-5 font-medium">Fecha</TableHead>
            <TableHead className="px-4 py-5 font-medium">Comprador</TableHead>
            <TableHead className="px-4 py-5 font-medium">Artículo</TableHead>
            <TableHead className="px-4 py-5 font-medium">Total</TableHead>
            <TableHead className="px-4 py-5 font-medium">Método</TableHead>
            <TableHead className="px-4 py-5 font-medium">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-0">
              <TableCell className="px-4 py-4 align-middle text-sm">
                <Link
                  href={`/admin/store-orders/${order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {new Date(order.createdAt).toLocaleString('es-AR')}
                </Link>
              </TableCell>
              <TableCell className="px-4 py-4 align-middle text-sm">
                <div className="font-medium">{order.buyerName}</div>
                <div className="text-xs text-muted-foreground">
                  {order.buyerEmail}
                </div>
              </TableCell>
              <TableCell className="px-4 py-4 align-middle text-sm">
                <div>{order.itemName ?? '—'}</div>
                {order.productType ? (
                  <div className="text-xs text-muted-foreground">
                    {getStoreProductTypeLabel(order.productType)}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="px-4 py-4 align-middle text-sm">
                {formatStorePrice(order.totalCents, order.currency)}
              </TableCell>
              <TableCell className="px-4 py-4 align-middle text-sm">
                {getStorePaymentMethodLabel(order.paymentMethod)}
              </TableCell>
              <TableCell className="px-4 py-4 align-middle">
                <Badge
                  variant={order.status === 'paid' ? 'default' : 'secondary'}
                  className={statusBadgeClass(order.status)}
                >
                  {getStoreOrderStatusLabel(order.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
