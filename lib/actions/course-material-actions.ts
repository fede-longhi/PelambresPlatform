'use server';

import { put, del } from '@vercel/blob';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { canAccessAdmin } from '@/lib/auth/permissions';
import {
  COURSE_MATERIAL_ALLOWED_EXTENSIONS,
  COURSE_MATERIAL_MAX_SIZE_BYTES,
  COURSE_MATERIAL_MIME_BY_EXTENSION,
  COURSE_MATERIALS_FOLDER,
} from '@/lib/consts/course-material-consts';
import { fetchCourseMaterialById } from '@/lib/data/course-material-data';
import { calculateFileHash } from '@/lib/utils';

function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex < 0) {
    return '';
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

function normalizeCourseMaterialMimeType(filename: string, mimeType?: string): string {
  if (mimeType && mimeType.trim().length > 0) {
    return mimeType;
  }

  const extension = getFileExtension(filename);
  return COURSE_MATERIAL_MIME_BY_EXTENSION[extension] || 'application/octet-stream';
}

function validateCourseMaterialFile(file: File): string | null {
  const extension = getFileExtension(file.name);

  if (!extension || !COURSE_MATERIAL_ALLOWED_EXTENSIONS.has(extension)) {
    return 'Tipo de archivo no permitido. Usá PDF, MD, TXT, ZIP o imágenes.';
  }

  if (file.size > COURSE_MATERIAL_MAX_SIZE_BYTES) {
    return `El archivo supera el límite de ${COURSE_MATERIAL_MAX_SIZE_BYTES / (1024 * 1024)} MB.`;
  }

  return null;
}

async function requireAdminSession() {
  const session = await auth();
  const sessionUser = session?.user;

  if (
    !sessionUser?.id ||
    !canAccessAdmin({
      id: sessionUser.id,
      email: sessionUser.email ?? '',
      name: sessionUser.name ?? '',
      role: sessionUser.role,
      isActive: sessionUser.isActive,
      mustChangePassword: sessionUser.mustChangePassword,
    })
  ) {
    throw new Error('No autorizado.');
  }

  return sessionUser;
}

const AddMaterialSchema = z.object({
  title: z.string().trim().min(1, { message: 'El título es obligatorio.' }).max(200),
});

export type CourseMaterialFormState = {
  errors?: {
    title?: string[];
    file?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function addCourseMaterial(
  courseId: string,
  _previousState: CourseMaterialFormState,
  formData: FormData
): Promise<CourseMaterialFormState> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, message: 'No autorizado.' };
  }

  const validatedFields = AddMaterialSchema.safeParse({
    title: formData.get('title'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los datos del material.',
    };
  }

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return {
      success: false,
      errors: { file: ['Seleccioná un archivo.'] },
      message: 'Seleccioná un archivo.',
    };
  }

  const fileValidationError = validateCourseMaterialFile(file);
  if (fileValidationError) {
    return {
      success: false,
      errors: { file: [fileValidationError] },
      message: fileValidationError,
    };
  }

  const courseRows = await sql<{ slug: string }[]>`
    SELECT slug
    FROM courses
    WHERE id = ${courseId}
      AND deleted_at IS NULL
    LIMIT 1
  `;

  const course = courseRows[0];
  if (!course) {
    return { success: false, message: 'El curso no existe.' };
  }

  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const blobPath = `${COURSE_MATERIALS_FOLDER}/${courseId}/${Date.now()}-${safeFilename}`;

  let fileHash: string;
  try {
    fileHash = await calculateFileHash(file);
  } catch (error) {
    console.error('Error calculating course material hash:', error);
    return { success: false, message: 'No se pudo procesar el archivo.' };
  }

  let blob;
  try {
    blob = await put(blobPath, file, { access: 'public' });
  } catch (error) {
    console.error('Error uploading course material:', error);
    return { success: false, message: 'No se pudo subir el archivo.' };
  }

  const mimeType = normalizeCourseMaterialMimeType(file.name, file.type);
  const title = validatedFields.data.title;

  try {
    const sortRows = await sql<{ nextOrder: number }[]>`
      SELECT COALESCE(MAX(sort_order), -1) + 1 as "nextOrder"
      FROM course_materials
      WHERE course_id = ${courseId}
    `;
    const sortOrder = sortRows[0]?.nextOrder ?? 0;

    await sql.begin(async (transaction) => {
      const insertedFiles = await transaction<{ id: string }[]>`
        INSERT INTO files (filename, path, mime_type, size, uploaded_at, hash, blob_pathname)
        VALUES (
          ${file.name},
          ${blob.downloadUrl},
          ${mimeType},
          ${file.size},
          ${new Date().toISOString()},
          ${fileHash},
          ${blob.pathname}
        )
        RETURNING id
      `;

      const fileId = insertedFiles[0].id;

      await transaction`
        INSERT INTO course_materials (course_id, file_id, title, sort_order)
        VALUES (${courseId}, ${fileId}, ${title}, ${sortOrder})
      `;
    });
  } catch (error) {
    console.error('Error saving course material:', error);
    try {
      await del(blob.url);
    } catch (deleteError) {
      console.error('Error cleaning up blob after failed insert:', deleteError);
    }
    return { success: false, message: 'No se pudo guardar el material.' };
  }

  revalidatePath(`/admin/courses/${courseId}/materials`);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/customer/courses/${course.slug}`);

  return { success: true, message: 'Material agregado correctamente.' };
}

export async function deleteCourseMaterial(
  courseId: string,
  materialId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, message: 'No autorizado.' };
  }

  const material = await fetchCourseMaterialById(materialId);
  if (!material || material.courseId !== courseId) {
    return { success: false, message: 'Material no encontrado.' };
  }

  try {
    await sql.begin(async (transaction) => {
      await transaction`
        DELETE FROM course_materials
        WHERE id = ${materialId}
          AND course_id = ${courseId}
      `;

      await transaction`
        DELETE FROM files
        WHERE id = ${material.fileId}
      `;
    });

    if (material.fileUrl) {
      try {
        await del(material.fileUrl);
      } catch (error) {
        console.error('Error deleting course material blob:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting course material:', error);
    return { success: false, message: 'No se pudo eliminar el material.' };
  }

  revalidatePath(`/admin/courses/${courseId}/materials`);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/customer/courses/${material.courseSlug}`);

  return { success: true, message: 'Material eliminado.' };
}
