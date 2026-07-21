-- Preserve product-category assignment order (first = most important)

ALTER TABLE store_product_categories
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_store_product_categories_product_order
  ON store_product_categories (product_id, sort_order);
