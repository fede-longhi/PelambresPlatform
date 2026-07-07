-- Phase 5: every course registration belongs to a user; drop denormalized identity columns.

-- 1. Backfill user_id from matching customer users.
UPDATE course_registrations r
SET user_id = u.id
FROM users u
WHERE r.user_id IS NULL
  AND lower(trim(r.email_address)) = lower(trim(u.email))
  AND u.role = 'customer'
  AND u.deleted_at IS NULL;

-- 2. Provision customer + user for legacy registrations still missing user_id.
DO $$
DECLARE
  registration_row RECORD;
  customer_id UUID;
  resolved_user_id UUID;
  normalized_email TEXT;
  trimmed_full_name TEXT;
  parsed_first_name TEXT;
  parsed_last_name TEXT;
  generated_username TEXT;
BEGIN
  FOR registration_row IN
    SELECT id, full_name, email_address, phone_number
    FROM course_registrations
    WHERE user_id IS NULL
  LOOP
    normalized_email := lower(trim(registration_row.email_address));
    trimmed_full_name := trim(coalesce(registration_row.full_name, ''));

    IF normalized_email = '' THEN
      RAISE EXCEPTION 'course_registration % has no email_address to backfill user_id', registration_row.id;
    END IF;

    parsed_first_name := split_part(trimmed_full_name, ' ', 1);
    IF parsed_first_name = '' THEN
      parsed_first_name := split_part(normalized_email, '@', 1);
    END IF;

    parsed_last_name := NULLIF(
      trim(substring(trimmed_full_name from length(parsed_first_name) + 2)),
      ''
    );

    SELECT c.id
    INTO customer_id
    FROM customers c
    WHERE lower(trim(c.email)) = normalized_email
    LIMIT 1;

    IF customer_id IS NULL THEN
      INSERT INTO customers (name, first_name, last_name, email, phone, type)
      VALUES (
        NULLIF(trimmed_full_name, ''),
        parsed_first_name,
        parsed_last_name,
        normalized_email,
        coalesce(registration_row.phone_number, ''),
        'person'
      )
      RETURNING id INTO customer_id;
    END IF;

    SELECT u.id
    INTO resolved_user_id
    FROM users u
    WHERE lower(trim(u.email)) = normalized_email
      AND u.role = 'customer'
      AND u.deleted_at IS NULL
    LIMIT 1;

    IF resolved_user_id IS NULL THEN
      generated_username := split_part(normalized_email, '@', 1) || '_' || substr(gen_random_uuid()::text, 1, 8);

      INSERT INTO users (
        username,
        first_name,
        last_name,
        name,
        email,
        password,
        image_url,
        google_subject_id,
        role,
        customer_id,
        must_change_password,
        is_active
      )
      VALUES (
        generated_username,
        parsed_first_name,
        coalesce(parsed_last_name, ''),
        coalesce(NULLIF(trimmed_full_name, ''), parsed_first_name),
        normalized_email,
        NULL,
        NULL,
        NULL,
        'customer',
        customer_id,
        false,
        true
      )
      RETURNING id INTO resolved_user_id;
    END IF;

    UPDATE course_registrations
    SET user_id = resolved_user_id
    WHERE id = registration_row.id;
  END LOOP;
END $$;

-- 3. Guard: abort if any row is still orphaned.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM course_registrations WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'course_registrations still has rows without user_id after backfill';
  END IF;
END $$;

-- 4. user_id is required; FK must not null-out on user delete.
ALTER TABLE course_registrations
  DROP CONSTRAINT IF EXISTS course_registrations_user_id_fkey;

ALTER TABLE course_registrations
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE course_registrations
  ADD CONSTRAINT course_registrations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- 5. Drop redundant identity columns (name/email live on users).
ALTER TABLE course_registrations
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS email_address;
