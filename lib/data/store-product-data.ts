import sql from '@/lib/db';
import { ITEMS_PER_PAGE } from '@/lib/consts';
import { STORE_FEATURED_LIMIT } from '@/lib/consts/store-consts';
import type {
  StoreProduct,
  StoreProductCategoryRef,
  StoreProductTableRow,
  StoreProductType,
} from '@/types/store-definitions';

/** Public catalog shape — never includes digital file URL. */
export type PublishedStoreProduct = {
  id: string;
  name: string;
  description: string | null;
  productType: StoreProductType;
  categories: StoreProductCategoryRef[];
  priceCents: number;
  discountPercent: number | null;
  currency: string;
  stock: number | null;
  imageUrl: string | null;
  isFeatured: boolean;
};

export type PublishedStoreProductSort =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc';

type ProductRowBase = {
  id: string;
  name: string;
  description: string | null;
  productType: StoreProductType;
  priceCents: number;
  currency: string;
  stock: number | null;
  imageUrl: string | null;
  digitalFileUrl?: string | null;
  isPublished?: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
};

async function fetchCategoriesByProductIds(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, StoreProductCategoryRef[]>();
  }

  const rows = await sql<
    (StoreProductCategoryRef & { productId: string })[]
  >`
    SELECT
      pc.product_id as "productId",
      c.id,
      c.name,
      c.slug
    FROM store_product_categories pc
    JOIN store_categories c
      ON c.id = pc.category_id
      AND c.deleted_at IS NULL
    WHERE pc.product_id IN ${sql(productIds)}
    ORDER BY pc.sort_order ASC, c.name ASC
  `;

  const categoriesByProductId = new Map<string, StoreProductCategoryRef[]>();

  for (const row of rows) {
    const list = categoriesByProductId.get(row.productId) ?? [];
    list.push({ id: row.id, name: row.name, slug: row.slug });
    categoriesByProductId.set(row.productId, list);
  }

  return categoriesByProductId;
}

function withCategories<T extends { id: string }>(
  rows: T[],
  categoriesByProductId: Map<string, StoreProductCategoryRef[]>
): Array<T & { categories: StoreProductCategoryRef[] }> {
  return rows.map((row) => ({
    ...row,
    categories: categoriesByProductId.get(row.id) ?? [],
  }));
}

export async function fetchFilteredStoreProducts(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const search = `%${query}%`;

  try {
    const rows = await sql<
      Omit<StoreProductTableRow, 'categories'>[]
    >`
      SELECT
        p.id,
        p.name,
        p.product_type as "productType",
        p.price_cents as "priceCents",
        p.discount_percent as "discountPercent",
        p.currency,
        p.stock,
        p.is_published as "isPublished",
        p.is_featured as "isFeatured",
        p.image_url as "imageUrl",
        p.updated_at as "updatedAt"
      FROM store_products p
      WHERE
        p.deleted_at IS NULL
        AND (
          p.name ILIKE ${search}
          OR p.description ILIKE ${search}
          OR p.product_type ILIKE ${search}
          OR EXISTS (
            SELECT 1
            FROM store_product_categories pc
            JOIN store_categories c
              ON c.id = pc.category_id
              AND c.deleted_at IS NULL
            WHERE pc.product_id = p.id
              AND c.name ILIKE ${search}
          )
        )
      ORDER BY p.updated_at DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `;

    const categoriesByProductId = await fetchCategoriesByProductIds(
      rows.map((row) => row.id)
    );

    return withCategories(rows, categoriesByProductId);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store products.');
  }
}

export async function fetchStoreProductPages(query: string) {
  const search = `%${query}%`;

  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM store_products p
      WHERE
        p.deleted_at IS NULL
        AND (
          p.name ILIKE ${search}
          OR p.description ILIKE ${search}
          OR p.product_type ILIKE ${search}
          OR EXISTS (
            SELECT 1
            FROM store_product_categories pc
            JOIN store_categories c
              ON c.id = pc.category_id
              AND c.deleted_at IS NULL
            WHERE pc.product_id = p.id
              AND c.name ILIKE ${search}
          )
        )
    `;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store product pages.');
  }
}

export async function fetchStoreProductById(id: string) {
  try {
    const rows = await sql<Omit<StoreProduct, 'categories'>[]>`
      SELECT
        p.id,
        p.name,
        p.description,
        p.product_type as "productType",
        p.price_cents as "priceCents",
        p.discount_percent as "discountPercent",
        p.currency,
        p.stock,
        p.image_url as "imageUrl",
        p.digital_file_url as "digitalFileUrl",
        p.is_published as "isPublished",
        p.is_featured as "isFeatured",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt"
      FROM store_products p
      WHERE p.id = ${id}
        AND p.deleted_at IS NULL
      LIMIT 1
    `;

    const product = rows[0];
    if (!product) {
      return null;
    }

    const categoriesByProductId = await fetchCategoriesByProductIds([product.id]);
    return {
      ...product,
      categories: categoriesByProductId.get(product.id) ?? [],
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store product.');
  }
}

export async function fetchPublishedStoreProducts(
  productType: StoreProductType,
  options?: {
    categorySlug?: string;
    query?: string;
    sort?: PublishedStoreProductSort;
    minPriceCents?: number;
    maxPriceCents?: number;
    discountedOnly?: boolean;
    inStockOnly?: boolean;
  }
) {
  const categorySlug = options?.categorySlug;
  const query = options?.query?.trim() ?? '';
  const search = `%${query}%`;
  const minPriceCents = options?.minPriceCents;
  const maxPriceCents = options?.maxPriceCents;
  const orderBy = (() => {
    switch (options?.sort) {
      case 'price-asc':
        return sql`ROUND(
          (p.price_cents * (100 - COALESCE(p.discount_percent, 0))) / 100.0
        ) ASC, p.name ASC`;
      case 'price-desc':
        return sql`ROUND(
          (p.price_cents * (100 - COALESCE(p.discount_percent, 0))) / 100.0
        ) DESC, p.name ASC`;
      case 'name-asc':
        return sql`p.name ASC`;
      default:
        return sql`p.created_at DESC, p.name ASC`;
    }
  })();

  try {
    const rows = await sql<Omit<PublishedStoreProduct, 'categories'>[]>`
      SELECT
        p.id,
        p.name,
        p.description,
        p.product_type as "productType",
        p.price_cents as "priceCents",
        p.discount_percent as "discountPercent",
        p.currency,
        p.stock,
        p.image_url as "imageUrl",
        p.is_featured as "isFeatured"
      FROM store_products p
      WHERE
        p.deleted_at IS NULL
        AND p.is_published = true
        AND p.product_type = ${productType}
        ${
          categorySlug
            ? sql`
                AND EXISTS (
                  SELECT 1
                  FROM store_product_categories pc
                  JOIN store_categories c
                    ON c.id = pc.category_id
                    AND c.deleted_at IS NULL
                    AND c.is_active = true
                  WHERE pc.product_id = p.id
                    AND c.slug = ${categorySlug}
                )
              `
            : sql``
        }
        ${
          query
            ? sql`
                AND (
                  p.name ILIKE ${search}
                  OR COALESCE(p.description, '') ILIKE ${search}
                  OR EXISTS (
                    SELECT 1
                    FROM store_product_categories pc
                    JOIN store_categories c
                      ON c.id = pc.category_id
                      AND c.deleted_at IS NULL
                    WHERE pc.product_id = p.id
                      AND c.name ILIKE ${search}
                  )
                )
              `
            : sql``
        }
        ${
          minPriceCents !== undefined
            ? sql`
                AND ROUND(
                  (p.price_cents * (100 - COALESCE(p.discount_percent, 0))) / 100.0
                ) >= ${minPriceCents}
              `
            : sql``
        }
        ${
          maxPriceCents !== undefined
            ? sql`
                AND ROUND(
                  (p.price_cents * (100 - COALESCE(p.discount_percent, 0))) / 100.0
                ) <= ${maxPriceCents}
              `
            : sql``
        }
        ${
          options?.discountedOnly
            ? sql`AND p.discount_percent IS NOT NULL AND p.discount_percent > 0`
            : sql``
        }
        ${
          options?.inStockOnly
            ? sql`AND p.stock IS NOT NULL AND p.stock > 0`
            : sql``
        }
      ORDER BY ${orderBy}
    `;

    const categoriesByProductId = await fetchCategoriesByProductIds(
      rows.map((row) => row.id)
    );

    return withCategories(rows, categoriesByProductId);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch published store products.');
  }
}

export async function fetchFeaturedStoreProducts(
  productType: StoreProductType,
  limit = STORE_FEATURED_LIMIT
) {
  try {
    const rows = await sql<Omit<PublishedStoreProduct, 'categories'>[]>`
      SELECT
        p.id,
        p.name,
        p.description,
        p.product_type as "productType",
        p.price_cents as "priceCents",
        p.discount_percent as "discountPercent",
        p.currency,
        p.stock,
        p.image_url as "imageUrl",
        p.is_featured as "isFeatured"
      FROM store_products p
      WHERE
        p.deleted_at IS NULL
        AND p.is_published = true
        AND p.is_featured = true
        AND p.product_type = ${productType}
      ORDER BY p.updated_at DESC
      LIMIT ${limit}
    `;

    const categoriesByProductId = await fetchCategoriesByProductIds(
      rows.map((row) => row.id)
    );

    return withCategories(rows, categoriesByProductId);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch featured store products.');
  }
}

export async function fetchPublishedStoreProductById(
  productType: StoreProductType,
  id: string
) {
  try {
    const rows = await sql<Omit<PublishedStoreProduct, 'categories'>[]>`
      SELECT
        p.id,
        p.name,
        p.description,
        p.product_type as "productType",
        p.price_cents as "priceCents",
        p.discount_percent as "discountPercent",
        p.currency,
        p.stock,
        p.image_url as "imageUrl",
        p.is_featured as "isFeatured"
      FROM store_products p
      WHERE
        p.id = ${id}
        AND p.product_type = ${productType}
        AND p.deleted_at IS NULL
        AND p.is_published = true
      LIMIT 1
    `;

    const product = rows[0];
    if (!product) {
      return null;
    }

    const categoriesByProductId = await fetchCategoriesByProductIds([product.id]);
    return {
      ...product,
      categories: categoriesByProductId.get(product.id) ?? [],
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch published store product.');
  }
}
