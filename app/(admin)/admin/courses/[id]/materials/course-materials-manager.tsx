'use client';

import { useActionState, useEffect, useState, useTransition, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileAttachmentPicker } from '@/components/shared/file-attachment-picker';
import {
  addCourseMaterial,
  deleteCourseMaterial,
  type CourseMaterialFormState,
} from '@/lib/actions/course-material-actions';
import type { CourseMaterialItem } from '@/lib/data/course-material-data';
import {
  COURSE_MATERIAL_ALLOWED_EXTENSIONS,
  COURSE_MATERIAL_ALLOWED_MIME_TYPES,
  COURSE_MATERIAL_MAX_SIZE_BYTES,
  COURSE_MATERIAL_MIME_BY_EXTENSION,
} from '@/lib/consts/course-material-consts';
import { formatFileSize } from '@/lib/utils';

type CourseMaterialsManagerProps = {
  courseId: string;
  initialMaterials: CourseMaterialItem[];
};

export function CourseMaterialsManager({
  courseId,
  initialMaterials,
}: CourseMaterialsManagerProps) {
  const addMaterialWithCourseId = addCourseMaterial.bind(null, courseId);
  const initialState: CourseMaterialFormState = { message: null, success: false };
  const [state, formAction, isPending] = useActionState(addMaterialWithCourseId, initialState);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [clientFileError, setClientFileError] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      setSelectedFiles([]);
      setFileValidationErrors([]);
      setClientFileError(null);
      router.refresh();
    }
  }, [state.success, router]);

  const allowedExtensionsLabel = Array.from(COURSE_MATERIAL_ALLOWED_EXTENSIONS).join(', ');

  function handleSubmit(formData: FormData) {
    const selectedFile = selectedFiles[0];

    if (!selectedFile) {
      setClientFileError('Seleccioná un archivo.');
      return;
    }

    setClientFileError(null);
    formData.set('file', selectedFile);

    startTransition(() => {
      formAction(formData);
    });
  }

  function handleDelete(materialId: string) {
    if (!window.confirm('¿Eliminar este material? Esta acción no se puede deshacer.')) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteCourseMaterial(courseId, materialId);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <form
        action={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-900">Subir material</h2>
          <p className="mt-1 text-sm text-slate-500">
            Formatos permitidos: {allowedExtensionsLabel}. Máximo{' '}
            {formatFileSize(COURSE_MATERIAL_MAX_SIZE_BYTES)}.
          </p>
        </div>

        {state.success && state.message && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {state.message}
          </p>
        )}

        {!state.success && state.message && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.message}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Título visible para alumnos</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ej: Guía de módulo 1"
            required
            disabled={isPending}
          />
          {state.errors?.title?.map((error) => (
            <p key={error} className="text-xs text-red-500">
              {error}
            </p>
          ))}
        </div>

        <FileAttachmentPicker
          id="course-material-file"
          label="Archivo"
          files={selectedFiles}
          onFilesChange={setSelectedFiles}
          multiple={false}
          disabled={isPending}
          allowedExtensions={COURSE_MATERIAL_ALLOWED_EXTENSIONS}
          allowedMimeTypes={COURSE_MATERIAL_ALLOWED_MIME_TYPES}
          maxSizeBytes={COURSE_MATERIAL_MAX_SIZE_BYTES}
          mimeTypeByExtension={COURSE_MATERIAL_MIME_BY_EXTENSION}
          validationErrors={fileValidationErrors}
          onValidationErrorsChange={setFileValidationErrors}
          fieldErrors={clientFileError ? [clientFileError] : state.errors?.file}
        />

        <Button type="submit" disabled={isPending}>
          <Upload size={16} className="mr-2" />
          {isPending ? 'Subiendo...' : 'Agregar material'}
        </Button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Materiales del curso ({initialMaterials.length})
        </h2>

        {initialMaterials.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay materiales. Los alumnos los verán en el aula cuando tengan acceso.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {initialMaterials.map((material) => (
              <li
                key={material.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{material.title}</p>
                    <p className="truncate text-sm text-slate-500">{material.filename}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(material.size)}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={isDeleting}
                  onClick={() => handleDelete(material.id)}
                >
                  <Trash2 size={14} className="mr-1" />
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
