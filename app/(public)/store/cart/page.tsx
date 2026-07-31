import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StoreCartPageClient } from './_components/store-cart-page-client';

export const metadata: Metadata = {
  title: 'Carrito',
};

export default function StoreCartPage() {
  return (
    <div className="min-h-screen bg-muted pb-24 font-sans">
      <div className="bg-background px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Seguir comprando
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-heading-foreground md:text-4xl">
            Carrito
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisá tu pedido y pagá con Mercado Pago.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <StoreCartPageClient />
      </div>
    </div>
  );
}
