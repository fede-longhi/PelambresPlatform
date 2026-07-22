-- Add free-text tags on store products for search and customer reference

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_store_products_tags_gin
  ON store_products
  USING GIN (tags)
  WHERE deleted_at IS NULL;
