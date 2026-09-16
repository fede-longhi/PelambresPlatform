import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Users, Calendar, Eye, EyeOff, BookOpen, BarChart3, CheckCircle, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { lusitana } from '@/app/fonts';
import { fetchAdminCourseById } from '@/lib/data/course-data';
import { fetchCourseMaterialCount } from '@/lib/data/course-material-data';

type CourseDetailPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AdminCourseDetailPage({ params }: CourseDetailPageProps) {
    const resolvedParams = await params;
    const courseId = resolvedParams?.id;

    if (!courseId) {
        notFound();
    }

    const course = await fetchAdminCourseById(courseId);

    if (!course) {
        notFound();
    }

    const materialCount = await fetchCourseMaterialCount(courseId);

    const bulletPoints = course.learningOutcomes
        ? course.learningOutcomes.split('\n').filter((line: string) => line.trim() !== '')
        : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="icon" asChild className="size-11 shrink-0 md:size-9">
                        <Link href="/admin/courses" aria-label="Volver al listado">
                            <ArrowLeft size={18} aria-hidden="true" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className={`${lusitana.className} text-2xl font-semibold`}>{course.title}</h1>
                            {course.isPublished ? (
                                <Badge>
                                    <Eye size={12} className="mr-1" aria-hidden="true" /> Publicado
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    <EyeOff size={12} className="mr-1" aria-hidden="true" /> Borrador
                                </Badge>
                            )}
                        </div>
                        <p className="mt-1 font-mono text-sm text-muted-foreground">
                            URL pública: /education/{course.slug}
                        </p>
                    </div>
                </div>

                <div className="flex w-full flex-wrap gap-3 md:w-auto">
                    <Button variant="outline" asChild className="flex-1 md:flex-none">
                        <Link href={`/admin/courses/${course.id}/edit`}>
                            <Pencil size={16} className="mr-2" aria-hidden="true" /> Editar curso
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1 md:flex-none">
                        <Link href={`/admin/courses/${course.id}/materials`}>
                            <FolderOpen size={16} className="mr-2" aria-hidden="true" /> Materiales ({materialCount})
                        </Link>
                    </Button>
                    <Button asChild className="flex-1 md:flex-none">
                        <Link href={`/admin/courses/${course.id}/registrations`}>
                            <Users size={16} className="mr-2" aria-hidden="true" /> Ver alumnos
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-4 rounded-lg border bg-card p-5">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                        <Users size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Inscriptos</p>
                        <p className="mt-0.5 text-2xl font-semibold">{course.registrations}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border bg-card p-5">
                    <div className="rounded-lg bg-muted p-3 text-foreground">
                        <Calendar size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Creado</p>
                        <p className="mt-0.5 text-lg font-semibold">
                            {new Date(course.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border bg-card p-5 sm:col-span-2 lg:col-span-1">
                    <div className="rounded-lg bg-muted p-3 text-foreground">
                        <BookOpen size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Detalles</p>
                        <p className="mt-0.5 font-medium">{course.duration} · Nivel {course.level}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-3 rounded-lg border bg-card p-6">
                        <h2 className="text-lg font-semibold">Descripción del catálogo</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {course.shortDescription}
                        </p>
                    </div>

                    <div className="space-y-6 rounded-lg border bg-card p-6">
                        <div>
                            <h2 className="mb-1 text-lg font-semibold">Qué se va a aprender</h2>
                            <p className="text-xs text-muted-foreground">Textos que se muestran en la landing del curso.</p>
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Párrafo introductorio</h3>
                            <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm leading-relaxed">
                                {course.learningObjective || <span className="italic text-muted-foreground">Sin párrafo introductorio.</span>}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">Puntos clave</h3>
                            {bulletPoints.length > 0 ? (
                                <ul className="space-y-2.5 rounded-md bg-muted/40 p-4">
                                    {bulletPoints.map((point: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2.5 text-sm">
                                            <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                                            <span>{point.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="rounded-md bg-muted/40 p-4 text-sm italic text-muted-foreground">
                                    No hay puntos clave cargados.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4 rounded-lg border bg-card p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                            <BarChart3 size={18} className="text-muted-foreground" aria-hidden="true" />
                            Resumen
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Conversión</span>
                                <span className="font-medium">Activo</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo de acceso</span>
                                <span className="font-medium">Formulario libre</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
