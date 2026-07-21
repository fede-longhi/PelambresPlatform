-- Rename product types, add categories, featured flag, and category FK

-- 1) Categories (scoped by product type)
CREATE TABLE IF NOT EXISTS store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('product', 'design')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_categories_slug_type_active
  ON store_categories (product_type, slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_store_categories_type_order
  ON store_categories (product_type, sort_order)
  WHERE deleted_at IS NULL;

-- 2) Drop old product_type check (Postgres: recreate constraint via column update flow)
ALTER TABLE store_products DROP CONSTRAINT IF EXISTS store_products_product_type_check;

UPDATE store_products
SET product_type = 'product'
WHERE product_type = 'ready_product';

UPDATE store_products
SET product_type = 'design'
WHERE product_type = 'digital_file';

ALTER TABLE store_products
  ADD CONSTRAINT store_products_product_type_check
  CHECK (product_type IN ('product', 'design'));

-- 3) Featured + optional category
ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS category_id UUID NULL REFERENCES store_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_store_products_featured
  ON store_products (product_type, is_featured)
  WHERE deleted_at IS NULL AND is_published = true;

CREATE INDEX IF NOT EXISTS idx_store_products_category
  ON store_products (category_id)
  WHERE deleted_at IS NULL;
