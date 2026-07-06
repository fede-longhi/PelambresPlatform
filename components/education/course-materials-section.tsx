import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CourseMaterialItem } from '@/lib/data/course-material-data';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CourseMaterialsSectionProps = {
  materials: CourseMaterialItem[];
  variant?: 'student' | 'admin';
};

export function CourseMaterialsSection({
  materials,
  variant = 'student',
}: CourseMaterialsSectionProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Materiales del curso</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {variant === 'student'
          ? 'Descargá los recursos disponibles para este curso.'
          : 'Archivos disponibles para alumnos con acceso al aula.'}
      </p>

      <ul className="mt-4 space-y-3">
        {materials.map((material) => (
          <li
            key={material.id}
            className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{material.title}</p>
                <p className="truncate text-sm text-muted-foreground">{material.filename}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(material.size)}</p>
              </div>
            </div>

            {variant === 'student' ? (
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href={`/api/course-materials/${material.id}/download`}>
                  <Download size={14} className="mr-1" />
                  Descargar
                </Link>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Visible en el aula
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
