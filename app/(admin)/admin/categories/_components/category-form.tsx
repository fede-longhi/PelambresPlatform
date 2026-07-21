'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
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
import {
  createStoreCategory,
  updateStoreCategory,
  type StoreCategoryFormState,
} from '@/lib/actions/store-category-actions';
import { STORE_PRODUCT_TYPES } from '@/lib/consts/store-consts';
import type { StoreCategory } from '@/types/store-definitions';

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

type CategoryFormProps = {
  mode: 'create' | 'edit';
  category?: StoreCategory;
};

export default function CategoryForm({ mode, category }: CategoryFormProps) {
  const initialState: StoreCategoryFormState = { message: null, errors: {} };
  const action =
    mode === 'create'
      ? createStoreCategory
      : updateStoreCategory.bind(null, category!.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [name, setName] = useState(
    (state.payload?.get('name') as string) || category?.name || ''
  );
  const [slug, setSlug] = useState(
    (state.payload?.get('slug') as string) || category?.slug || ''
  );
  const [productType, setProductType] = useState(
    (state.payload?.get('productType') as string) ||
      category?.productType ||
      'product'
  );
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
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
            {mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
          </h1>
          <p className="mt-1 text-slate-500">
            Las categorías se asignan a Artículos o a Diseños.
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

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
              if (!slugTouched) {
                setSlug(slugifyName(nextName));
              }
            }}
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
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className="bg-slate-50 font-mono text-sm text-slate-600"
            disabled={isPending}
            aria-describedby="slug-error"
          />
          <div id="slug-error" aria-live="polite" aria-atomic="true">
            {state.errors?.slug?.map((error) => (
              <p className="mt-1 text-xs text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productType">Tipo de tienda</Label>
          {mode === 'edit' ? (
            <>
              <input type="hidden" name="productType" value={productType} />
              <Input
                id="productType"
                value={
                  STORE_PRODUCT_TYPES.find((entry) => entry.value === productType)
                    ?.label ?? productType
                }
                disabled
              />
              <p className="text-xs text-slate-500">
                El tipo no se puede cambiar después de crear la categoría.
              </p>
            </>
          ) : (
            <>
              <input type="hidden" name="productType" value={productType} />
              <Select
                value={productType}
                onValueChange={setProductType}
                disabled={isPending}
              >
                <SelectTrigger id="productType" aria-describedby="productType-error">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORE_PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          <div id="productType-error" aria-live="polite" aria-atomic="true">
            {state.errors?.productType?.map((error) => (
              <p className="mt-1 text-xs text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={
              state.payload
                ? state.payload.get('isActive') === 'true' ||
                  state.payload.get('isActive') === 'on'
                : category
                  ? category.isActive
                  : true
            }
            disabled={isPending}
            className="size-4 rounded border-slate-300"
          />
          Activa (visible en la tienda)
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Link href="/admin/categories">
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 size-4" />
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
