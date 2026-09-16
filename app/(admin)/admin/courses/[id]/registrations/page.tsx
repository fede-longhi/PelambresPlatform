import {
    fetchCourseTitle,
    fetchCourseRegistrations,
} from '@/lib/data/course-data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lusitana } from '@/app/fonts';
import {
    REGISTRATION_STATUSES,
    PAYMENT_STATUSES,
    PAYMENT_METHODS,
} from '@/lib/consts/registration-consts';

type PageProps = {
    params: Promise<{ id: string }>;
};

function getRegistrationBadge(status: string) {
    const label = REGISTRATION_STATUSES.find(s => s.value === status)?.label || status;
    switch (status) {
        case 'confirmed': return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"><CheckCircle2 size={12} aria-hidden="true" /> {label}</span>;
        case 'cancelled': return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"><XCircle size={12} aria-hidden="true" /> {label}</span>;
        default: return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"><Clock size={12} aria-hidden="true" /> {label}</span>;
    }
}

function getPaymentBadge(status: string) {
    const label = PAYMENT_STATUSES.find(s => s.value === status)?.label || status;
    switch (status) {
        case 'paid': return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">{label}</span>;
        case 'partial': return <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{label}</span>;
        case 'refunded': return <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{label}</span>;
        default: return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">{label}</span>;
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
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="size-11 shrink-0 md:size-9">
                        <Link href={`/admin/courses/${courseId}`} aria-label="Volver al curso">
                            <ArrowLeft size={18} aria-hidden="true" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className={`${lusitana.className} text-2xl font-semibold`}>Inscripciones</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Curso: <span className="font-medium text-foreground">{courseTitle}</span>
                        </p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/admin/courses/${courseId}/broadcast-email`}>
                        Enviar correo
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total inscripciones</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums">{totalRegistrations}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Lugares confirmados</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums">{totalConfirmed}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Pagos completados</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums">{totalPaid}</p>
                </div>
            </div>

            {registrations.length === 0 ? (
                <div className="rounded-lg bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                    No hay inscripciones en este curso todavía.
                </div>
            ) : (
                <>
                    <div className="md:hidden">
                        {registrations.map((registration) => {
                            const methodLabel = PAYMENT_METHODS.find(m => m.value === registration.payment_method)?.label || '-';
                            return (
                                <div key={registration.id} className="mb-2 rounded-md border bg-card p-4">
                                    <div className="flex items-start justify-between gap-3 border-b pb-3">
                                        <div className="min-w-0">
                                            <p className="font-medium">{registration.name}</p>
                                            <p className="truncate text-sm text-muted-foreground">{registration.email}</p>
                                            {registration.phone ? (
                                                <p className="text-xs text-muted-foreground">{registration.phone}</p>
                                            ) : null}
                                        </div>
                                        {getRegistrationBadge(registration.registration_status)}
                                    </div>
                                    <div className="flex items-center justify-between gap-2 pt-3">
                                        <div className="space-y-1">
                                            {getPaymentBadge(registration.payment_status)}
                                            {registration.payment_method ? (
                                                <p className="text-xs text-muted-foreground">{methodLabel}</p>
                                            ) : null}
                                        </div>
                                        <Button variant="ghost" size="icon" asChild className="size-11 md:size-9">
                                            <Link
                                                href={`/admin/courses/${courseId}/registrations/${registration.id}/edit`}
                                                aria-label={`Editar inscripción de ${registration.name}`}
                                            >
                                                <Pencil className="size-4" aria-hidden="true" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/40 text-muted-foreground">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">Alumno</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Contacto</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Pago</th>
                                    <th scope="col" className="px-4 py-3 text-right font-medium">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((registration) => {
                                    const methodLabel = PAYMENT_METHODS.find(m => m.value === registration.payment_method)?.label || '-';

                                    return (
                                        <tr key={registration.id} className="border-t">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{registration.name}</div>
                                                {registration.attended && (
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Asistió</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>{registration.email}</div>
                                                {registration.phone && <div className="mt-0.5 text-xs text-muted-foreground">{registration.phone}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(registration.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getRegistrationBadge(registration.registration_status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col items-start gap-1">
                                                    {getPaymentBadge(registration.payment_status)}
                                                    {registration.payment_method && (
                                                        <span className="text-xs text-muted-foreground">{methodLabel}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="icon" asChild className="size-11 md:size-9">
                                                    <Link
                                                        href={`/admin/courses/${courseId}/registrations/${registration.id}/edit`}
                                                        aria-label={`Editar inscripción de ${registration.name}`}
                                                    >
                                                        <Pencil className="size-4" aria-hidden="true" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
