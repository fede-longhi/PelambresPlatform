-- Store catalog: ready products and digital 3D design files

CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('ready_product', 'digital_file')),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  stock INTEGER NULL CHECK (stock IS NULL OR stock >= 0),
  image_url TEXT NULL,
  digital_file_url TEXT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_products_slug_active
  ON store_products (slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_store_products_type
  ON store_products (product_type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_store_products_published
  ON store_products (is_published)
  WHERE deleted_at IS NULL;
