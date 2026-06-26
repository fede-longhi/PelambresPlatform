import Link from 'next/link';
import { BookOpen, Clock, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPublishedCourses } from '@/lib/data/course-data';

export const revalidate = 60;

export default async function EducationCatalogPage() {
    const publishedCourses = await fetchPublishedCourses();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            
            <section className="bg-slate-900 text-white py-20 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-full mb-4">
                        <BookOpen className="text-blue-400" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Academia Pelambres
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        Aprende a profesionalizar tu negocio de impresión 3D. Descubre nuestras guías, herramientas y cursos diseñados para llevar tu rentabilidad al siguiente nivel.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Nuestros Cursos Disponibles</h2>
                
                {publishedCourses.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                        <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Estamos preparando nuevo contenido</h3>
                        <p className="text-slate-500">Vuelve pronto para descubrir nuestros próximos cursos sobre impresión 3D y negocios.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publishedCourses.map((course) => (
                            <div key={course.id} className="bg-white flex flex-col border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">
                                        {course.shortDescription}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                            <Clock size={14} className="mr-1.5" />
                                            {course.duration}
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                            <Target size={14} className="mr-1.5" />
                                            {course.level}
                                        </div>
                                    </div>
                                    
                                    <Link href={`/education/${course.slug}`} className="block w-full mt-auto">
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                            Ver detalles <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}