import sql from '@/lib/db';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ConfirmPageProps = {
    params: Promise<{ slug: string; token: string }>;
};

export default async function ConfirmRegistrationPage({ params }: ConfirmPageProps) {
    const resolvedParams = await params;
    const { slug, token } = resolvedParams;

    let isSuccess = false;
    let message = "";
    let courseTitle = "";

    try {
        const registrations = await sql`
            SELECT r.id, r.token_used, c.title as "courseTitle"
            FROM course_registrations r
            JOIN courses c ON r.course_id = c.id
            WHERE r.confirmation_token = ${token}
            LIMIT 1
        `;

        const registration = registrations[0];

        if (!registration) {
            isSuccess = false;
            message = "El enlace de confirmación es inválido o ha expirado.";
        } else if (registration.token_used) {
            isSuccess = true;
            courseTitle = registration.courseTitle;
            message = `Tu correo ya se encontraba verificado para el curso ${courseTitle}. ¡Ya tienes tu lugar reservado!`;
        } else {
            await sql`
                UPDATE course_registrations
                SET registration_status = 'confirmed',
                    token_used = true
                WHERE id = ${registration.id}
            `;
            isSuccess = true;
            courseTitle = registration.courseTitle;
            message = `¡Espectacular! Hemos verificado tu correo con éxito. Tu lugar en la capacitación de ${courseTitle} ya está formalmente reservado.`;
        }
    } catch (error) {
        console.error("Error validando el token de inscripción:", error);
        isSuccess = false;
        message = "Ocurrió un error interno al intentar confirmar tu inscripción. Por favor, vuelve a intentarlo en unos minutos.";
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center space-y-6">
                
                <div className="flex justify-center">
                    {isSuccess ? (
                        <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full border border-emerald-100 shadow-sm animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                    ) : (
                        <div className="bg-amber-50 text-amber-500 p-4 rounded-full border border-amber-100 shadow-sm">
                            <AlertTriangle size={48} />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isSuccess ? "¡Inscripción Confirmada!" : "Hubo un problema"}
                    </h1>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {isSuccess && (
                    <div className="bg-slate-50 border border-slate-100 text-left p-4 rounded-xl text-xs text-slate-500 space-y-2 leading-relaxed">
                        <p className="font-semibold text-slate-700 text-sm mb-1">¿Qué pasa ahora?</p>
                        <p>1. Nos pondremos en contacto contigo por email o WhatsApp para enviarte las instrucciones de pago si el curso es arancelado.</p>
                        <p>2. Una vez registrado el pago, te daremos el acceso definitivo a los materiales o el enlace de la sala virtual.</p>
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                    {/* El botón ahora apunta inteligentemente al curso usando el slug de la URL */}
                    <Link href={`/education/${slug}`}>
                        <Button variant="outline" className="w-full">
                            <ArrowLeft size={16} className="mr-2" /> Volver al curso
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
}