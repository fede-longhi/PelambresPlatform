-- Commercial quotes issued from the admin quote builder (distinct from quote_requests)

CREATE SEQUENCE IF NOT EXISTS quote_number_seq AS INTEGER START WITH 1;

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number INTEGER NOT NULL DEFAULT nextval('quote_number_seq'),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent')),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  quote_request_id UUID NULL REFERENCES quote_requests(id) ON DELETE SET NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  company_name TEXT NOT NULL DEFAULT 'Pelambres 3D',
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL DEFAULT '',
  client_phone TEXT NOT NULL DEFAULT '',
  client_address TEXT NOT NULL DEFAULT '',
  client_type TEXT NOT NULL DEFAULT 'person'
    CHECK (client_type IN ('person', 'business')),
  notes TEXT NOT NULL DEFAULT '',
  global_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (global_discount_percent >= 0 AND global_discount_percent <= 100),
  show_quote_number BOOLEAN NOT NULL DEFAULT TRUE,
  subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_quote_number
  ON quotes (quote_number);

CREATE INDEX IF NOT EXISTS idx_quotes_customer_id
  ON quotes (customer_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_status
  ON quotes (status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_quote_request_id
  ON quotes (quote_request_id)
  WHERE quote_request_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_quote_date
  ON quotes (quote_date DESC)
  WHERE deleted_at IS NULL;

ALTER SEQUENCE quote_number_seq OWNED BY quotes.quote_number;

CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(12, 3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (discount_percent >= 0 AND discount_percent <= 100),
  calculator_params JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id
  ON quote_items (quote_id, sort_order);

CREATE TABLE IF NOT EXISTS quote_taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL DEFAULT '',
  percentage NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (percentage >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_taxes_quote_id
  ON quote_taxes (quote_id, sort_order);
