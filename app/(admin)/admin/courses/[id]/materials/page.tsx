import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCourseTitle } from '@/lib/data/course-data';
import { fetchCourseMaterials } from '@/lib/data/course-material-data';
import { CourseMaterialsManager } from './course-materials-manager';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseMaterialsPage({ params }: PageProps) {
  const { id: courseId } = await params;

  const courseTitle = await fetchCourseTitle(courseId);
  if (!courseTitle) {
    notFound();
  }

  const materials = await fetchCourseMaterials(courseId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
      <div className="flex items-center gap-4">
        <Link href={`/admin/courses/${courseId}`}>
          <Button variant="outline" size="icon" title="Volver al curso">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Materiales del curso</h1>
          <p className="mt-1 text-sm text-slate-500">{courseTitle}</p>
        </div>
      </div>

      <CourseMaterialsManager courseId={courseId} initialMaterials={materials} />
    </div>
  );
}
