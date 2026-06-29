-- Adds role-based access, user lifecycle fields, and nullable password for OAuth.
-- Applied automatically via: pnpm db:migrate

-- Role and lifecycle columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Allow OAuth-only users without a password
ALTER TABLE users
  ALTER COLUMN password DROP NOT NULL;

-- Constrain role to known values (extend when customer portal ships)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'customer'));
  END IF;
END $$;

-- Backfill username from email local-part when missing
UPDATE users
SET username = split_part(email, '@', 1)
WHERE username IS NULL OR trim(username) = '';

-- Existing rows become admins with active status
UPDATE users
SET
  role = 'admin',
  is_active = true,
  must_change_password = false
WHERE deleted_at IS NULL;
