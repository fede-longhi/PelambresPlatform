import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lusitana } from '@/app/fonts';
import { fetchCourseForEdit } from '@/lib/data/course-data';
import { EditCourseForm } from './edit-course-form';

type EditCoursePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
    const resolvedParams = await params;
    const courseId = resolvedParams?.id;

    if (!courseId) {
        notFound();
    }

    const course = await fetchCourseForEdit(courseId);

    if (!course) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="size-11 shrink-0 md:size-9">
                    <Link href={`/admin/courses/${courseId}`} aria-label="Volver al curso">
                        <ArrowLeft size={18} aria-hidden="true" />
                    </Link>
                </Button>
                <div>
                    <h1 className={`${lusitana.className} text-2xl font-semibold`}>Editar curso</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Detalles de la capacitación.
                    </p>
                </div>
            </div>

            <EditCourseForm initialData={course} />
        </div>
    );
}
