import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  formatStorePrice,
  getStoreOrderStatusLabel,
  getStoreProductTypeLabel,
} from '@/lib/consts/store-consts';
import { fetchStoreOrderById } from '@/lib/data/store-order-data';

export const metadata: Metadata = {
  title: 'Detalle pedido de tienda',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoreOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await fetchStoreOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-10">
      <div className="flex items-start gap-4">
        <Link href="/admin/store-orders">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900">Pedido</h1>
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
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {order.id}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 rounded-xl border border-border bg-card p-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Comprador</dt>
          <dd className="mt-1 font-medium">{order.buyerName}</dd>
          <dd className="text-muted-foreground">{order.buyerEmail}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="mt-1 font-medium">
            {formatStorePrice(order.totalCents, order.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Creado</dt>
          <dd className="mt-1">
            {new Date(order.createdAt).toLocaleString('es-AR')}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Pagado</dt>
          <dd className="mt-1">
            {order.paidAt
              ? new Date(order.paidAt).toLocaleString('es-AR')
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Preference ID</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {order.mpPreferenceId ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Payment ID</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {order.mpPaymentId ?? '—'}
          </dd>
        </div>
        {order.customerId ? (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Cliente CRM</dt>
            <dd className="mt-1">
              <Link
                href={`/admin/customers/${order.customerId}`}
                className="text-blue-600 hover:underline"
              >
                Ver cliente
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Ítems</h2>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border bg-card p-4 text-sm"
            >
              <div className="font-medium">{item.name}</div>
              <div className="mt-1 text-muted-foreground">
                {getStoreProductTypeLabel(item.productType)} · Cantidad{' '}
                {item.quantity} ·{' '}
                {formatStorePrice(item.lineTotalCents, order.currency)}
              </div>
              {item.productId ? (
                <Link
                  href={`/admin/products/${item.productId}`}
                  className="mt-2 inline-block text-blue-600 hover:underline"
                >
                  Ver producto
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
