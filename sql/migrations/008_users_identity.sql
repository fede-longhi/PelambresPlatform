-- User identity: split name, Google account link for derived platform access.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS google_subject_id TEXT NULL;

-- Backfill first_name / last_name from legacy name column.
UPDATE users
SET
  first_name = CASE
    WHEN name IS NULL OR trim(name) = '' THEN
      COALESCE(NULLIF(trim(username), ''), split_part(email, '@', 1))
    WHEN position(' ' IN trim(name)) = 0 THEN trim(name)
    ELSE trim(regexp_replace(trim(name), '\s+\S+$', ''))
  END,
  last_name = CASE
    WHEN name IS NULL OR trim(name) = '' THEN ''
    WHEN position(' ' IN trim(name)) = 0 THEN ''
    ELSE trim(substring(trim(name) FROM '(\S+)$'))
  END
WHERE first_name IS NULL OR trim(first_name) = '';

-- Keep name in sync during transition.
UPDATE users
SET name = trim(concat_ws(' ', first_name, NULLIF(trim(last_name), '')))
WHERE name IS NULL
   OR trim(name) = ''
   OR trim(name) <> trim(concat_ws(' ', first_name, NULLIF(trim(last_name), '')));

-- Link customer-role users to existing person customers by email.
UPDATE users u
SET customer_id = c.id
FROM customers c
WHERE u.role = 'customer'
  AND u.customer_id IS NULL
  AND u.deleted_at IS NULL
  AND lower(trim(c.email)) = lower(trim(u.email));

CREATE UNIQUE INDEX IF NOT EXISTS users_google_subject_id_unique
  ON users (google_subject_id)
  WHERE google_subject_id IS NOT NULL
    AND deleted_at IS NULL;
