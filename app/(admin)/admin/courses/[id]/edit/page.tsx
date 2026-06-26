import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import sql from '@/lib/db';
import { EditCourseForm } from './edit-course-form';

type EditCoursePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export type CourseRow = {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    duration: string;
    level: string;
    isPublished: boolean;
    learningObjective?: string;
    learningOutcomes?: string;
    modality?: string;
    startDate?: string | null;
    schedule?: string;
    location?: string;
    maxStudents?: number;
    price?: number;
    currency?: string;
    notes?: string;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
    const resolvedParams = await params;
    const courseId = resolvedParams?.id;

    if (!courseId) {
        notFound();
    }

    const courses = await sql<CourseRow[]>`
        SELECT 
            id, 
            title, 
            slug, 
            short_description as "shortDescription", 
            duration, 
            level, 
            is_published as "isPublished",
            learning_objective as "learningObjective",
            learning_outcomes as "learningOutcomes",
            -- NUEVOS CAMPOS:
            modality,
            start_date as "startDate",
            schedule,
            location,
            max_students as "maxStudents",
            price,
            currency,
            notes
        FROM courses 
        WHERE id = ${courseId}
        LIMIT 1
    `;

    const course = courses[0];

    if (!course) {
        notFound();
    }

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
            
            <div className="flex items-center gap-4">
                <Link href="/admin/courses">
                    <Button variant="outline" size="icon" className="shrink-0">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Editar Curso</h1>
                    <p className="text-slate-500 mt-1">Modifica los detalles de la capacitación.</p>
                </div>
            </div>

            <EditCourseForm initialData={course} />
            
        </div>
    );
}