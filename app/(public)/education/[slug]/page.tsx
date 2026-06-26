import { notFound } from 'next/navigation';
import { fetchPublishedCourseBySlug } from '@/lib/data/course-data';
import { CheckCircle, Calendar, MapPin, Clock, Users, Banknote, Info } from 'lucide-react';
import { CourseRegistrationForm } from '@/components/education/course-registration-form'; 
import { COURSE_MODALITIES, CURRENCIES, COURSE_LEVELS } from '@/lib/consts/course-consts';

type CoursePageProps = {
    params: Promise<{ slug: string }>;
};

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

    // 2. Procesamos y formateamos los datos para la UI
    const bulletPoints = course.learningOutcomes 
        ? course.learningOutcomes.split('\n').filter((line: string) => line.trim() !== '')
        : [];

    // Mapeamos los valores en inglés a sus etiquetas en español
    const modalityLabel = COURSE_MODALITIES.find(m => m.value === course.modality)?.label || course.modality;
    const levelLabel = COURSE_LEVELS.find(l => l.value === course.level)?.label || course.level;
    const currencyLabel = CURRENCIES.find(c => c.value === course.currency)?.label || course.currency;

    // Formateamos fechas y números
    const formattedDate = course.startDate 
        ? new Date(course.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) 
        : null;
    
    // Si el precio es mayor a 0, lo formateamos bonito con separador de miles
    const numericPrice = Number(course.price);
    const formattedPrice = numericPrice > 0 
        ? `${currencyLabel} ${numericPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}` 
        : 'Gratis';

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            
            {/* HEADER / HERO SECTION */}
            <div className="bg-slate-900 text-white py-16 md:py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl space-y-6">
                        <div className="flex gap-3">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                {modalityLabel}
                            </span>
                            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                Nivel {levelLabel}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            {course.shortDescription}
                        </p>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    
                    {/* Columna Izquierda: Información del Curso */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* Sección: ¿Qué vas a aprender? */}
                        <section>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">¿Qué vas a aprender?</h2>
                            <p className="text-slate-600 mb-6 text-lg leading-relaxed whitespace-pre-wrap">
                                {course.learningObjective || 'En esta capacitación te daremos las herramientas necesarias para dominar esta área.'}
                            </p>
                            
                            {bulletPoints.length > 0 && (
                                <ul className="space-y-4 mt-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    {bulletPoints.map((point: string, index: number) => (
                                        <li key={index} className="flex items-start gap-4 text-slate-700">
                                            <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={24} />
                                            <span className="text-lg">{point.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {/* Sección: Notas / Requisitos (Solo si existe) */}
                        {course.notes && (
                            <section className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-900">
                                <div className="flex items-center gap-2 mb-3 font-bold text-amber-800">
                                    <Info size={20} />
                                    Aclaraciones Importantes
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {course.notes}
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Columna Derecha: Tarjeta de Logística e Inscripción */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 sticky top-24 space-y-8">
                        
                        {/* Resumen Comercial (Logística) */}
                        <div className="space-y-4 pb-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Detalles del Curso</h3>
                            
                            <div className="space-y-3 text-slate-600 text-sm">
                                <div className="flex items-center gap-3">
                                    <Banknote className="text-blue-600 shrink-0" size={18} />
                                    <span className="font-semibold text-slate-900 text-lg">{formattedPrice}</span>
                                </div>

                                {formattedDate && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-slate-400 shrink-0" size={18} />
                                        <span><strong>Inicio:</strong> {formattedDate}</span>
                                    </div>
                                )}

                                {course.schedule && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-slate-400 shrink-0" size={18} />
                                        <span><strong>Horario:</strong> {course.schedule}</span>
                                    </div>
                                )}

                                {course.location && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-slate-400 shrink-0" size={18} />
                                        <span><strong>Lugar:</strong> {course.location}</span>
                                    </div>
                                )}

                                {course.maxStudents > 0 && (
                                    <div className="flex items-center gap-3">
                                        <Users className="text-slate-400 shrink-0" size={18} />
                                        <span><strong>Cupos:</strong> {course.maxStudents} lugares</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Formulario de Inscripción */}
                        <div>
                            <h3 className="text-lg font-bold text-center text-slate-900 mb-2">¡Reserva tu lugar!</h3>
                            {course.maxStudents > 0 ? (
                                <p className="text-center text-slate-500 mb-6 text-sm">Cupos limitados. Inscríbete ahora para asegurar tu participación.</p>
                            ) : (
                                <p className="text-center text-slate-500 mb-6 text-sm">Completa tus datos para acceder al curso.</p>
                            )}
                            
                            {/* Tu componente cliente que maneja la inscripción */}
                            <CourseRegistrationForm courseId={course.id} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}