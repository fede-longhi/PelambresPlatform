-- Add optional delivery/contact address on customers

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS address TEXT NULL;
