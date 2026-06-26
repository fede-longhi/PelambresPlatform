import { fetchCourseTitle, fetchBroadcastRegistrants } from '@/lib/data/course-data';
import { notFound } from 'next/navigation';
import { BroadcastEmailForm } from './broadcast-email-form';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function CourseBroadcastPage({ params }: PageProps) {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const courseTitle = await fetchCourseTitle(courseId);
    if (!courseTitle) notFound();

    const registrants = await fetchBroadcastRegistrants(courseId);

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            <BroadcastEmailForm 
                courseId={courseId} 
                courseTitle={courseTitle} 
                initialRegistrants={registrants} 
            />
        </div>
    );
}