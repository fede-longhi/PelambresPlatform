-- Store checkout orders for MercadoPago Checkout Pro

CREATE TABLE IF NOT EXISTS store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  currency TEXT NOT NULL DEFAULT 'ARS',
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  mp_preference_id TEXT NULL,
  mp_payment_id TEXT NULL,
  paid_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_orders_mp_payment_id
  ON store_orders (mp_payment_id)
  WHERE mp_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_store_orders_buyer_email
  ON store_orders (buyer_email);

CREATE INDEX IF NOT EXISTS idx_store_orders_status
  ON store_orders (status);

CREATE INDEX IF NOT EXISTS idx_store_orders_created_at
  ON store_orders (created_at DESC);

CREATE TABLE IF NOT EXISTS store_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id UUID NULL REFERENCES store_products(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('product', 'design')),
  name TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  discount_percent INTEGER NULL CHECK (
    discount_percent IS NULL
    OR (discount_percent >= 1 AND discount_percent <= 100)
  ),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_order_items_order_id
  ON store_order_items (order_id);
