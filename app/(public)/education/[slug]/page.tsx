import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { auth } from '@/auth';
import { fetchExistingCourseRegistrationByUserId, fetchPublishedCourseBySlug } from '@/lib/data/course-data';
import { fetchUserById } from '@/lib/data/user-data';
import { getUserDisplayName } from '@/lib/utils';
import {
    CourseRegistrationForm,
    type CourseRegistrationSession,
} from '@/components/education/course-registration-form';
import { CourseBadges } from '@/components/education/course-badges';
import { CourseDetailFacts } from '@/components/education/course-detail-facts';
import { CourseLearningSection } from '@/components/education/course-learning-section';
import { CourseNotesSection } from '@/components/education/course-notes-section';
import { formatCourseCapacity } from '@/lib/utils/course-display';

type CoursePageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
    const { slug } = await params;
    const course = await fetchPublishedCourseBySlug(slug);

    if (!course) {
        return { title: 'Curso no encontrado' };
    }

    return {
        title: `${course.title} | Academia Pelambres`,
        description: course.shortDescription,
    };
}

export default async function PublicCoursePage({ params }: CoursePageProps) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    if (!slug) {
        notFound();
    }

    const course = await fetchPublishedCourseBySlug(slug);

    if (!course) {
        notFound();
    }

    const session = await auth();
    const sessionUser = session?.user;
    let registrationSession: CourseRegistrationSession | undefined;

    if (
        sessionUser?.id &&
        sessionUser.email &&
        sessionUser.isActive !== false &&
        sessionUser.hasPlatformAccess
    ) {
        const dbUser = await fetchUserById(sessionUser.id);
        const existingRegistration = await fetchExistingCourseRegistrationByUserId(
            course.id,
            sessionUser.id
        );

        registrationSession = {
            name: dbUser ? getUserDisplayName(dbUser) : sessionUser.name ?? '',
            email: sessionUser.email,
            existingRegistration: existingRegistration
                ? { status: existingRegistration.registrationStatus }
                : undefined,
            coursesHref:
                sessionUser.role === 'customer' ? `/customer/courses/${slug}` : undefined,
        };
    }

    const capacity = formatCourseCapacity(course.maxStudents, course.activeRegistrations);
    const isFull = course.maxStudents > 0 && course.activeRegistrations >= course.maxStudents;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            <div className="bg-slate-900 px-6 py-16 text-white md:py-24">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/education"
                        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Volver a cursos
                    </Link>

                    <div className="max-w-3xl space-y-6">
                        <CourseBadges
                            modality={course.modality}
                            level={course.level}
                            variant="hero"
                        />

                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            {course.title}
                        </h1>

                        <p className="text-lg leading-relaxed text-slate-300">
                            {course.shortDescription}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="inline-flex items-center gap-2">
                                <Clock size={16} />
                                {course.duration}
                            </span>
                            {capacity.detail && (
                                <span>{capacity.detail}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                    <div className="space-y-12 lg:col-span-2">
                        <CourseLearningSection
                            learningObjective={course.learningObjective}
                            learningOutcomes={course.learningOutcomes}
                        />

                        <section className="lg:hidden">
                            <h2 className="mb-4 text-2xl font-bold text-slate-900">
                                Detalles del curso
                            </h2>
                            <CourseDetailFacts
                                course={course}
                                variant="grid"
                            />
                        </section>

                        {course.notes && <CourseNotesSection notes={course.notes} />}
                    </div>

                    <div className="sticky top-24 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
                        <div className="hidden space-y-4 border-b border-slate-100 pb-6 lg:block">
                            <h3 className="text-xl font-bold text-slate-900">Detalles del curso</h3>
                            <CourseDetailFacts course={course} variant="sidebar" />
                        </div>

                        <div>
                            <h3 className="mb-2 text-center text-lg font-bold text-slate-900">
                                {isFull ? 'Lista de espera' : '¡Reservá tu lugar!'}
                            </h3>
                            <p className="mb-6 text-center text-sm text-slate-500">
                                {isFull
                                    ? 'Este curso alcanzó el cupo máximo. Contactanos si querés más información.'
                                    : course.maxStudents > 0
                                      ? `${capacity.label}. Inscribite ahora para asegurar tu participación.`
                                      : 'Completá tus datos para acceder al curso.'}
                            </p>

                            {isFull ? (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
                                    Sin cupos disponibles por el momento.
                                </div>
                            ) : (
                                <CourseRegistrationForm
                                    courseId={course.id}
                                    sessionUser={registrationSession}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
