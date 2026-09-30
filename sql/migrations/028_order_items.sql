-- Order lines are a snapshot of the accepted quote. Existing quotes become revision 1.
-- Quoted totals and payments stay as they are.

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1;

ALTER TABLE quotes
  DROP CONSTRAINT IF EXISTS quotes_revision_check;

ALTER TABLE quotes
  ADD CONSTRAINT quotes_revision_check
  CHECK (revision >= 1);

DROP INDEX IF EXISTS idx_quotes_quote_number;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_quote_number_revision
  ON quotes (quote_number, revision);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quoted_amount_cents INTEGER NULL;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_quoted_amount_cents_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_quoted_amount_cents_check
  CHECK (quoted_amount_cents IS NULL OR quoted_amount_cents >= 0);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS global_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_global_discount_percent_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_global_discount_percent_check
  CHECK (global_discount_percent >= 0 AND global_discount_percent <= 100);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  source_quote_item_id UUID NULL REFERENCES quote_items(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(12, 3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (discount_percent >= 0 AND discount_percent <= 100),
  calculator_params JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items (order_id, sort_order);

CREATE TABLE IF NOT EXISTS order_taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL DEFAULT '',
  percentage NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (percentage >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_taxes_order_id
  ON order_taxes (order_id, sort_order);

INSERT INTO order_items (
  order_id,
  source_quote_item_id,
  sort_order,
  description,
  quantity,
  unit_price_cents,
  discount_percent,
  calculator_params
)
SELECT
  orders.id,
  quote_items.id,
  quote_items.sort_order,
  quote_items.description,
  quote_items.quantity,
  quote_items.unit_price_cents,
  quote_items.discount_percent,
  quote_items.calculator_params
FROM orders
JOIN quote_items ON quote_items.quote_id = orders.quote_id
WHERE orders.deleted_at IS NULL
  AND orders.quote_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM order_items existing
    WHERE existing.order_id = orders.id
  );

INSERT INTO order_taxes (
  order_id,
  sort_order,
  name,
  percentage
)
SELECT
  orders.id,
  quote_taxes.sort_order,
  quote_taxes.name,
  quote_taxes.percentage
FROM orders
JOIN quote_taxes ON quote_taxes.quote_id = orders.quote_id
WHERE orders.deleted_at IS NULL
  AND orders.quote_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM order_taxes existing
    WHERE existing.order_id = orders.id
  );

UPDATE orders
SET
  quoted_amount_cents = orders.amount,
  global_discount_percent = quotes.global_discount_percent
FROM quotes
WHERE orders.quote_id = quotes.id
  AND orders.deleted_at IS NULL
  AND orders.quoted_amount_cents IS NULL;
