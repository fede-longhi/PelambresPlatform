-- Links customer-role users to CRM customer records.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS customer_id UUID NULL REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);

-- Backfill: match customer users to customers by email
UPDATE users u
SET customer_id = c.id
FROM customers c
WHERE u.role = 'customer'
  AND u.customer_id IS NULL
  AND lower(trim(u.email)) = lower(trim(c.email));
