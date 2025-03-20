'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email({ message: "Debe ser un email válido." }),
    phone: z.string(),
    type: z.enum(["person", "business"]),
});

const CreateCustomer = FormSchema.omit({ id: true });

export type CustomerFormState = {
    errors?: {
        name?: string[];
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        phone?: string[];
        type?: string[];
    };
    message?: string | null;
    payload?: FormData;
};

export async function createCustomer(
    _prevState: CustomerFormState,
    formData: FormData
) {
    const validatedFields = CreateCustomer.safeParse({
        name: formData.get("name"),
        firstName: formData.get("first-name"),
        lastName: formData.get("last-name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        type: formData.get("type"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan completar algunos campos.",
            payload: formData,
        };
    }

    const { name, firstName, lastName, email, phone, type } = validatedFields.data;

    try {
        await sql`
        INSERT INTO customers (name, first_name, last_name, email, phone, type)
        VALUES (${name ?? null}, ${firstName ?? null}, ${lastName ?? null}, ${email}, ${phone}, ${type})
        `;
    } catch (error) {
        console.error(error);
        return { message: "Hubo un error al guardar el cliente." };
    }

    revalidatePath('/admin/customers');
    redirect('/admin/customers');
}
