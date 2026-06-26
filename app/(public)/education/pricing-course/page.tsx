import { Target, Clock, CheckCircle } from 'lucide-react';
import { CourseRegistrationForm } from '@/components/education/course-registration-form';

export default function PricingCoursePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* HERO SECTION */}
            <section className="bg-slate-900 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Domina los Costos de tu Impresión 3D
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        Deja de perder dinero por no saber cobrar. Aprende a calcular el valor real de tus productos.
                    </p>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                
                {/* LEFT SIDE: Course Info */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">¿Qué vas a aprender?</h2>
                        <ul className="space-y-4">
                            {[
                                'Calcular el costo real por gramo de filamento (PLA, PETG, TPU).',
                                'Estimar el costo eléctrico y de mantenimiento por hora de impresión.',
                                'Valorar tu mano de obra y tiempo de post-procesado.',
                                'Aplicar márgenes de ganancia escalables para tu negocio.',
                                'Automatizar tus presupuestos con la calculadora Pelambres.'
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-3 text-slate-700">
                                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Clock className="text-blue-500" size={24} />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Duración</p>
                                <p className="text-sm text-slate-500">2 Semanas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Target className="text-blue-500" size={24} />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Nivel</p>
                                <p className="text-sm text-slate-500">Principiante / Medio</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Registration Form */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 sticky top-24">
                    <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">¡Reserva tu lugar!</h3>
                    <p className="text-center text-slate-500 mb-6 text-sm">Cupos limitados para la próxima edición.</p>
                    {/* Pasamos el ID en inglés */}
                    <CourseRegistrationForm courseId="3d-pricing-course" />
                </div>
                
            </section>
        </div>
    );
}