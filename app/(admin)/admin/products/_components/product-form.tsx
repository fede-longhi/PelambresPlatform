'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Save, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import {
  createStoreProduct,
  updateStoreProduct,
  type StoreProductFormState,
} from '@/lib/actions/store-product-actions';
import {
  PRODUCT_FULFILLMENT_MESSAGE,
  STORE_CURRENCIES,
  STORE_PRODUCT_TYPES,
} from '@/lib/consts/store-consts';
import type {
  StoreCategory,
  StoreProduct,
  StoreProductType,
} from '@/types/store-definitions';
import { ProductCategoryPicker } from './product-category-picker';
import { ProductImagesInput } from './product-images-input';
import { ProductTagsInput } from './product-tags-input';
import { StatusToggleButton } from './status-toggle-button';

type ProductFormProps = {
  mode: 'create' | 'edit';
  product?: StoreProduct;
  categories: StoreCategory[];
};

export default function ProductForm({
  mode,
  product,
  categories,
}: ProductFormProps) {
  const initialState: StoreProductFormState = { message: null, errors: {} };
  const action =
    mode === 'create'
      ? createStoreProduct
      : updateStoreProduct.bind(null, product!.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [name, setName] = useState(
    (state.payload?.get('name') as string) || product?.name || ''
  );
  const [productType, setProductType] = useState<StoreProductType>(
    ((state.payload?.get('productType') as string) ||
      product?.productType ||
      'product') as StoreProductType
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    () => {
      if (state.payload) {
        return state.payload.getAll('categoryIds').map(String);
      }
      return product?.categories.map((category) => category.id) ?? [];
    }
  );
  const [isPublished, setIsPublished] = useState(() => {
    if (state.payload) {
      const value = state.payload.get('isPublished');
      return value === 'true' || value === 'on';
    }
    return Boolean(product?.isPublished);
  });
  const [isFeatured, setIsFeatured] = useState(() => {
    if (state.payload) {
      const value = state.payload.get('isFeatured');
      return value === 'true' || value === 'on';
    }
    return Boolean(product?.isFeatured);
  });

  const categoriesForType = useMemo(
    () => categories.filter((category) => category.productType === productType),
    [categories, productType]
  );

  const handleTypeChange = (nextType: StoreProductType) => {
    setProductType(nextType);
    setSelectedCategoryIds((current) =>
      current.filter((categoryId) =>
        categories.some(
          (category) =>
            category.id === categoryId && category.productType === nextType
        )
      )
    );
  };

  const defaultPrice =
    (state.payload?.get('price') as string) ||
    (product ? (product.priceCents / 100).toFixed(2) : '');

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-10">
      <div className="flex items-center gap-4">
        <Link href={product ? `/admin/products/${product.id}` : '/admin/products'}>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled={isPending}
            type="button"
          >
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {mode === 'create' ? 'Nuevo artículo' : 'Editar artículo'}
          </h1>
          <p className="mt-1 text-slate-500">
            Artículos físicos o diseños digitales para la tienda.
          </p>
        </div>
      </div>

      <form
        action={formAction}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        aria-busy={isPending}
      >
        <div aria-live="polite" aria-atomic="true">
          {state.success === false && state.message && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500">
              <p>{state.message}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              aria-describedby="name-error"
            />
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name?.map((error) => (
                <p className="mt-1 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productType">Tipo</Label>
            <input type="hidden" name="productType" value={productType} />
            <Select
              value={productType}
              onValueChange={(value) =>
                handleTypeChange(value as StoreProductType)
              }
              disabled={isPending}
            >
              <SelectTrigger id="productType" aria-describedby="productType-error">
                <SelectValue placeholder="Seleccioná un tipo..." />
              </SelectTrigger>
              <SelectContent>
                {STORE_PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div id="productType-error" aria-live="polite" aria-atomic="true">
              {state.errors?.productType?.map((error) => (
                <p className="mt-1 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
            {productType === 'product' && (
              <p className="text-xs text-slate-500">
                {PRODUCT_FULFILLMENT_MESSAGE}
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
            <div>
              <p className="text-sm font-medium text-slate-900">Precio</p>
              <p className="text-xs text-slate-500">
                Precio de lista, moneda y descuento opcional.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={defaultPrice}
                  disabled={isPending}
                  aria-describedby="price-error"
                />
                <div id="price-error" aria-live="polite" aria-atomic="true">
                  {state.errors?.price?.map((error) => (
                    <p className="mt-1 text-xs text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  name="currency"
                  defaultValue={
                    (state.payload?.get('currency') as string) ||
                    product?.currency ||
                    'ARS'
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="currency" aria-describedby="currency-error">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div id="currency-error" aria-live="polite" aria-atomic="true">
                  {state.errors?.currency?.map((error) => (
                    <p className="mt-1 text-xs text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="discountPercent">Descuento (%)</Label>
              <Input
                id="discountPercent"
                name="discountPercent"
                type="number"
                min="1"
                max="100"
                step="1"
                placeholder="Sin descuento"
                defaultValue={
                  (state.payload?.get('discountPercent') as string) ||
                  (product?.discountPercent != null
                    ? String(product.discountPercent)
                    : '')
                }
                disabled={isPending}
                aria-describedby="discountPercent-hint discountPercent-error"
              />
              <p id="discountPercent-hint" className="text-xs text-slate-500">
                Opcional. Ejemplo: 20 = 20% off. El precio de lista queda tachado
                en la tienda.
              </p>
              <div id="discountPercent-error" aria-live="polite" aria-atomic="true">
                {state.errors?.discountPercent?.map((error) => (
                  <p className="mt-1 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {productType === 'product' && (
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                defaultValue={
                  (state.payload?.get('stock') as string) ||
                  (product?.stock != null ? String(product.stock) : '0')
                }
                disabled={isPending}
                aria-describedby="stock-error"
              />
              <div id="stock-error" aria-live="polite" aria-atomic="true">
                {state.errors?.stock?.map((error) => (
                  <p className="mt-1 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 md:col-span-2">
            <ProductCategoryPicker
              productType={productType}
              availableCategories={categoriesForType}
              selectedIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
              disabled={isPending}
              errorId="categoryIds-error"
            />
            <div id="categoryIds-error" aria-live="polite" aria-atomic="true">
              {state.errors?.categoryIds?.map((error) => (
                <p className="mt-1 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-3 md:col-span-2">
            <ProductTagsInput
              initialTags={
                state.payload
                  ? state.payload.getAll('tags').map(String)
                  : (product?.tags ?? [])
              }
              disabled={isPending}
              errorId="tags-error"
            />
            <div id="tags-error" aria-live="polite" aria-atomic="true">
              {state.errors?.tags?.map((error) => (
                <p className="mt-1 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <RichTextEditor
              name="description"
              label="Descripción"
              initialHtml={
                (state.payload?.get('description') as string) ||
                product?.description ||
                ''
              }
              disabled={isPending}
              errorId="description-error"
            />
            <div id="description-error" aria-live="polite" aria-atomic="true">
              {state.errors?.description?.map((error) => (
                <p className="mt-1 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <ProductImagesInput
              initialImages={product?.images}
              disabled={isPending}
              errorId="image-error"
            />
            <div id="image-error" aria-live="polite" aria-atomic="true">
              {state.errors?.image?.map((error) => (
                <p className="mt-1 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>

          {productType === 'design' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="digitalFile">Archivo de diseño</Label>
              {product?.digitalFileUrl && (
                <div className="mb-2 space-y-2">
                  <a
                    href={product.digitalFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Ver archivo actual
                  </a>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="removeDigitalFile"
                      value="true"
                      disabled={isPending}
                    />
                    Quitar archivo actual
                  </label>
                </div>
              )}
              <Input
                id="digitalFile"
                name="digitalFile"
                type="file"
                accept=".stl,.3mf,.obj,.zip,.rar,.7z,.step,.stp"
                disabled={isPending}
                aria-describedby="digitalFile-error"
              />
              <div id="digitalFile-error" aria-live="polite" aria-atomic="true">
                {state.errors?.digitalFile?.map((error) => (
                  <p className="mt-1 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 md:col-span-2">
            <div>
              <p className="text-sm font-medium text-slate-900">Visibilidad</p>
              <p className="text-xs text-slate-500">
                Prendé o apagá publicación y destacado.
              </p>
            </div>
            <input
              type="hidden"
              name="isPublished"
              value={isPublished ? 'true' : 'false'}
            />
            <input
              type="hidden"
              name="isFeatured"
              value={isFeatured ? 'true' : 'false'}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatusToggleButton
                pressed={isPublished}
                onPressedChange={setIsPublished}
                disabled={isPending}
                label="Publicado en la tienda"
                description="Visible en el catálogo público"
                iconOn={Eye}
                iconOff={EyeOff}
                activeClassName="border-emerald-300 bg-emerald-50 text-emerald-700"
              />
              <StatusToggleButton
                pressed={isFeatured}
                onPressedChange={setIsFeatured}
                disabled={isPending}
                label="Destacado"
                description="Aparece en el hub de la tienda"
                iconOn={Star}
                iconOff={StarOff}
                activeClassName="border-amber-300 bg-amber-50 text-amber-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href={product ? `/admin/products/${product.id}` : '/admin/products'}
          >
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 size-4" />
            {isPending
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear artículo'
                : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
