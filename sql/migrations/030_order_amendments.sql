-- History of order total changes after the quote snapshot.

CREATE TABLE IF NOT EXISTS order_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  quote_id UUID NULL REFERENCES quotes(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  previous_amount_cents INTEGER NOT NULL CHECK (previous_amount_cents >= 0),
  next_amount_cents INTEGER NOT NULL CHECK (next_amount_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_order_amendments_order_id
  ON order_amendments (order_id, created_at DESC);
