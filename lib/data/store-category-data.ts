import sql from '@/lib/db';
import type { StoreCategory, StoreProductType } from '@/types/store-definitions';

export async function fetchStoreCategoriesByType(
  productType: StoreProductType,
  options?: { activeOnly?: boolean }
) {
  const activeOnly = options?.activeOnly ?? false;

  try {
    if (activeOnly) {
      return await sql<StoreCategory[]>`
        SELECT
          id,
          name,
          slug,
          product_type as "productType",
          sort_order as "sortOrder",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM store_categories
        WHERE
          deleted_at IS NULL
          AND product_type = ${productType}
          AND is_active = true
        ORDER BY sort_order ASC, name ASC
      `;
    }

    return await sql<StoreCategory[]>`
      SELECT
        id,
        name,
        slug,
        product_type as "productType",
        sort_order as "sortOrder",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM store_categories
      WHERE
        deleted_at IS NULL
        AND product_type = ${productType}
      ORDER BY sort_order ASC, name ASC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store categories.');
  }
}

export async function fetchAllStoreCategories() {
  try {
    return await sql<StoreCategory[]>`
      SELECT
        id,
        name,
        slug,
        product_type as "productType",
        sort_order as "sortOrder",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM store_categories
      WHERE deleted_at IS NULL
      ORDER BY product_type ASC, sort_order ASC, name ASC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store categories.');
  }
}

export async function fetchStoreCategoryById(id: string) {
  try {
    const rows = await sql<StoreCategory[]>`
      SELECT
        id,
        name,
        slug,
        product_type as "productType",
        sort_order as "sortOrder",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM store_categories
      WHERE id = ${id}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    return rows[0] ?? null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store category.');
  }
}

export async function fetchNextStoreCategorySortOrder(
  productType: StoreProductType
) {
  try {
    const rows = await sql<{ maxSort: number | null }[]>`
      SELECT MAX(sort_order) as "maxSort"
      FROM store_categories
      WHERE product_type = ${productType}
        AND deleted_at IS NULL
    `;

    return (rows[0]?.maxSort ?? -1) + 1;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch next category sort order.');
  }
}
