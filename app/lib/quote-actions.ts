'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';
import postgres from 'postgres';
import nodemailer from 'nodemailer';
import { QuoteTable } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    email: z.string({
        invalid_type_error: 'Ingresa un email de contacto.',
    }).email({message: 'Tiene que ingresar un email valido.'}),
    firstName: z.string(),
    lastName: z.string(),
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
      firstName?: string[];
      lastName?: string[];
      phone?: string[];
      detail?: string[];
    };
    message?: string | null;
    payload?: FormData;
};

export async function createQuote(
    _prevState: QuoteFormState,
    formData: FormData,
) {
    const validatedFields = CreateQuote.safeParse({
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
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

    
    const { email, firstName, lastName, phone, detail } = validatedFields.data;
    const date = new Date().toISOString().split('T')[0];
    try {
        const result = await sql`
        INSERT INTO quote_requests (first_name, last_name, email, phone, detail, date)
        VALUES (${firstName}, ${lastName}, ${email}, ${phone}, ${detail}, ${date})
        RETURNING id
        `;
        
        const filesCount = Number(formData.get("filesCount"))
        var files: File[] = [];
        for (let i = 0; i < filesCount; i++) {
            const file = formData.get(`file-${i}`) as File;
            files.push(file);
            const blob = await put(file.name, file, {
                access: 'public',
            });
            await sql`
            INSERT INTO quote_request_attachments(quote_request_id, file_url)
            VALUES (${result[0].id}, ${blob.downloadUrl})
            `;
        }
        sendQuoteEmail({
            id: '',
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            detail: detail,
            email: email,
            date: date
        }, files);
    } catch (error) {
        console.error(error);
        return { message: 'Error insertando la cotización.' };
    }
    
    redirect('/public/quote/success');
}

async function sendQuoteEmail(quote: QuoteTable, files: File[]) {
    try {
        const to = "pelambres3d@gmail.com";
        const subject = `NEW QUOTE REQUEST - ${quote.first_name} ${quote.last_name}`;
        const body = `
            <h2>Nuevo pedido de cotización</h2>
            <p><strong>Nombre:</strong> ${quote.first_name} ${quote.last_name}</p>
            <p><strong>Email:</strong> ${quote.email}</p>
            <p><strong>Teléfono:</strong> ${quote.phone}</p>
            <p><strong>Fecha:</strong> ${quote.date}</p>
            <p><strong>Detalles:</strong></p>
            <p>${quote.detail}</p>
            <hr>
            <p>Este mensaje fue enviado desde la plataforma de Pelambres.</p>
        `;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GOOGLE_MAIL_USER, // Email
                pass: process.env.GOOGLE_MAIL_PASSWORD, // Contraseña de aplicación
            },
        });

        const attachments = await Promise.all(
            files.map(async (file) => {
                const buffer = await file.arrayBuffer();
                return {
                    filename: file.name,
                    content: Buffer.from(buffer),
                };
            })
        );

        const info = await transporter.sendMail({
            from: `"Pelambres 3D" <${process.env.GOOGLE_MAIL_USER}>`,
            to,
            subject,
            html: body,
            attachments, // Adjuntar archivos
        });
        console.log("📩 Correo enviado con éxito:", info.response);
    } catch (error) {
        console.error("❌ Error enviando el correo:", error);
    }
}