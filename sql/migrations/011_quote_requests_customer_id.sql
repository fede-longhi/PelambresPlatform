-- Link quote requests to customers (optional; anonymous leads stay NULL)

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quote_requests_customer_id
  ON quote_requests(customer_id)
  WHERE customer_id IS NOT NULL;
