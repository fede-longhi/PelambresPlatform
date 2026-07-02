-- Allow the same email for separate admin and customer accounts.
-- Uniqueness is enforced per (email, role) among active rows.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

DROP INDEX IF EXISTS users_email_key;
DROP INDEX IF EXISTS idx_users_email_unique;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_role_unique
  ON users (lower(trim(email)), role)
  WHERE deleted_at IS NULL;
