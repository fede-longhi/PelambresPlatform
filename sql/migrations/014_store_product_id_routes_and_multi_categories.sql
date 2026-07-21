-- Product URLs by id (drop slug); many-to-many categories

CREATE TABLE IF NOT EXISTS store_product_categories (
  product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES store_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_store_product_categories_category
  ON store_product_categories (category_id);

-- Move existing single category_id links into the join table
INSERT INTO store_product_categories (product_id, category_id)
SELECT id, category_id
FROM store_products
WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

DROP INDEX IF EXISTS idx_store_products_category;

ALTER TABLE store_products
  DROP COLUMN IF EXISTS category_id;

DROP INDEX IF EXISTS idx_store_products_slug_active;

ALTER TABLE store_products
  DROP COLUMN IF EXISTS slug;
