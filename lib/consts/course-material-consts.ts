export const COURSE_MATERIALS_FOLDER = 'course-materials';

export const COURSE_MATERIAL_ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'md',
  'txt',
  'zip',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'docx',
  'pptx',
  'xlsx',
]);

export const COURSE_MATERIAL_MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  md: 'text/markdown',
  txt: 'text/plain',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const COURSE_MATERIAL_MAX_SIZE_MB = 50;
export const COURSE_MATERIAL_MAX_SIZE_BYTES = COURSE_MATERIAL_MAX_SIZE_MB * 1024 * 1024;

export const COURSE_MATERIAL_ALLOWED_MIME_TYPES = new Set(
  Object.values(COURSE_MATERIAL_MIME_BY_EXTENSION)
);
