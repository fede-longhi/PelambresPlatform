import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatStorePrice,
  getStoreOrderStatusLabel,
  getStoreProductTypeLabel,
} from '@/lib/consts/store-consts';
import { fetchStoreOrderById } from '@/lib/data/store-order-data';
import type { StoreOrderStatus } from '@/types/store-definitions';

type CheckoutResultPageProps = {
  searchParams?: Promise<{ order?: string }>;
};

type ResultVariant = 'success' | 'pending' | 'failure';

const VARIANT_COPY: Record<
  ResultVariant,
  {
    title: string;
    description: string;
    icon: typeof CheckCircle2;
    iconClassName: string;
  }
> = {
  success: {
    title: 'Pago recibido',
    description:
      'Mercado Pago confirmó tu pago. Si compraste un diseño, la descarga va a estar disponible pronto en tu cuenta. Si es un artículo físico, te contactamos para coordinar el retiro.',
    icon: CheckCircle2,
    iconClassName: 'text-emerald-600',
  },
  pending: {
    title: 'Pago en proceso',
    description:
      'Tu pago todavía se está procesando. Te avisamos por email cuando se confirme. También podés escribirnos por WhatsApp si tenés dudas.',
    icon: Clock3,
    iconClassName: 'text-amber-600',
  },
  failure: {
    title: 'No se pudo completar el pago',
    description:
      'El pago no se acreditó. Podés volver al catálogo e intentarlo de nuevo, o contactarnos para coordinar otra forma de pago.',
    icon: XCircle,
    iconClassName: 'text-red-600',
  },
};

async function CheckoutResult({
  variant,
  searchParams,
}: {
  variant: ResultVariant;
  searchParams?: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderId = params?.order;
  const order = orderId ? await fetchStoreOrderById(orderId) : null;
  const copy = VARIANT_COPY[variant];
  const Icon = copy.icon;

  const effectiveStatus: StoreOrderStatus | null = order?.status ?? null;
  const title =
    effectiveStatus === 'paid' && variant !== 'failure'
      ? VARIANT_COPY.success.title
      : copy.title;
  const description =
    effectiveStatus === 'paid' && variant !== 'failure'
      ? VARIANT_COPY.success.description
      : copy.description;
  const ResultIcon =
    effectiveStatus === 'paid' && variant !== 'failure'
      ? VARIANT_COPY.success.icon
      : Icon;
  const iconClassName =
    effectiveStatus === 'paid' && variant !== 'failure'
      ? VARIANT_COPY.success.iconClassName
      : copy.iconClassName;

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <ResultIcon
        size={48}
        className={`mx-auto ${iconClassName}`}
        aria-hidden="true"
      />
      <h1 className="mt-6 text-3xl font-bold text-heading-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>

      {order ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-left text-sm">
          <p>
            <span className="text-muted-foreground">Pedido:</span>{' '}
            <span className="font-mono text-xs">{order.id}</span>
          </p>
          <p className="mt-2">
            <span className="text-muted-foreground">Estado:</span>{' '}
            {getStoreOrderStatusLabel(order.status)}
          </p>
          <p className="mt-2">
            <span className="text-muted-foreground">Total:</span>{' '}
            {formatStorePrice(order.totalCents, order.currency)}
          </p>
          {order.items[0] ? (
            <p className="mt-2">
              <span className="text-muted-foreground">Artículo:</span>{' '}
              {order.items[0].name} (
              {getStoreProductTypeLabel(order.items[0].productType)})
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/store">Volver a la tienda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}

export function createCheckoutResultPage(variant: ResultVariant) {
  return async function Page({ searchParams }: CheckoutResultPageProps) {
    return <CheckoutResult variant={variant} searchParams={searchParams} />;
  };
}

export const checkoutResultMetadata: Record<ResultVariant, Metadata> = {
  success: { title: 'Pago exitoso' },
  pending: { title: 'Pago pendiente' },
  failure: { title: 'Pago no completado' },
};
