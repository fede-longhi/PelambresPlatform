'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    email: z.string({
        invalid_type_error: 'Ingresa un email de contacto.',
    }).email({message: 'Tiene que ingresar un email valido.'}),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
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
        INSERT INTO quotes (first_name, last_name, email, phone, detail, date)
        VALUES (${firstName}, ${lastName}, ${email}, ${phone}, ${detail}, ${date})
        RETURNING id
        `;
        
        const filesCount = Number(formData.get("filesCount"))
        for (let i = 0; i < filesCount; i++) {
            const file = formData.get(`file-${i}`) as File;
            const blob = await put(file.name, file, {
                access: 'public',
            });

            await sql`
            INSERT INTO quote_attachments(quote_id, file_url)
            VALUES (${result[0].id}, ${blob.downloadUrl})
            `;
        }
    } catch (error) {
        console.error(error);
        return { message: 'Error insertando la cotización.' };
    }
    
    revalidatePath('/public/quote');
    redirect('/public/quote');
}