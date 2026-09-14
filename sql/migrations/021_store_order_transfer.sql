-- Bank transfer payment method for store orders

ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'mercadopago';

ALTER TABLE store_orders
  DROP CONSTRAINT IF EXISTS store_orders_payment_method_check;

ALTER TABLE store_orders
  ADD CONSTRAINT store_orders_payment_method_check
  CHECK (payment_method IN ('mercadopago', 'transfer'));

ALTER TABLE store_orders
  DROP CONSTRAINT IF EXISTS store_orders_status_check;

ALTER TABLE store_orders
  ADD CONSTRAINT store_orders_status_check
  CHECK (
    status IN (
      'pending',
      'payment_review',
      'paid',
      'failed',
      'cancelled',
      'refunded'
    )
  );

ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS transfer_receipt_url TEXT NULL;

ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS transfer_receipt_uploaded_at TIMESTAMPTZ NULL;

ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS transfer_reference TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_store_orders_payment_method
  ON store_orders (payment_method);

CREATE INDEX IF NOT EXISTS idx_store_orders_payment_review
  ON store_orders (status)
  WHERE status = 'payment_review';
