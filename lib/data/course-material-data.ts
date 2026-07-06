import sql from '@/lib/db';

export type CourseMaterialItem = {
  id: string;
  courseId: string;
  fileId: string;
  title: string;
  sortOrder: number;
  filename: string;
  mimeType: string;
  size: number;
  fileUrl: string;
  blobPathname: string | null;
  createdAt: Date;
};

export async function fetchCourseMaterials(courseId: string): Promise<CourseMaterialItem[]> {
  try {
    return await sql<CourseMaterialItem[]>`
      SELECT
        cm.id,
        cm.course_id as "courseId",
        cm.file_id as "fileId",
        cm.title,
        cm.sort_order as "sortOrder",
        f.filename,
        f.mime_type as "mimeType",
        f.size,
        f.path as "fileUrl",
        f.blob_pathname as "blobPathname",
        cm.created_at as "createdAt"
      FROM course_materials cm
      JOIN files f ON f.id = cm.file_id
      WHERE cm.course_id = ${courseId}
      ORDER BY cm.sort_order ASC, cm.created_at ASC
    `;
  } catch (error) {
    console.error('Database error fetching course materials:', error);
    throw new Error('Failed to fetch course materials.');
  }
}

export async function fetchCourseMaterialById(
  materialId: string
): Promise<(CourseMaterialItem & { courseSlug: string }) | null> {
  try {
    const rows = await sql<(CourseMaterialItem & { courseSlug: string })[]>`
      SELECT
        cm.id,
        cm.course_id as "courseId",
        cm.file_id as "fileId",
        cm.title,
        cm.sort_order as "sortOrder",
        f.filename,
        f.mime_type as "mimeType",
        f.size,
        f.path as "fileUrl",
        f.blob_pathname as "blobPathname",
        cm.created_at as "createdAt",
        c.slug as "courseSlug"
      FROM course_materials cm
      JOIN files f ON f.id = cm.file_id
      JOIN courses c ON c.id = cm.course_id
      WHERE cm.id = ${materialId}
        AND c.deleted_at IS NULL
      LIMIT 1
    `;
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database error fetching course material:', error);
    throw new Error('Failed to fetch course material.');
  }
}

export async function fetchCourseMaterialCount(courseId: string): Promise<number> {
  try {
    const rows = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int as count
      FROM course_materials
      WHERE course_id = ${courseId}
    `;
    return rows[0]?.count ?? 0;
  } catch (error) {
    console.error('Database error counting course materials:', error);
    throw new Error('Failed to count course materials.');
  }
}
