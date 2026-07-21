'use server';

import { put, del } from '@vercel/blob';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { canAccessAdmin } from '@/lib/auth/permissions';
import {
  getStoreCatalogHref,
  getStoreProductHref,
  STORE_CURRENCIES,
  STORE_PRODUCT_FILE_ALLOWED_EXTENSIONS,
  STORE_PRODUCT_FILE_MAX_SIZE_BYTES,
  STORE_PRODUCT_IMAGE_ALLOWED_EXTENSIONS,
  STORE_PRODUCT_IMAGE_MAX_SIZE_BYTES,
  STORE_PRODUCTS_FOLDER,
} from '@/lib/consts/store-consts';
import { fetchStoreCategoryById } from '@/lib/data/store-category-data';
import { fetchStoreProductById } from '@/lib/data/store-product-data';
import type { StoreProductType } from '@/types/store-definitions';

function revalidateStorePaths(productType: StoreProductType, productId?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/store');
  revalidatePath(getStoreCatalogHref(productType));
  if (productId) {
    revalidatePath(getStoreProductHref(productType, productId));
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/admin/products/${productId}/edit`);
  }
}

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

const currencyValues = STORE_CURRENCIES.map((entry) => entry.value) as [
  string,
  ...string[],
];

const ProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
      .max(200, { message: 'El nombre es demasiado largo.' }),
    description: z
      .string()
      .trim()
      .max(5000, { message: 'La descripción es demasiado larga.' })
      .optional()
      .or(z.literal('')),
    productType: z.enum(['product', 'design'], {
      message: 'Seleccioná un tipo.',
    }),
    categoryIds: z.array(z.string().uuid({ message: 'Categoría inválida.' })),
    price: z.coerce
      .number({ message: 'Ingresá un precio válido.' })
      .min(0, { message: 'El precio no puede ser negativo.' }),
    discountPercent: z
      .number({ message: 'Ingresá un descuento válido.' })
      .int()
      .min(1, { message: 'El descuento debe ser al menos 1%.' })
      .max(100, { message: 'El descuento no puede superar 100%.' })
      .nullable(),
    currency: z.enum(currencyValues, {
      message: 'Seleccioná una moneda.',
    }),
    stock: z.coerce.number().int().min(0).optional().nullable(),
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
  })
  .superRefine((data, context) => {
    if (data.productType === 'product') {
      if (
        data.stock === null ||
        data.stock === undefined ||
        Number.isNaN(data.stock)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stock'],
          message: 'Indicá el stock para productos.',
        });
      }
    }
  });

export type StoreProductFormState = {
  errors?: {
    name?: string[];
    description?: string[];
    productType?: string[];
    categoryIds?: string[];
    price?: string[];
    discountPercent?: string[];
    currency?: string[];
    stock?: string[];
    image?: string[];
    digitalFile?: string[];
    isPublished?: string[];
    isFeatured?: string[];
  };
  message?: string | null;
  success?: boolean;
  payload?: FormData;
};

function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex < 0) {
    return '';
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0 && value.name.length > 0;
}

function validateImageFile(file: File): string | null {
  const extension = getFileExtension(file.name);
  if (!STORE_PRODUCT_IMAGE_ALLOWED_EXTENSIONS.has(extension)) {
    return 'La imagen debe ser JPG, PNG, WEBP o GIF.';
  }
  if (file.size > STORE_PRODUCT_IMAGE_MAX_SIZE_BYTES) {
    return `La imagen supera el límite de ${STORE_PRODUCT_IMAGE_MAX_SIZE_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
}

function validateDigitalFile(file: File): string | null {
  const extension = getFileExtension(file.name);
  if (!STORE_PRODUCT_FILE_ALLOWED_EXTENSIONS.has(extension)) {
    return 'Usá STL, 3MF, OBJ, STEP/STP o un ZIP/RAR/7Z.';
  }
  if (file.size > STORE_PRODUCT_FILE_MAX_SIZE_BYTES) {
    return `El archivo supera el límite de ${STORE_PRODUCT_FILE_MAX_SIZE_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
}

async function uploadStoreBlob(file: File, folder: string) {
  const blob = await put(`${folder}/${file.name}`, file, {
    access: 'public',
  });
  return blob.downloadUrl;
}

async function deleteBlobUrlIfPresent(url: string | null | undefined) {
  if (!url) {
    return;
  }
  try {
    await del(url);
  } catch (error) {
    console.error('Failed to delete blob:', error);
  }
}

function parseFormBoolean(value: FormDataEntryValue | null): boolean {
  return value === 'on' || value === 'true' || value === '1';
}

function parseFormFields(formData: FormData) {
  const stockRaw = formData.get('stock');
  const stockValue =
    stockRaw === null || stockRaw === '' ? null : Number(stockRaw);

  const discountRaw = formData.get('discountPercent');
  const discountPercent =
    discountRaw === null || discountRaw === ''
      ? null
      : Number(discountRaw);

  const categoryIds = formData
    .getAll('categoryIds')
    .map(String)
    .filter((value) => value.length > 0);

  return {
    name: formData.get('name'),
    description: formData.get('description') || '',
    productType: formData.get('productType'),
    categoryIds,
    price: formData.get('price'),
    discountPercent,
    currency: formData.get('currency'),
    stock: stockValue,
    isPublished: parseFormBoolean(formData.get('isPublished')),
    isFeatured: parseFormBoolean(formData.get('isFeatured')),
  };
}

function priceToCents(price: number): number {
  return Math.round(price * 100);
}

function toFormError(
  message: string,
  formData: FormData,
  errors?: StoreProductFormState['errors']
): StoreProductFormState {
  return {
    errors: errors ?? {},
    message,
    success: false,
    payload: formData,
  };
}

async function resolveCategoryIds(
  categoryIds: string[],
  productType: StoreProductType,
  formData: FormData
): Promise<{ categoryIds: string[]; error?: StoreProductFormState }> {
  const uniqueIds = [...new Set(categoryIds)];

  for (const categoryId of uniqueIds) {
    const category = await fetchStoreCategoryById(categoryId);
    if (!category || category.productType !== productType) {
      return {
        categoryIds: [],
        error: toFormError(
          'Una o más categorías no corresponden a este tipo de artículo.',
          formData,
          { categoryIds: ['Elegí categorías válidas para este tipo.'] }
        ),
      };
    }
  }

  return { categoryIds: uniqueIds };
}

async function replaceProductCategories(
  productId: string,
  categoryIds: string[]
) {
  await sql`
    DELETE FROM store_product_categories
    WHERE product_id = ${productId}
  `;

  for (let index = 0; index < categoryIds.length; index += 1) {
    const categoryId = categoryIds[index];
    await sql`
      INSERT INTO store_product_categories (product_id, category_id, sort_order)
      VALUES (${productId}, ${categoryId}, ${index})
    `;
  }
}

export async function createStoreProduct(
  _prevState: StoreProductFormState,
  formData: FormData
): Promise<StoreProductFormState> {
  await requireAdminSession();

  const validatedFields = ProductSchema.safeParse(parseFormFields(formData));

  if (!validatedFields.success) {
    return toFormError('Revisá los campos e intentá de nuevo.', formData, {
      ...validatedFields.error.flatten().fieldErrors,
    });
  }

  const {
    name,
    description,
    productType,
    categoryIds: rawCategoryIds,
    price,
    discountPercent,
    currency,
    stock,
    isPublished,
    isFeatured,
  } = validatedFields.data;

  const resolvedCategories = await resolveCategoryIds(
    rawCategoryIds,
    productType,
    formData
  );
  if (resolvedCategories.error) {
    return resolvedCategories.error;
  }

  const imageFile = formData.get('image');
  const digitalFile = formData.get('digitalFile');

  let imageUrl: string | null = null;
  let digitalFileUrl: string | null = null;

  if (isUploadedFile(imageFile)) {
    const imageError = validateImageFile(imageFile);
    if (imageError) {
      return toFormError(imageError, formData, { image: [imageError] });
    }
  }

  if (productType === 'design' && isUploadedFile(digitalFile)) {
    const fileError = validateDigitalFile(digitalFile);
    if (fileError) {
      return toFormError(fileError, formData, { digitalFile: [fileError] });
    }
  }

  if (productType === 'design' && isPublished && !isUploadedFile(digitalFile)) {
    return toFormError(
      'Subí el archivo de diseño antes de publicar.',
      formData,
      { digitalFile: ['El archivo de diseño es obligatorio para publicar.'] }
    );
  }

  try {
    if (isUploadedFile(imageFile)) {
      imageUrl = await uploadStoreBlob(
        imageFile,
        `${STORE_PRODUCTS_FOLDER}/images`
      );
    }

    if (productType === 'design' && isUploadedFile(digitalFile)) {
      digitalFileUrl = await uploadStoreBlob(
        digitalFile,
        `${STORE_PRODUCTS_FOLDER}/files`
      );
    }
  } catch (error) {
    console.error(error);
    await deleteBlobUrlIfPresent(imageUrl);
    await deleteBlobUrlIfPresent(digitalFileUrl);
    return toFormError('No se pudieron subir los archivos.', formData);
  }

  const priceCents = priceToCents(price);
  const stockValue: number | null =
    productType === 'product' ? (stock ?? 0) : null;
  const descriptionValue = description?.trim() || null;

  let insertedId: string | null = null;

  try {
    const inserted = await sql<{ id: string }[]>`
      INSERT INTO store_products (
        name,
        description,
        product_type,
        price_cents,
        discount_percent,
        currency,
        stock,
        image_url,
        digital_file_url,
        is_published,
        is_featured
      )
      VALUES (
        ${name},
        ${descriptionValue},
        ${productType},
        ${priceCents},
        ${discountPercent},
        ${currency},
        ${stockValue},
        ${imageUrl},
        ${digitalFileUrl},
        ${isPublished},
        ${isFeatured}
      )
      RETURNING id
    `;

    insertedId = inserted[0]?.id ?? null;
    if (!insertedId) {
      throw new Error('Missing inserted product id.');
    }

    await replaceProductCategories(insertedId, resolvedCategories.categoryIds);
  } catch (error) {
    console.error(error);
    await deleteBlobUrlIfPresent(imageUrl);
    await deleteBlobUrlIfPresent(digitalFileUrl);
    return toFormError('No se pudo crear el artículo.', formData);
  }

  revalidateStorePaths(productType, insertedId ?? undefined);
  redirect('/admin/products');
}

export async function updateStoreProduct(
  id: string,
  _prevState: StoreProductFormState,
  formData: FormData
): Promise<StoreProductFormState> {
  await requireAdminSession();

  const existing = await fetchStoreProductById(id);
  if (!existing) {
    return toFormError('No encontramos ese artículo.', formData);
  }

  const validatedFields = ProductSchema.safeParse(parseFormFields(formData));

  if (!validatedFields.success) {
    return toFormError('Revisá los campos e intentá de nuevo.', formData, {
      ...validatedFields.error.flatten().fieldErrors,
    });
  }

  const {
    name,
    description,
    productType,
    categoryIds: rawCategoryIds,
    price,
    discountPercent,
    currency,
    stock,
    isPublished,
    isFeatured,
  } = validatedFields.data;

  const resolvedCategories = await resolveCategoryIds(
    rawCategoryIds,
    productType,
    formData
  );
  if (resolvedCategories.error) {
    return resolvedCategories.error;
  }

  const imageFile = formData.get('image');
  const digitalFile = formData.get('digitalFile');
  const removeImage = parseFormBoolean(formData.get('removeImage'));
  const removeDigitalFile = parseFormBoolean(formData.get('removeDigitalFile'));

  if (isUploadedFile(imageFile)) {
    const imageError = validateImageFile(imageFile);
    if (imageError) {
      return toFormError(imageError, formData, { image: [imageError] });
    }
  }

  if (productType === 'design' && isUploadedFile(digitalFile)) {
    const fileError = validateDigitalFile(digitalFile);
    if (fileError) {
      return toFormError(fileError, formData, { digitalFile: [fileError] });
    }
  }

  let nextImageUrl = existing.imageUrl;
  let nextDigitalFileUrl =
    productType === 'design' ? existing.digitalFileUrl : null;
  let uploadedImageUrl: string | null = null;
  let uploadedDigitalFileUrl: string | null = null;
  const blobsToDelete: string[] = [];

  if (removeImage && existing.imageUrl) {
    blobsToDelete.push(existing.imageUrl);
    nextImageUrl = null;
  }

  if (
    (productType !== 'design' || removeDigitalFile) &&
    existing.digitalFileUrl
  ) {
    blobsToDelete.push(existing.digitalFileUrl);
    if (productType !== 'design' || removeDigitalFile) {
      nextDigitalFileUrl = null;
    }
  }

  try {
    if (isUploadedFile(imageFile)) {
      uploadedImageUrl = await uploadStoreBlob(
        imageFile,
        `${STORE_PRODUCTS_FOLDER}/images`
      );
      if (existing.imageUrl) {
        blobsToDelete.push(existing.imageUrl);
      }
      nextImageUrl = uploadedImageUrl;
    }

    if (productType === 'design' && isUploadedFile(digitalFile)) {
      uploadedDigitalFileUrl = await uploadStoreBlob(
        digitalFile,
        `${STORE_PRODUCTS_FOLDER}/files`
      );
      if (existing.digitalFileUrl) {
        blobsToDelete.push(existing.digitalFileUrl);
      }
      nextDigitalFileUrl = uploadedDigitalFileUrl;
    }
  } catch (error) {
    console.error(error);
    await deleteBlobUrlIfPresent(uploadedImageUrl);
    await deleteBlobUrlIfPresent(uploadedDigitalFileUrl);
    return toFormError('No se pudieron subir los archivos.', formData);
  }

  if (productType === 'design' && isPublished && !nextDigitalFileUrl) {
    await deleteBlobUrlIfPresent(uploadedImageUrl);
    await deleteBlobUrlIfPresent(uploadedDigitalFileUrl);
    return toFormError(
      'Subí el archivo de diseño antes de publicar.',
      formData,
      { digitalFile: ['El archivo de diseño es obligatorio para publicar.'] }
    );
  }

  const priceCents = priceToCents(price);
  const stockValue: number | null =
    productType === 'product' ? (stock ?? 0) : null;
  const descriptionValue = description?.trim() || null;

  try {
    await sql`
      UPDATE store_products
      SET
        name = ${name},
        description = ${descriptionValue},
        product_type = ${productType},
        price_cents = ${priceCents},
        discount_percent = ${discountPercent},
        currency = ${currency},
        stock = ${stockValue},
        image_url = ${nextImageUrl},
        digital_file_url = ${nextDigitalFileUrl},
        is_published = ${isPublished},
        is_featured = ${isFeatured},
        updated_at = NOW()
      WHERE id = ${id}
        AND deleted_at IS NULL
    `;

    await replaceProductCategories(id, resolvedCategories.categoryIds);
  } catch (error) {
    console.error(error);
    await deleteBlobUrlIfPresent(uploadedImageUrl);
    await deleteBlobUrlIfPresent(uploadedDigitalFileUrl);
    return toFormError('No se pudo actualizar el artículo.', formData);
  }

  for (const blobUrl of [...new Set(blobsToDelete)]) {
    if (blobUrl !== nextImageUrl && blobUrl !== nextDigitalFileUrl) {
      await deleteBlobUrlIfPresent(blobUrl);
    }
  }

  if (existing.productType !== productType) {
    revalidatePath(getStoreCatalogHref(existing.productType));
    revalidatePath(getStoreProductHref(existing.productType, id));
  }

  revalidateStorePaths(productType, id);
  redirect(`/admin/products/${id}`);
}

export async function deleteStoreProduct(id: string) {
  await requireAdminSession();

  const existing = await fetchStoreProductById(id);
  if (!existing) {
    throw new Error('Artículo no encontrado.');
  }

  try {
    await sql`
      UPDATE store_products
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
        AND deleted_at IS NULL
    `;
  } catch (error) {
    console.error(error);
    throw new Error('No se pudo eliminar el artículo.');
  }

  revalidateStorePaths(existing.productType, id);
  redirect('/admin/products');
}

export type SetStoreProductPublishedResult = {
  success: boolean;
  message?: string;
  isPublished?: boolean;
};

export async function setStoreProductPublished(
  id: string,
  isPublished: boolean
): Promise<SetStoreProductPublishedResult> {
  await requireAdminSession();

  const existing = await fetchStoreProductById(id);
  if (!existing) {
    return { success: false, message: 'Artículo no encontrado.' };
  }

  if (
    isPublished &&
    existing.productType === 'design' &&
    !existing.digitalFileUrl
  ) {
    return {
      success: false,
      message: 'No se puede publicar un diseño sin archivo asociado.',
    };
  }

  await sql`
    UPDATE store_products
    SET is_published = ${isPublished}, updated_at = NOW()
    WHERE id = ${id}
      AND deleted_at IS NULL
  `;

  revalidateStorePaths(existing.productType, id);
  return { success: true, isPublished };
}

export async function adjustStoreProductStock(id: string, delta: 1 | -1) {
  await requireAdminSession();

  const existing = await fetchStoreProductById(id);
  if (!existing) {
    throw new Error('Artículo no encontrado.');
  }

  if (existing.productType !== 'product') {
    throw new Error('Solo los productos físicos tienen stock.');
  }

  const currentStock = existing.stock ?? 0;
  const nextStock = Math.max(0, currentStock + delta);

  if (nextStock === currentStock) {
    return { success: true as const, stock: currentStock };
  }

  await sql`
    UPDATE store_products
    SET stock = ${nextStock}, updated_at = NOW()
    WHERE id = ${id}
      AND deleted_at IS NULL
  `;

  revalidateStorePaths(existing.productType, id);
  return { success: true as const, stock: nextStock };
}

export type UpdateStoreProductPriceResult = {
  success: boolean;
  message?: string;
  priceCents?: number;
};

export async function updateStoreProductPrice(
  id: string,
  price: number
): Promise<UpdateStoreProductPriceResult> {
  await requireAdminSession();

  if (!Number.isFinite(price) || price < 0) {
    return {
      success: false,
      message: 'Ingresá un precio válido mayor o igual a 0.',
    };
  }

  const existing = await fetchStoreProductById(id);
  if (!existing) {
    return { success: false, message: 'Artículo no encontrado.' };
  }

  const priceCents = Math.round(price * 100);

  await sql`
    UPDATE store_products
    SET price_cents = ${priceCents}, updated_at = NOW()
    WHERE id = ${id}
      AND deleted_at IS NULL
  `;

  revalidateStorePaths(existing.productType, id);
  return { success: true, priceCents };
}

export type UpdateStoreProductDiscountResult = {
  success: boolean;
  message?: string;
  discountPercent?: number | null;
};

export async function updateStoreProductDiscount(
  id: string,
  discountPercent: number | null
): Promise<UpdateStoreProductDiscountResult> {
  await requireAdminSession();

  if (discountPercent !== null) {
    if (
      !Number.isInteger(discountPercent) ||
      discountPercent < 1 ||
      discountPercent > 100
    ) {
      return {
        success: false,
        message: 'El descuento debe ser un entero entre 1 y 100.',
      };
    }
  }

  const existing = await fetchStoreProductById(id);
  if (!existing) {
    return { success: false, message: 'Artículo no encontrado.' };
  }

  await sql`
    UPDATE store_products
    SET discount_percent = ${discountPercent}, updated_at = NOW()
    WHERE id = ${id}
      AND deleted_at IS NULL
  `;

  revalidateStorePaths(existing.productType, id);
  return { success: true, discountPercent };
}
