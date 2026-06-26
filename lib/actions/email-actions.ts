'use server';

import { z } from 'zod';
import sql from '@/lib/db';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import { BroadcastEmail } from '@/lib/mail/templates/broadcast-email';
import { revalidatePath } from 'next/cache';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GOOGLE_MAIL_USER,
        pass: process.env.GOOGLE_MAIL_PASSWORD,
    },
});

const BroadcastSchema = z.object({
    subject: z.string().min(3, { message: "El asunto debe tener al menos 3 caracteres." }),
    message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

export type BroadcastFormState = {
    errors?: { subject?: string[]; message?: string[] };
    message?: string | null;
    success?: boolean;
};

export async function sendBroadcastEmail(
    courseId: string,
    prevState: BroadcastFormState,
    formData: FormData
) {
    // 1. Validamos asunto y mensaje con Zod como antes
    const validatedFields = BroadcastSchema.safeParse({
        subject: formData.get('subject'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Por favor, corrige los errores en el formulario.",
            success: false,
        };
    }

    const { subject, message } = validatedFields.data;

    // 2. CAPTURAMOS LOS EMAILS SELECCIONADOS DESDE EL FORMULARIO
    // formData.getAll devuelve un array de strings con los valores de los checkboxes marcados
    const selectedEmails = formData.getAll('selectedRegistrants') as string[];

    if (!selectedEmails || selectedEmails.length === 0) {
        return {
            success: false,
            message: "Debes seleccionar al menos un alumno destinatario.",
        };
    }

    try {
        const emailHtml = await render(BroadcastEmail({ subject, message }));

        // 3. Enviamos el correo ÚNICAMENTE a las casillas seleccionadas
        for (const email of selectedEmails) {
            await transporter.sendMail({
                from: '"Pelambres 3D" <hola@tudominio.com>',
                to: email,
                subject: subject,
                html: emailHtml,
            });
        }

        return {
            success: true,
            message: `¡Email enviado con éxito a los ${selectedEmails.length} alumnos seleccionados!`,
        };

    } catch (error) {
        console.error("Error en el envío masivo seleccionado:", error);
        return {
            success: false,
            message: "Hubo un error interno al intentar enviar los correos.",
        };
    }
}