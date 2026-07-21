import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Package } from 'lucide-react';
import {
  fetchFeaturedStoreProducts,
} from '@/lib/data/store-product-data';
import { getStoreCatalogHref } from '@/lib/consts/store-consts';
import { StoreFeaturedSection } from './_components/store-featured-section';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tienda | Pelambres 3D',
  description:
    'Elegí entre artículos listos para retirar y diseños 3D digitales.',
};

export default async function StoreHubPage() {
  const [featuredProducts, featuredDesigns] = await Promise.all([
    fetchFeaturedStoreProducts('product'),
    fetchFeaturedStoreProducts('design'),
  ]);

  return (
    <div className="min-h-screen bg-muted font-sans">
      <section className="bg-background px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-heading-foreground md:text-5xl">
            Tienda <span className="text-primary">Pelambres</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Encontrá lo que buscás…
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-14 grid gap-6 md:grid-cols-2">
          <Link
            href={getStoreCatalogHref('product')}
            className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary transition group-hover:bg-primary/15">
              <Package size={28} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-heading-foreground">
              Artículos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Listos para retirar. Coordinamos entrega por WhatsApp o mail.
            </p>
          </Link>

          <Link
            href={getStoreCatalogHref('design')}
            className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary transition group-hover:bg-primary/15">
              <Download size={28} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-heading-foreground">
              Diseños
            </h2>
            <p className="mt-2 text-muted-foreground">
              Archivos 3D para imprimir. Descarga digital cuando esté el pago
              online.
            </p>
          </Link>
        </div>

        <StoreFeaturedSection
          products={[...featuredProducts, ...featuredDesigns]}
        />
      </section>
    </div>
  );
}
