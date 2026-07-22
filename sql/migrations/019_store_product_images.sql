-- Multi-image gallery for store products (cover remains store_products.image_url)

CREATE TABLE IF NOT EXISTS store_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_product_images_product_id
  ON store_product_images(product_id, sort_order);

INSERT INTO store_product_images (product_id, url, sort_order)
SELECT p.id, p.image_url, 0
FROM store_products p
WHERE p.image_url IS NOT NULL
  AND p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM store_product_images spi
    WHERE spi.product_id = p.id
  );
