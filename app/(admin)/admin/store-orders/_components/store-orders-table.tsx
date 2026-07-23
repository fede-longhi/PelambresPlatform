import Link from 'next/link';
import {
  formatStorePrice,
  getStoreOrderStatusLabel,
  getStoreProductTypeLabel,
} from '@/lib/consts/store-consts';
import { fetchFilteredStoreOrders } from '@/lib/data/store-order-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function StoreOrdersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const orders = await fetchFilteredStoreOrders(query, currentPage);

  if (orders.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
        No hay pedidos de tienda todavía.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
      <Table className="min-w-full text-secondary-foreground">
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="border-0">
            <TableHead className="px-4 py-5 font-medium">Fecha</TableHead>
            <TableHead className="px-4 py-5 font-medium">Comprador</TableHead>
            <TableHead className="px-4 py-5 font-medium">Artículo</TableHead>
            <TableHead className="px-4 py-5 font-medium">Total</TableHead>
            <TableHead className="px-4 py-5 font-medium">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-0">
              <TableCell className="px-4 py-4 align-middle text-sm">
                <Link
                  href={`/admin/store-orders/${order.id}`}
                  className="font-medium text-blue-600 hover:underline"
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
              <TableCell className="px-4 py-4 align-middle">
                <Badge
                  variant={order.status === 'paid' ? 'default' : 'secondary'}
                  className={
                    order.status === 'paid'
                      ? 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                      : undefined
                  }
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
