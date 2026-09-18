-- Operational fields for custom orders: internal notes, soft delete,
-- status history, and file attachments.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_orders_active_created_date
  ON orders (created_date DESC)
  WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS idx_orders_quote_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_quote_id
  ON orders (quote_id)
  WHERE quote_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT NULL,
  to_status TEXT NOT NULL
    CHECK (to_status IN ('pending', 'in progress', 'finished', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_order_status_events_order_id
  ON order_status_events (order_id, created_at ASC);

CREATE TABLE IF NOT EXISTS order_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id
  ON order_attachments (order_id, created_at DESC);
