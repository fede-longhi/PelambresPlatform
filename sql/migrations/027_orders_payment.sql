-- Payment tracking for custom orders: current status on orders plus a
-- payment ledger for deposits, partial payments, and full settlement.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'deposit', 'partial', 'paid'));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS paid_amount_cents INTEGER NOT NULL DEFAULT 0;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_paid_amount_cents_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_paid_amount_cents_check
  CHECK (paid_amount_cents >= 0);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders (payment_status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_unpaid
  ON orders (created_date DESC)
  WHERE deleted_at IS NULL
    AND payment_status IN ('pending', 'deposit', 'partial')
    AND status <> 'cancelled';

CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL
    CHECK (amount_cents > 0),
  kind TEXT NOT NULL
    CHECK (kind IN ('deposit', 'partial', 'full')),
  method TEXT NOT NULL
    CHECK (method IN ('transfer', 'mercadopago', 'cash', 'other')),
  notes TEXT NOT NULL DEFAULT '',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_order_payments_order_id
  ON order_payments (order_id, paid_at ASC)
  WHERE deleted_at IS NULL;
