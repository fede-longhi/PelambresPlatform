'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { canAccessAdmin } from '@/lib/auth/permissions';
import {
  getStoreCatalogHref,
  STORE_PRODUCT_TYPES,
} from '@/lib/consts/store-consts';
import {
  fetchNextStoreCategorySortOrder,
  fetchStoreCategoryById,
} from '@/lib/data/store-category-data';
import type { StoreProductType } from '@/types/store-definitions';

async function requireAdminSession() {
  const session = await auth();
  const sessionUser = session?.user;

  if (
    !sessionUser?.id ||
    !canAccessAdmin({
      id: sessionUser.id,
      email: sessionUser.email ?? '',
      name: sessionUser.name ?? '',
      role: sessionUser.role,
      isActive: sessionUser.isActive,
      mustChangePassword: sessionUser.mustChangePassword,
    })
  ) {
    throw new Error('No autorizado.');
  }

  return sessionUser;
}

function revalidateCategoryPaths(productType: StoreProductType) {
  revalidatePath('/admin/categories');
  revalidatePath('/store');
  revalidatePath(getStoreCatalogHref(productType));
}

const productTypeValues = STORE_PRODUCT_TYPES.map((entry) => entry.value) as [
  StoreProductType,
  ...StoreProductType[],
];

const CategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    .max(120, { message: 'El nombre es demasiado largo.' }),
  slug: z
    .string()
    .trim()
    .min(2, { message: 'El slug debe tener al menos 2 caracteres.' })
    .max(120, { message: 'El slug es demasiado largo.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Usá solo minúsculas, números y guiones.',
    }),
  productType: z.enum(productTypeValues, {
    message: 'Seleccioná un tipo.',
  }),
  isActive: z.boolean(),
});

export type StoreCategoryFormState = {
  errors?: {
    name?: string[];
    slug?: string[];
    productType?: string[];
    isActive?: string[];
  };
  message?: string | null;
  success?: boolean;
  payload?: FormData;
};

function parseFormBoolean(value: FormDataEntryValue | null): boolean {
  return value === 'on' || value === 'true' || value === '1';
}

function toFormError(
  message: string,
  formData: FormData,
  errors?: StoreCategoryFormState['errors']
): StoreCategoryFormState {
  return {
    errors: errors ?? {},
    message,
    success: false,
    payload: formData,
  };
}

export async function createStoreCategory(
  _prevState: StoreCategoryFormState,
  formData: FormData
): Promise<StoreCategoryFormState> {
  await requireAdminSession();

  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    productType: formData.get('productType'),
    isActive: parseFormBoolean(formData.get('isActive')),
  });

  if (!validatedFields.success) {
    return toFormError('Revisá los campos e intentá de nuevo.', formData, {
      ...validatedFields.error.flatten().fieldErrors,
    });
  }

  const { name, slug, productType, isActive } = validatedFields.data;
  const sortOrder = await fetchNextStoreCategorySortOrder(productType);

  try {
    await sql`
      INSERT INTO store_categories (name, slug, product_type, sort_order, is_active)
      VALUES (${name}, ${slug}, ${productType}, ${sortOrder}, ${isActive})
    `;
  } catch (error) {
    console.error(error);
    const isDuplicate =
      error instanceof Error && /unique|duplicate/i.test(error.message);
    return toFormError(
      isDuplicate
        ? 'Ya existe una categoría con ese slug para este tipo.'
        : 'No se pudo crear la categoría.',
      formData,
      isDuplicate ? { slug: ['Elegí otro slug.'] } : undefined
    );
  }

  revalidateCategoryPaths(productType);
  redirect('/admin/categories');
}

export type CreateStoreCategoryInlineResult = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    slug?: string[];
    productType?: string[];
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    productType: StoreProductType;
    isActive: boolean;
  };
};

export async function createStoreCategoryInline(input: {
  name: string;
  slug: string;
  productType: StoreProductType;
  isActive?: boolean;
}): Promise<CreateStoreCategoryInlineResult> {
  await requireAdminSession();

  const validatedFields = CategorySchema.safeParse({
    name: input.name,
    slug: input.slug,
    productType: input.productType,
    isActive: input.isActive ?? true,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Revisá los campos e intentá de nuevo.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, slug, productType, isActive } = validatedFields.data;
  const sortOrder = await fetchNextStoreCategorySortOrder(productType);

  try {
    const rows = await sql<
      {
        id: string;
        name: string;
        slug: string;
        productType: StoreProductType;
        isActive: boolean;
      }[]
    >`
      INSERT INTO store_categories (name, slug, product_type, sort_order, is_active)
      VALUES (${name}, ${slug}, ${productType}, ${sortOrder}, ${isActive})
      RETURNING
        id,
        name,
        slug,
        product_type as "productType",
        is_active as "isActive"
    `;

    const category = rows[0];
    if (!category) {
      return {
        success: false,
        message: 'No se pudo crear la categoría.',
      };
    }

    revalidateCategoryPaths(productType);
    return {
      success: true,
      message: 'Categoría creada.',
      category,
    };
  } catch (error) {
    console.error(error);
    const isDuplicate =
      error instanceof Error && /unique|duplicate/i.test(error.message);
    return {
      success: false,
      message: isDuplicate
        ? 'Ya existe una categoría con ese slug para este tipo.'
        : 'No se pudo crear la categoría.',
      errors: isDuplicate ? { slug: ['Elegí otro slug.'] } : undefined,
    };
  }
}

export async function updateStoreCategory(
  id: string,
  _prevState: StoreCategoryFormState,
  formData: FormData
): Promise<StoreCategoryFormState> {
  await requireAdminSession();

  const existing = await fetchStoreCategoryById(id);
  if (!existing) {
    return toFormError('No encontramos esa categoría.', formData);
  }

  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    productType: existing.productType,
    isActive: parseFormBoolean(formData.get('isActive')),
  });

  if (!validatedFields.success) {
    return toFormError('Revisá los campos e intentá de nuevo.', formData, {
      ...validatedFields.error.flatten().fieldErrors,
    });
  }

  const { name, slug, isActive } = validatedFields.data;

  try {
    await sql`
      UPDATE store_categories
      SET
        name = ${name},
        slug = ${slug},
        is_active = ${isActive},
        updated_at = NOW()
      WHERE id = ${id}
        AND deleted_at IS NULL
    `;
  } catch (error) {
    console.error(error);
    const isDuplicate =
      error instanceof Error && /unique|duplicate/i.test(error.message);
    return toFormError(
      isDuplicate
        ? 'Ya existe una categoría con ese slug para este tipo.'
        : 'No se pudo actualizar la categoría.',
      formData,
      isDuplicate ? { slug: ['Elegí otro slug.'] } : undefined
    );
  }

  revalidateCategoryPaths(existing.productType);
  redirect('/admin/categories');
}

export async function deleteStoreCategory(id: string) {
  await requireAdminSession();

  const existing = await fetchStoreCategoryById(id);
  if (!existing) {
    throw new Error('Categoría no encontrada.');
  }

  try {
    await sql`
      UPDATE store_categories
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
        AND deleted_at IS NULL
    `;
    await sql`
      DELETE FROM store_product_categories
      WHERE category_id = ${id}
    `;
  } catch (error) {
    console.error(error);
    throw new Error('No se pudo eliminar la categoría.');
  }

  revalidateCategoryPaths(existing.productType);
  redirect('/admin/categories');
}

export async function reorderStoreCategories(
  productType: StoreProductType,
  orderedIds: string[]
) {
  await requireAdminSession();

  if (!productTypeValues.includes(productType)) {
    throw new Error('Tipo inválido.');
  }

  if (orderedIds.length === 0) {
    return { success: true as const };
  }

  try {
    await sql.begin(async (transaction) => {
      for (let index = 0; index < orderedIds.length; index += 1) {
        const categoryId = orderedIds[index];
        await transaction`
          UPDATE store_categories
          SET sort_order = ${index}, updated_at = NOW()
          WHERE id = ${categoryId}
            AND product_type = ${productType}
            AND deleted_at IS NULL
        `;
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error('No se pudo reordenar las categorías.');
  }

  revalidateCategoryPaths(productType);
  return { success: true as const };
}
