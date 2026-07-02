-- Links course registrations to authenticated users.

ALTER TABLE course_registrations
  ADD COLUMN IF NOT EXISTS user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_course_registrations_user_id
  ON course_registrations(user_id);

-- Backfill: prefer customer-role users when email matches
UPDATE course_registrations r
SET user_id = u.id
FROM users u
WHERE r.user_id IS NULL
  AND lower(trim(r.email_address)) = lower(trim(u.email))
  AND u.role = 'customer'
  AND u.deleted_at IS NULL;
