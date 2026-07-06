import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Users, Calendar, Eye, EyeOff, BookOpen, BarChart3, CheckCircle, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

    // 2. NUEVO: Procesamos las viñetas de la misma forma que en la landing pública
    const bulletPoints = course.learningOutcomes 
        ? course.learningOutcomes.split('\n').filter((line: string) => line.trim() !== '')
        : [];

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
            
            {/* ENCABEZADO Y ACCIONES */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/courses">
                        <Button variant="outline" size="icon" className="shrink-0" title="Volver al listado">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
                            {course.isPublished ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                                    <Eye size={12} className="mr-1" /> Publicado
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-slate-500 bg-slate-100 border-none">
                                    <EyeOff size={12} className="mr-1" /> Borrador
                                </Badge>
                            )}
                        </div>
                        <p className="text-slate-500 mt-1 font-mono text-sm">URL pública: /education/{course.slug}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Link href={`/admin/courses/${course.id}/edit`} className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                            <Pencil size={16} className="mr-2" /> Editar Curso
                        </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}/materials`} className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                            <FolderOpen size={16} className="mr-2" /> Materiales ({materialCount})
                        </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}/registrations`} className="flex-1 md:flex-none">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            <Users size={16} className="mr-2" /> Ver Alumnos
                        </Button>
                    </Link>
                </div>
            </div>

            {/* TARJETAS DE MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Inscriptos</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{course.registrations}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Creado El</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">
                            {new Date(course.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Detalles</p>
                        <p className="text-md font-semibold text-slate-700 mt-0.5">{course.duration} · Nivel {course.level}</p>
                    </div>
                </div>
            </div>

            {/* CUERPO PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Columna Izquierda: Detalles del Contenido */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Tarjeta 1: Descripción corta (Catálogo) */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">Descripción del Catálogo (Tarjeta)</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {course.shortDescription}
                        </p>
                    </div>

                    {/* Tarjeta 2: NUEVO - Vista previa de "¿Qué vas a aprender?" */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-1">Sección: ¿Qué vas a aprender? (Landing)</h2>
                            <p className="text-xs text-slate-400">Previsualización de los textos detallados del curso.</p>
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Párrafo Introductorio</h3>
                            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                                {course.learningObjective || <span className="text-slate-400 italic">No se ha cargado un párrafo introductorio todavía.</span>}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Puntos Clave</h3>
                            {bulletPoints.length > 0 ? (
                                <ul className="space-y-2.5 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {bulletPoints.map((point: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                                            <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                            <span>{point.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    No se han cargado puntos clave por el momento.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Panel Lateral */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                        <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 size={18} className="text-slate-500" />
                            Resumen de Campaña
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Estado de Conversión</span>
                                <span className="font-medium text-emerald-600">Activo</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Tipo de Acceso</span>
                                <span className="font-medium text-slate-700">Formulario Libre</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}