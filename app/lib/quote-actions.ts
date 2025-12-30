'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';
import postgres from 'postgres';
import nodemailer from 'nodemailer';
import { QuoteTable } from '../../types/definitions';
import { MAX_FILE_ATTACHMENT_SIZE_BYTES, MAX_FILE_ATTACHMENT_SIZE_MB } from '@/lib/consts';

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
        
        const filesCount = Number(formData.get("filesCount"))
        const files: File[] = [];
        for (let i = 0; i < filesCount; i++) {
            const file = formData.get(`file-${i}`) as File;

            if (!(file instanceof File) || file.size === 0) {
                //TODO: manejar error de archivo inválido
                continue; 
            }
            
            if (file.size > MAX_FILE_ATTACHMENT_SIZE_BYTES) {
                //TODO: manejar error de archivo muy grande
                return {
                    message: `El archivo ${file.name} excede el límite de ${MAX_FILE_ATTACHMENT_SIZE_MB}MB.`,
                    payload: formData,
                };
            }

            files.push(file);
        }

        const blobUploads = files.map(file => 
            put(file.name, file, { access: 'public' })
        );
        const uploadedBlobs = await Promise.all(blobUploads);
        const dbInserts = uploadedBlobs.map(blob => sql`
            INSERT INTO quote_request_attachments(quote_request_id, file_url)
            VALUES (${result[0].id}, ${blob.downloadUrl})
        `);
        await Promise.all(dbInserts);

        sendQuoteEmail({
            id: '',
            name: name,
            phone: phone,
            detail: detail,
            email: email,
            date: date
        } as QuoteTable, files);
    } catch (error) {
        console.error(error);
        return { status: 'error', message: 'Error insertando la cotización.' };
    }

    return { status: 'success', message: null, errors: {} };
}

async function sendQuoteEmail(quote: QuoteTable, files: File[]) {
    try {
        const to = "pelambres3d@gmail.com";
        const subject = `NEW QUOTE REQUEST - ${quote.name}`;
        const body = `
            <h2>Nuevo pedido de cotización</h2>
            <p><strong>Nombre:</strong> ${quote.name}</p>
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
                user: process.env.GOOGLE_MAIL_USER,
                pass: process.env.GOOGLE_MAIL_PASSWORD,
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
            attachments,
        });
        console.log("Correo enviado con éxito:", info.response);
    } catch (error) {
        console.error("Error enviando el correo:", error);
    }
}