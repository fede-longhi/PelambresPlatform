import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fetchPublishedStoreProductById } from '@/lib/data/store-product-data';
import {
  PRODUCT_FULFILLMENT_MESSAGE,
  STORE_WHATSAPP_COORDINATION_LEGEND,
  buildStoreMailUrl,
  buildStoreWhatsAppUrl,
  getStoreCatalogHref,
  getStoreProductHref,
  getStoreProductTypeLabel,
  parseStoreTypeFromPath,
} from '@/lib/consts/store-consts';
import { StoreBreadcrumbs } from '../../_components/store-breadcrumbs';
import { StorePurchaseControls } from '../../_components/store-purchase-controls';
import { StorePriceDisplay } from '../../_components/store-price-display';
import { StoreProductGallery } from '../../_components/store-product-gallery';
import { RichTextContent } from '@/components/shared/rich-text-content';
import { isRichTextEmpty, richTextToPlainText } from '@/lib/utils/sanitize-html';

type StoreProductPageProps = {
  params: Promise<{ storeType: string; id: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: StoreProductPageProps): Promise<Metadata> {
  const { storeType, id } = await params;
  const productType = parseStoreTypeFromPath(storeType);
  if (!productType) {
    return { title: 'Artículo no encontrado' };
  }

  const product = await fetchPublishedStoreProductById(productType, id);
  if (!product) {
    return { title: 'Artículo no encontrado' };
  }

  return {
    title: `${product.name} | ${getStoreProductTypeLabel(productType)}`,
    description: isRichTextEmpty(product.description)
      ? `${product.name} en la tienda de Pelambres 3D.`
      : richTextToPlainText(product.description).slice(0, 160),
  };
}

export default async function StoreProductDetailPage({
  params,
}: StoreProductPageProps) {
  const { storeType, id } = await params;
  const productType = parseStoreTypeFromPath(storeType);

  if (!productType) {
    notFound();
  }

  const product = await fetchPublishedStoreProductById(productType, id);
  if (!product) {
    notFound();
  }

  const isDesign = product.productType === 'design';
  const isOutOfStock =
    product.productType === 'product' && (product.stock ?? 0) <= 0;
  const productHref = getStoreProductHref(product.productType, product.id);
  const whatsappUrl = buildStoreWhatsAppUrl(product.name, productHref);
  const mailUrl = buildStoreMailUrl(product.name, productHref);
  const catalogHref = getStoreCatalogHref(productType);
  const canCheckout = !isOutOfStock;

  return (
    <div className="min-h-screen bg-muted pb-24 font-sans">
      <div className="bg-background px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <StoreBreadcrumbs
            items={[
              { label: 'Inicio', href: '/store' },
              {
                label: getStoreProductTypeLabel(productType),
                href: catalogHref,
              },
              { label: product.name },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            {product.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
            {isOutOfStock && <Badge variant="outline">Sin stock</Badge>}
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-heading-foreground md:text-5xl">
            {product.name}
          </h1>
          <div className="mt-4">
            <StorePriceDisplay
              priceCents={product.priceCents}
              discountPercent={product.discountPercent}
              currency={product.currency}
              size="detail"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2">
        <StoreProductGallery
          images={product.images}
          productName={product.name}
          productType={product.productType}
        />

        <div className="space-y-8">
          {!isRichTextEmpty(product.description) && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Descripción
              </h2>
              <RichTextContent html={product.description} />
            </section>
          )}

          {product.tags.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Tags</h2>
              <ul className="flex flex-wrap gap-2" aria-label="Tags">
                {product.tags.map((tag) => (
                  <li key={tag}>
                    <Badge variant="secondary">{tag}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              {isDesign ? 'Entrega' : 'Retiro y coordinación'}
            </h2>
            <p className="text-sm text-slate-600">
              {isDesign
                ? 'Archivo digital. Después del pago vas a poder descargarlo desde tu compra (próximamente en el portal).'
                : PRODUCT_FULFILLMENT_MESSAGE}
            </p>
            {!isDesign && !isOutOfStock && (
              <p className="mt-2 text-sm text-slate-500">
                Stock disponible: {product.stock}
              </p>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Comprar</h2>
            {canCheckout ? (
              <StorePurchaseControls
                productId={product.id}
                productType={product.productType}
                productName={product.name}
                maxQuantity={
                  product.productType === 'product' ? product.stock : null
                }
                disabled={isOutOfStock}
              />
            ) : (
              <p className="text-sm text-slate-500">
                El pago online no está disponible por ahora. Escribinos para
                coordinar.
              </p>
            )}
            <p className="rounded-xl border border-whatsapp/20 bg-whatsapp/10 px-4 py-3 text-sm text-slate-700">
              {STORE_WHATSAPP_COORDINATION_LEGEND}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'inline-flex items-center justify-center gap-2 border-transparent !bg-[#25D366] !text-white hover:!bg-[#1ebe57]'
                )}
              >
                <MessageCircle size={18} aria-hidden="true" />
                WhatsApp
              </a>
              <a
                href={mailUrl}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'inline-flex items-center justify-center gap-2 border-transparent !bg-mail !text-mail-foreground hover:!bg-mail/90'
                )}
              >
                <Mail size={18} aria-hidden="true" />
                Mail
              </a>
            </div>
            {isOutOfStock && (
              <p className="text-sm text-amber-700">
                Este producto no tiene stock ahora. Igual podés consultar por
                disponibilidad.
              </p>
            )}
          </section>

          <Button
            asChild
            variant="ghost"
            className="px-0 text-muted-foreground hover:bg-transparent hover:text-primary"
          >
            <Link href={catalogHref} className="inline-flex items-center gap-2">
              <ArrowLeft size={16} aria-hidden="true" />
              Seguir mirando el catálogo
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
