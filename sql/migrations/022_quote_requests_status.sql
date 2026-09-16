-- Minimal quote request workflow for the admin inbox

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

ALTER TABLE quote_requests
  DROP CONSTRAINT IF EXISTS quote_requests_status_check;

ALTER TABLE quote_requests
  ADD CONSTRAINT quote_requests_status_check
  CHECK (status IN ('new', 'in_progress', 'quoted', 'closed'));

CREATE INDEX IF NOT EXISTS idx_quote_requests_status
  ON quote_requests(status);
