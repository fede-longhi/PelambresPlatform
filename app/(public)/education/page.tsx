import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { fetchPublishedCourses } from '@/lib/data/course-data';
import { CourseCatalogCard } from '@/components/education/course-catalog-card';

export const revalidate = 60;

export default async function EducationCatalogPage() {
    const publishedCourses = await fetchPublishedCourses();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <section className="bg-slate-900 px-4 py-20 text-white">
                <div className="mx-auto max-w-5xl space-y-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-600/20 p-3">
                        <BookOpen className="text-blue-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                        Academia Pelambres
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-300 md:text-xl">
                        Aprendé a profesionalizar tu negocio de impresión 3D. Descubrí nuestros
                        cursos diseñados para llevar tu rentabilidad al siguiente nivel.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-16">
                <h2 className="mb-8 text-2xl font-bold text-slate-900">Nuestros cursos disponibles</h2>

                {publishedCourses.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <BookOpen className="mx-auto mb-4 text-slate-300" size={48} />
                        <h3 className="mb-2 text-xl font-bold text-slate-700">
                            Estamos preparando nuevo contenido
                        </h3>
                        <p className="text-slate-500">
                            Volvé pronto para descubrir nuestros próximos cursos sobre impresión 3D
                            y negocios.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {publishedCourses.map((course) => (
                            <CourseCatalogCard key={course.id} course={course} />
                        ))}
                    </div>
                )}

                <p className="mt-10 text-center text-sm text-slate-500">
                    ¿Tenés dudas?{' '}
                    <Link href="/quote-request" className="font-medium text-blue-600 hover:underline">
                        Contactanos
                    </Link>{' '}
                    y te ayudamos a elegir el curso ideal.
                </p>
            </section>
        </div>
    );
}
