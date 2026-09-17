-- Link a custom order back to the commercial quote it was created from.
-- One order per quote (partial unique index). Existing orders stay unlinked.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quote_id UUID NULL REFERENCES quotes(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_quote_id
  ON orders (quote_id)
  WHERE quote_id IS NOT NULL;
