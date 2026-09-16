import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lusitana } from '@/app/fonts';
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
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="size-11 shrink-0 md:size-9">
          <Link href={`/admin/courses/${courseId}`} aria-label="Volver al curso">
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className={`${lusitana.className} text-2xl font-semibold`}>Materiales del curso</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courseTitle}</p>
        </div>
      </div>

      <CourseMaterialsManager courseId={courseId} initialMaterials={materials} />
    </div>
  );
}
