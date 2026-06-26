import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import { BroadcastEmailForm } from './broadcast-email-form';

type PageProps = {
    params: Promise<{ id: string }>;
};

type Registrant = {
    id: string;
    name: string;
    email: string;
};

export default async function CourseBroadcastPage({ params }: PageProps) {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const courses = await sql`SELECT title FROM courses WHERE id = ${courseId}`;
    if (courses.length === 0) notFound();

    const registrants = await sql<Registrant[]>`
        SELECT id, full_name as name, email_address as email 
        FROM course_registrations 
        WHERE course_id = ${courseId}
        ORDER BY name ASC
    `;

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            <BroadcastEmailForm 
                courseId={courseId} 
                courseTitle={courses[0].title} 
                initialRegistrants={registrants} 
            />
        </div>
    );
}