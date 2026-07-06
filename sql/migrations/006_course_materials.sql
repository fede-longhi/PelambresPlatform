-- Course materials: admin-uploaded files linked to courses for student aula access.

ALTER TABLE files
  ADD COLUMN IF NOT EXISTS blob_pathname TEXT NULL;

CREATE TABLE IF NOT EXISTS course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_course_materials_course_id
  ON course_materials(course_id);

CREATE INDEX IF NOT EXISTS idx_course_materials_sort
  ON course_materials(course_id, sort_order);
