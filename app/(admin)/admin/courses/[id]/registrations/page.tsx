import {
    fetchCourseTitle,
    fetchCourseRegistrations,
} from '@/lib/data/course-data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    REGISTRATION_STATUSES, 
    PAYMENT_STATUSES, 
    PAYMENT_METHODS 
} from '@/lib/consts/registration-consts';

type PageProps = {
    params: Promise<{ id: string }>;
};

function getRegistrationBadge(status: string) {
    const label = REGISTRATION_STATUSES.find(s => s.value === status)?.label || status;
    switch (status) {
        case 'confirmed': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 size={12}/> {label}</span>;
        case 'cancelled': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12}/> {label}</span>;
        default: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock size={12}/> {label}</span>;
    }
}

function getPaymentBadge(status: string) {
    const label = PAYMENT_STATUSES.find(s => s.value === status)?.label || status;
    switch (status) {
        case 'paid': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">{label}</span>;
        case 'partial': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{label}</span>;
        case 'refunded': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{label}</span>;
        default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">{label}</span>;
    }
}

export default async function CourseRegistrationsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const courseTitle = await fetchCourseTitle(courseId);
    if (!courseTitle) notFound();

    const registrations = await fetchCourseRegistrations(courseId);
    const totalRegistrations = registrations.length;
    const totalPaid = registrations.filter(r => r.payment_status === 'paid').length;
    const totalConfirmed = registrations.filter(r => r.registration_status === 'confirmed').length;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/courses`}>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Inscripciones</h1>
                        <p className="text-slate-500 mt-1">Curso: <span className="font-semibold text-slate-700">{courseTitle}</span></p>
                    </div>
                </div>
                <Link href={`/admin/courses/${courseId}/broadcast-email`}>
                    <Button variant="outline">Enviar Broadcast</Button>
                </Link>
            </div>

            {/* Tarjetas de Resumen Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Inscripciones</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalRegistrations}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Lugares Confirmados</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalConfirmed}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Pagos Completados</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{totalPaid}</p>
                </div>
            </div>

            {/* Tabla de Registros */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Alumno</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Fecha Inscripción</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Pago</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {registrations.length > 0 ? (
                                registrations.map((registration) => {
                                    const methodLabel = PAYMENT_METHODS.find(m => m.value === registration.payment_method)?.label || '-';
                                    
                                    return (
                                        <tr key={registration.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{registration.name}</div>
                                                {registration.attended && (
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Asistió</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-600">{registration.email}</div>
                                                {registration.phone && <div className="text-slate-500 text-xs mt-0.5">{registration.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(registration.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRegistrationBadge(registration.registration_status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    {getPaymentBadge(registration.payment_status)}
                                                    {registration.payment_method && (
                                                        <span className="text-xs text-slate-400">{methodLabel}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* ACTUALIZADO A /registrations/ */}
                                                <Link href={`/admin/courses/${courseId}/registrations/${registration.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                                        <Edit size={16} className="mr-2" /> Editar
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No hay inscripciones en este curso todavía.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}