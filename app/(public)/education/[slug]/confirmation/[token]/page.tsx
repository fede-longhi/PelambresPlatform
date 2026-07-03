import Link from 'next/link';
import { CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    fetchRegistrationByConfirmationToken,
    markRegistrationConfirmed,
} from '@/lib/data/course-data';

type ConfirmPageProps = {
    params: Promise<{ slug: string; token: string }>;
};

export default async function ConfirmRegistrationPage({ params }: ConfirmPageProps) {
    const resolvedParams = await params;
    const { slug, token } = resolvedParams;

    let isSuccess = false;
    let message = "";
    let courseTitle = "";
    let isFreeCourse = false;
    let wasAlreadyConfirmed = false;

    try {
        const registration = await fetchRegistrationByConfirmationToken(token);

        if (!registration) {
            isSuccess = false;
            message = "El enlace de confirmación es inválido o ha expirado.";
        } else if (registration.token_used) {
            isSuccess = true;
            courseTitle = registration.courseTitle;
            isFreeCourse = Number(registration.coursePrice) <= 0;
            wasAlreadyConfirmed = true;
            message = `Tu correo ya se encontraba verificado para el curso ${courseTitle}. ¡Ya tenés tu lugar reservado!`;
        } else {
            isFreeCourse = Number(registration.coursePrice) <= 0;
            await markRegistrationConfirmed(registration.id);
            isSuccess = true;
            courseTitle = registration.courseTitle;
            message = isFreeCourse
                ? `¡Listo! Confirmamos tu inscripción a ${courseTitle}. Ya podés acceder al aula desde tu portal de cliente.`
                : `¡Espectacular! Verificamos tu correo con éxito. Tu lugar en ${courseTitle} ya está reservado.`;
        }
    } catch (error) {
        console.error("Error validando el token de inscripción:", error);
        isSuccess = false;
        message = "Ocurrió un error interno al intentar confirmar tu inscripción. Por favor, volvé a intentarlo en unos minutos.";
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

                {isSuccess && !wasAlreadyConfirmed && (
                    <div className="bg-slate-50 border border-slate-100 text-left p-4 rounded-xl text-xs text-slate-500 space-y-2 leading-relaxed">
                        <p className="font-semibold text-slate-700 text-sm mb-1">¿Qué pasa ahora?</p>
                        {isFreeCourse ? (
                            <>
                                <p>1. Iniciá sesión en el portal de cliente con el mismo email de la inscripción.</p>
                                <p>2. En <strong>Mis cursos</strong> vas a encontrar el curso y toda la información del aula.</p>
                            </>
                        ) : (
                            <>
                                <p>1. Nos pondremos en contacto por email o WhatsApp para enviarte las instrucciones de pago.</p>
                                <p>2. Una vez confirmado el pago, vas a poder acceder al aula desde tu portal de cliente.</p>
                            </>
                        )}
                    </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                    {isSuccess && isFreeCourse && (
                        <Link href="/login?callbackUrl=/customer/courses">
                            <Button className="w-full">
                                Ir al portal de cliente
                            </Button>
                        </Link>
                    )}
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
