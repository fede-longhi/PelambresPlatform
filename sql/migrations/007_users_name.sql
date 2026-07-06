-- Display name for users (admin UI, customer portal, OAuth, registration).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name TEXT;

UPDATE users
SET name = COALESCE(
  NULLIF(trim(username), ''),
  split_part(email, '@', 1)
)
WHERE name IS NULL OR trim(name) = '';
