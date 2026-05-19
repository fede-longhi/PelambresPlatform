'use server';

import { z } from 'zod';
import postgres from 'postgres';
import nodemailer from 'nodemailer';
import { QuoteTable } from '../../types/definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    email: z.string({
        invalid_type_error: 'Ingresa un email de contacto.',
    }).email({message: 'Tiene que ingresar un email valido.'}),
    name: z.string({
        invalid_type_error: 'Ingresa un nombre.',
    }),
    phone: z.string()
    .trim()
    .regex(/^\+?[0-9\s-]+$/, "Debe contener solo números, espacios, guiones y opcionalmente empezar con +")
    .min(8, "El número debe tener al menos 8 dígitos")
    .max(20, "El número no puede tener más de 20 dígitos")
    .transform((val) => val.replace(/\D/g, "")),
    detail: z.string({
        invalid_type_error: 'Ingresa alguna descripción de tu proyecto.',
    }).min(10, {message: 'La descripción debe contener al menos 10 caracteres.'}),
    date: z.string(),
});

const CreateQuote = FormSchema.omit({ id: true, date: true });

export type QuoteFormState = {
    errors?: {
      email?: string[];
      name?: string[];
      phone?: string[];
      detail?: string[];
    };
    message?: string | null;
    status?: string | null;
    payload?: FormData;
};

export async function createQuote(
    _prevState: QuoteFormState,
    formData: FormData,
) : Promise<QuoteFormState>{
    const validatedFields = CreateQuote.safeParse({
        email: formData.get('email'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        detail: formData.get('detail'),
    });
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan completar algunos campos.',
            payload: formData,
        };
    }
    
    const { email, name, phone, detail } = validatedFields.data;
    const date = new Date().toISOString().split('T')[0];
    try {
        const result = await sql`
        INSERT INTO quote_requests (name, email, phone, detail, date)
        VALUES (${name}, ${email}, ${phone}, ${detail}, ${date})
        RETURNING id
        `;
        
        const fileUrlsRaw = formData.get('attachments') as string | null;
        let uploadedUrls: { pathname: string; downloadUrl: string }[] = [];
        
        if (fileUrlsRaw) {
            uploadedUrls = JSON.parse(fileUrlsRaw);
            
            const dbInserts = uploadedUrls.map(url => sql`
                INSERT INTO quote_request_attachments(quote_request_id, file_url)
                VALUES (${result[0].id}, ${url.downloadUrl})
            `);
            await Promise.all(dbInserts);
        }

        await sendQuoteEmail({
            id: result[0].id,
            name: name,
            phone: phone,
            detail: detail,
            email: email,
            date: date
        } as QuoteTable, uploadedUrls);

    } catch (error) {
        console.error(error);
        return { status: 'error', message: 'Error insertando la cotización.', payload: formData };
    }

    return { status: 'success', message: null, errors: {} };
}

async function sendQuoteEmail(quote: QuoteTable, attachments: { pathname: string; downloadUrl: string }[]) {
    try {
        const to = "pelambres3d@gmail.com";
        const subject = `NEW QUOTE REQUEST - ${quote.name}`;
        const body = `
            <div style="font-family: Arial, sans-serif; color: #222;">
            <h2 style="color: #2d7a7b;">Nuevo pedido de cotización</h2>
            <table style="border-collapse: collapse;">
                <tr>
                <td style="padding: 4px 8px;"><strong>Nombre:</strong></td>
                <td style="padding: 4px 8px;">${quote.name}</td>
                </tr>
                <tr>
                <td style="padding: 4px 8px;"><strong>Email:</strong></td>
                <td style="padding: 4px 8px;">${quote.email}</td>
                </tr>
                <tr>
                <td style="padding: 4px 8px;"><strong>Teléfono:</strong></td>
                <td style="padding: 4px 8px;">${quote.phone}</td>
                </tr>
                <tr>
                <td style="padding: 4px 8px;"><strong>Fecha:</strong></td>
                <td style="padding: 4px 8px;">${quote.date}</td>
                </tr>
            </table>
            <div style="margin-top: 16px;">
                <p style="margin-bottom: 4px;"><strong>Detalles del proyecto:</strong></p>
                <div style="background: #f6f6f6; padding: 12px; border-radius: 4px; border: 1px solid #e0e0e0;">
                ${quote.detail.replace(/\n/g, "<br>")}
                </div>
            </div>
            <div>
                <p><strong>Archivos adjuntos:</strong></p>
                <ul>
                ${attachments.map(attachment => `<li><a href="${attachment.downloadUrl}">${attachment.pathname}</a></li>`).join('')}
                </ul>
            </div>
            <hr style="margin: 24px 0;">
            <p style="font-size: 0.95em; color: #888;">Este mensaje fue enviado desde la plataforma de Pelambres.</p>
            </div>
        `;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GOOGLE_MAIL_USER,
                pass: process.env.GOOGLE_MAIL_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `"Pelambres 3D" <${process.env.GOOGLE_MAIL_USER}>`,
            to,
            subject,
            html: body,
        });
        console.log("Correo enviado con éxito:", info.response);
    } catch (error) {
        console.error("Error enviando el correo:", error);
    }
}