import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatStorePrice,
  getStoreOrderStatusLabel,
} from '@/lib/consts/store-consts';
import {
  buildStoreTransferWhatsAppUrl,
  getStoreTransferBankDetails,
} from '@/lib/consts/store-transfer-consts';
import { fetchStoreOrderById } from '@/lib/data/store-order-data';
import { StoreCartClearOnSuccess } from '../_components/store-cart-clear-on-success';
import { StoreTransferCopyField } from './_components/store-transfer-copy-field';
import { StoreTransferReceiptForm } from './_components/store-transfer-receipt-form';

export const metadata: Metadata = {
  title: 'Pago por transferencia',
};

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function StoreTransferCheckoutPage({
  searchParams,
}: PageProps) {
  const { order: orderId } = await searchParams;
  if (!orderId) {
    notFound();
  }

  const order = await fetchStoreOrderById(orderId);
  if (!order || order.paymentMethod !== 'transfer') {
    notFound();
  }

  const bank = getStoreTransferBankDetails();
  const transferReference =
    order.transferReference ?? order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const whatsappUrl = buildStoreTransferWhatsAppUrl({
    orderId: order.id,
    transferReference,
    totalCents: order.totalCents,
    currency: order.currency,
  });

  const canUpload =
    order.status === 'pending' || order.status === 'payment_review';
  const isPaid = order.status === 'paid';
  const isCancelled =
    order.status === 'cancelled' ||
    order.status === 'failed' ||
    order.status === 'refunded';

  return (
    <div className="min-h-screen bg-muted pb-24 font-sans">
      {canUpload || isPaid ? <StoreCartClearOnSuccess /> : null}

      <div className="bg-background px-6 py-10 md:py-14">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-heading-foreground md:text-4xl">
              Transferencia bancaria
            </h1>
            <Badge
              variant={isPaid ? 'default' : 'secondary'}
              className={
                isPaid
                  ? 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                  : order.status === 'payment_review'
                    ? 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100'
                    : undefined
              }
            >
              {getStoreOrderStatusLabel(order.status)}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Pedido <span className="font-mono">{order.id}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-6 py-10">
        {isPaid ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-semibold text-emerald-900">
              ¡Pago confirmado!
            </h2>
            <p className="mt-2 text-sm text-emerald-800">
              Recibimos tu transferencia. Te vamos a contactar para coordinar
              el retiro o la entrega del archivo.
            </p>
            <Button asChild className="mt-4">
              <Link href="/store">Volver a la tienda</Link>
            </Button>
          </section>
        ) : null}

        {isCancelled ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Este pedido ya no está activo
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si querés comprar de nuevo, volvé a la tienda y generá un pedido
              nuevo.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/store">Ir a la tienda</Link>
            </Button>
          </section>
        ) : null}

        {!isPaid && !isCancelled ? (
          <>
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Datos para transferir
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Transferí el monto exacto e incluí el concepto / referencia.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Monto
                </p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {formatStorePrice(order.totalCents, order.currency)}
                </p>
              </div>

              <StoreTransferCopyField
                label="Concepto / referencia"
                value={transferReference}
              />

              {bank ? (
                <div className="space-y-3">
                  <StoreTransferCopyField
                    label="Titular"
                    value={bank.holder}
                  />
                  {bank.alias ? (
                    <StoreTransferCopyField label="Alias" value={bank.alias} />
                  ) : null}
                  {bank.cbu ? (
                    <StoreTransferCopyField label="CBU / CVU" value={bank.cbu} />
                  ) : null}
                  {bank.bank ? (
                    <StoreTransferCopyField label="Banco" value={bank.bank} />
                  ) : null}
                  {bank.cuit ? (
                    <StoreTransferCopyField label="CUIT" value={bank.cuit} />
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  Faltan los datos bancarios de la tienda. Escribinos por
                  WhatsApp para coordinar el pago.
                </p>
              )}
            </section>

            {order.status === 'payment_review' ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-semibold text-amber-950">
                  Comprobante en revisión
                </h2>
                <p className="mt-2 text-sm text-amber-900">
                  Ya recibimos tu comprobante. Cuando confirmemos el pago,
                  actualizamos el estado de este pedido.
                </p>
                {order.transferReceiptUrl ? (
                  <a
                    href={order.transferReceiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-amber-950 underline"
                  >
                    Ver comprobante enviado
                  </a>
                ) : null}
              </section>
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Subí el comprobante
                </h2>
                <StoreTransferReceiptForm
                  orderId={order.id}
                  hasExistingReceipt={Boolean(order.transferReceiptUrl)}
                />
              </section>
            )}

            {order.status === 'payment_review' ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  ¿Necesitás corregir el comprobante?
                </h2>
                <StoreTransferReceiptForm
                  orderId={order.id}
                  hasExistingReceipt
                />
              </section>
            ) : null}

            <section className="rounded-2xl border border-whatsapp/20 bg-whatsapp/10 p-6">
              <p className="text-sm text-slate-700">
                Si tenés alguna duda o el archivo no sube, escribinos por
                WhatsApp con el monto y la referencia del pedido.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'mt-4 inline-flex items-center justify-center gap-2 border-transparent !bg-[#25D366] !text-white hover:!bg-[#1ebe57]'
                )}
              >
                <MessageCircle size={18} aria-hidden="true" />
                WhatsApp
              </a>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
