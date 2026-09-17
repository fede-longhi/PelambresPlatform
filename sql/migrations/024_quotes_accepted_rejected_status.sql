-- Allow commercial quotes to record whether the customer accepted or rejected them

ALTER TABLE quotes
  DROP CONSTRAINT IF EXISTS quotes_status_check;

ALTER TABLE quotes
  ADD CONSTRAINT quotes_status_check
  CHECK (status IN ('draft', 'sent', 'accepted', 'rejected'));
