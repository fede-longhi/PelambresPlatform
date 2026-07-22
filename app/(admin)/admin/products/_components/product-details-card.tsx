'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgePercent,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Minus,
  Pencil,
  Plus,
  Star,
  StarOff,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  adjustStoreProductStock,
  setStoreProductFeatured,
  setStoreProductPublished,
  updateStoreProductDiscount,
  updateStoreProductPrice,
} from '@/lib/actions/store-product-actions';
import {
  formatStoreDiscountLabel,
  formatStorePrice,
  getStoreCatalogHref,
  getStoreFinalPriceCents,
  getStoreProductHref,
  getStoreProductTypeLabel,
  hasStoreDiscount,
  PRODUCT_FULFILLMENT_MESSAGE,
} from '@/lib/consts/store-consts';
import { RichTextContent } from '@/components/shared/rich-text-content';
import { cn } from '@/lib/utils';
import type { StoreProduct } from '@/types/store-definitions';

type ProductDetailsCardProps = {
  product: StoreProduct;
};

export function ProductDetailsCard({ product }: ProductDetailsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stock, setStock] = useState(product.stock ?? 0);
  const [priceCents, setPriceCents] = useState(product.priceCents);
  const [discountPercent, setDiscountPercent] = useState(
    product.discountPercent
  );
  const [isPublished, setIsPublished] = useState(product.isPublished);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState(
    (product.priceCents / 100).toFixed(2)
  );
  const [priceError, setPriceError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [discountDraft, setDiscountDraft] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const publicHref = getStoreProductHref(product.productType, product.id);
  const catalogHref = getStoreCatalogHref(product.productType);

  const handleStockAdjust = (delta: 1 | -1) => {
    setStockError(null);
    const previousStock = stock;
    setStock((current) => Math.max(0, current + delta));

    startTransition(async () => {
      try {
        const result = await adjustStoreProductStock(product.id, delta);
        setStock(result.stock);
      } catch (error) {
        console.error(error);
        setStock(previousStock);
        setStockError('No se pudo actualizar el stock.');
      }
    });
  };

  const startPriceEdit = () => {
    setPriceDraft((priceCents / 100).toFixed(2));
    setPriceError(null);
    setIsEditingPrice(true);
  };

  const cancelPriceEdit = () => {
    setIsEditingPrice(false);
    setPriceDraft((priceCents / 100).toFixed(2));
    setPriceError(null);
  };

  const savePrice = () => {
    const parsedPrice = Number(priceDraft.replace(',', '.'));
    setPriceError(null);

    startTransition(async () => {
      const result = await updateStoreProductPrice(product.id, parsedPrice);
      if (!result.success || result.priceCents == null) {
        setPriceError(result.message ?? 'No se pudo actualizar el precio.');
        return;
      }

      setPriceCents(result.priceCents);
      setIsEditingPrice(false);
    });
  };

  const startDiscountEdit = () => {
    setDiscountDraft(
      hasStoreDiscount(discountPercent) ? String(discountPercent) : ''
    );
    setDiscountError(null);
    setIsEditingDiscount(true);
  };

  const cancelDiscountEdit = () => {
    setIsEditingDiscount(false);
    setDiscountDraft('');
    setDiscountError(null);
  };

  const saveDiscount = () => {
    const parsedDiscount = Number.parseInt(discountDraft, 10);
    setDiscountError(null);

    startTransition(async () => {
      const result = await updateStoreProductDiscount(
        product.id,
        parsedDiscount
      );
      if (!result.success || result.discountPercent == null) {
        setDiscountError(
          result.message ?? 'No se pudo actualizar el descuento.'
        );
        return;
      }

      setDiscountPercent(result.discountPercent);
      setIsEditingDiscount(false);
    });
  };

  const removeDiscount = () => {
    setDiscountError(null);

    startTransition(async () => {
      const result = await updateStoreProductDiscount(product.id, null);
      if (!result.success) {
        setDiscountError(result.message ?? 'No se pudo quitar el descuento.');
        return;
      }

      setDiscountPercent(null);
      setIsEditingDiscount(false);
    });
  };

  const togglePublished = () => {
    const nextIsPublished = !isPublished;
    setStatusError(null);

    startTransition(async () => {
      const result = await setStoreProductPublished(
        product.id,
        nextIsPublished
      );
      if (!result.success) {
        setStatusError(
          result.message ?? 'No se pudo actualizar la publicación.'
        );
        return;
      }

      setIsPublished(result.isPublished ?? nextIsPublished);
      router.refresh();
    });
  };

  const toggleFeatured = () => {
    const nextIsFeatured = !isFeatured;
    setStatusError(null);

    startTransition(async () => {
      const result = await setStoreProductFeatured(product.id, nextIsFeatured);
      if (!result.success) {
        setStatusError(
          result.message ?? 'No se pudo actualizar el destacado.'
        );
        return;
      }

      setIsFeatured(result.isFeatured ?? nextIsFeatured);
      router.refresh();
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Datos del artículo
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={togglePublished}
            disabled={isPending}
            aria-pressed={isPublished}
            aria-label={isPublished ? 'Despublicar' : 'Publicar'}
            title={isPublished ? 'Publicado — click para despublicar' : 'No publicado — click para publicar'}
            className={cn(
              isPublished
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800'
                : 'text-slate-400 hover:text-slate-700'
            )}
          >
            {isPublished ? (
              <Eye size={18} aria-hidden="true" />
            ) : (
              <EyeOff size={18} aria-hidden="true" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggleFeatured}
            disabled={isPending}
            aria-pressed={isFeatured}
            aria-label={isFeatured ? 'Quitar destacado' : 'Marcar como destacado'}
            title={
              isFeatured
                ? 'Destacado — click para quitar'
                : 'No destacado — click para destacar'
            }
            className={cn(
              isFeatured
                ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800'
                : 'text-slate-400 hover:text-slate-700'
            )}
          >
            {isFeatured ? (
              <Star size={18} aria-hidden="true" />
            ) : (
              <StarOff size={18} aria-hidden="true" />
            )}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/products/${product.id}/edit`}>
              <Pencil size={16} className="mr-2" aria-hidden="true" />
              Editar artículo
            </Link>
          </Button>
        </div>
      </div>
      {statusError && (
        <p className="mb-4 text-xs text-red-500" role="alert">
          {statusError}
        </p>
      )}

      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tipo
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            {getStoreProductTypeLabel(product.productType)}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Categorías
          </dt>
          <dd className="mt-2">
            {product.categories.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="Categorías">
                {product.categories.map((category) => (
                  <li
                    key={category.id}
                    className="rounded-full border border-secondary bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-sm text-slate-900">Sin categoría</span>
            )}
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tags
          </dt>
          <dd className="mt-2">
            {product.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="Tags">
                {product.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-sm text-slate-900">Sin tags</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Precio
          </dt>
          <dd className="mt-1">
            {isEditingPrice ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceDraft}
                    onChange={(event) => setPriceDraft(event.target.value)}
                    disabled={isPending}
                    className="max-w-[10rem]"
                    aria-label="Nuevo precio"
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        savePrice();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelPriceEdit();
                      }
                    }}
                  />
                  <span className="text-sm text-slate-500">{product.currency}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={savePrice}
                    disabled={isPending}
                    aria-label="Guardar precio"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={cancelPriceEdit}
                    disabled={isPending}
                    aria-label="Cancelar edición de precio"
                  >
                    <X size={16} />
                  </Button>
                </div>
                {priceError && (
                  <p className="text-xs text-red-500" role="alert">
                    {priceError}
                  </p>
                )}
              </div>
            ) : isEditingDiscount ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {hasStoreDiscount(discountPercent) ? (
                    <>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatStorePrice(
                          getStoreFinalPriceCents(priceCents, discountPercent),
                          product.currency
                        )}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        {formatStorePrice(priceCents, product.currency)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-900">
                      {formatStorePrice(priceCents, product.currency)}
                    </span>
                  )}
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={discountDraft}
                    onChange={(event) => setDiscountDraft(event.target.value)}
                    disabled={isPending}
                    className="max-w-[5rem]"
                    aria-label="Porcentaje de descuento"
                    placeholder="%"
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        saveDiscount();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelDiscountEdit();
                      }
                    }}
                  />
                  <span className="text-sm text-slate-500">%</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={saveDiscount}
                    disabled={isPending}
                    aria-label="Guardar descuento"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={cancelDiscountEdit}
                    disabled={isPending}
                    aria-label="Cancelar edición de descuento"
                  >
                    <X size={16} />
                  </Button>
                </div>
                {discountError && (
                  <p className="text-xs text-red-500" role="alert">
                    {discountError}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {hasStoreDiscount(discountPercent) ? (
                    <>
                      <button
                        type="button"
                        onClick={startPriceEdit}
                        disabled={isPending}
                        className="inline-flex flex-wrap items-center gap-2 rounded-sm text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        aria-label="Editar precio"
                      >
                        <span className="text-sm font-semibold text-slate-900">
                          {formatStorePrice(
                            getStoreFinalPriceCents(priceCents, discountPercent),
                            product.currency
                          )}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {formatStorePrice(priceCents, product.currency)}
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            disabled={isPending}
                            className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                            aria-label="Opciones de descuento"
                          >
                            {formatStoreDiscountLabel(discountPercent!)}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onSelect={startDiscountEdit}
                            disabled={isPending}
                          >
                            <Pencil size={14} />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={removeDiscount}
                            disabled={isPending}
                            className="text-red-600 focus:text-red-600"
                          >
                            <X size={14} />
                            Quitar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={startPriceEdit}
                        disabled={isPending}
                        className="text-sm text-slate-900 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        aria-label="Editar precio"
                      >
                        {formatStorePrice(priceCents, product.currency)}
                      </button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={startDiscountEdit}
                        disabled={isPending}
                        aria-label="Agregar descuento"
                        className="size-7 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800"
                      >
                        <BadgePercent size={14} />
                      </Button>
                    </>
                  )}
                </div>
                {discountError && (
                  <p className="text-xs text-red-500" role="alert">
                    {discountError}
                  </p>
                )}
              </div>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            URL pública
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            <a
              href={publicHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 break-all text-primary hover:underline"
            >
              <span>{publicHref}</span>
              <ExternalLink
                size={14}
                className="shrink-0"
                aria-hidden="true"
              />
              <span className="sr-only">(abre en una pestaña nueva)</span>
            </a>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Catálogo
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            <Link href={catalogHref} className="text-primary hover:underline">
              {catalogHref}
            </Link>
          </dd>
        </div>

        {product.productType === 'product' && (
          <>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Stock
              </dt>
              <dd className="mt-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => handleStockAdjust(-1)}
                    disabled={isPending || stock <= 0}
                    aria-label="Disminuir stock"
                    className="size-6 rounded-full"
                  >
                    <Minus size={12} />
                  </Button>
                  <span className="min-w-8 text-center text-sm font-medium text-slate-900">
                    {stock}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => handleStockAdjust(1)}
                    disabled={isPending}
                    aria-label="Aumentar stock"
                    className="size-6 rounded-full"
                  >
                    <Plus size={12} />
                  </Button>
                </div>
                {stockError && (
                  <p className="mt-1 text-xs text-red-500" role="alert">
                    {stockError}
                  </p>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Entrega
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {PRODUCT_FULFILLMENT_MESSAGE}
              </dd>
            </div>
          </>
        )}

        {product.productType === 'design' && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Archivo
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {product.digitalFileUrl ? (
                <a
                  href={product.digitalFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Descargar archivo
                </a>
              ) : (
                'Sin archivo'
              )}
            </dd>
          </div>
        )}

        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Descripción
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            <RichTextContent
              html={product.description}
              emptyFallback="Sin descripción"
              className="text-sm text-slate-900"
            />
          </dd>
        </div>
      </dl>
    </section>
  );
}
