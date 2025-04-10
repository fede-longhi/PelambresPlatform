'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { Customer } from './definitions';

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
const UpdateCustomer = FormSchema.omit({ id: true });

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
    success?: boolean;
    payload?: FormData;
    redirect?: boolean;
    customer?: Customer;
};

export async function createCustomer(
    prevState: CustomerFormState,
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
            success: false
        };
    }

    const { name, firstName, lastName, email, phone, type } = validatedFields.data;

    try {
        const insertedCustomers = await sql<Customer[]>`
        INSERT INTO customers (name, first_name, last_name, email, phone, type)
        VALUES (${name ?? null}, ${firstName ?? null}, ${lastName ?? null}, ${email}, ${phone}, ${type})
        RETURNING id, name, first_name, last_name, type
        `;

        if (prevState.redirect) {
            revalidatePath('/admin/customers');
            redirect('/admin/customers');
        }

        const newState: CustomerFormState = {
            errors: {},
            message: "success",
            payload: formData,
            redirect: prevState.redirect,
            success: true,
            customer: insertedCustomers[0],
        }
        return newState;
    } catch (error) {
        console.error(error);
        return { message: "Hubo un error al guardar el cliente." };
    }
}

export async function deleteCustomer(id: string, path: string) {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    
    revalidatePath(path);
    redirect(path);
}

export async function updateCustomer(
    id: string,
    prevState: CustomerFormState,
    formData: FormData
) {
    const validatedFields = UpdateCustomer.safeParse({
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
            success: false
        };
    }

    const { name, firstName, lastName, email, phone, type } = validatedFields.data;
    
    try {
        await sql`
            UPDATE customers
            SET name = ${name ?? null}, first_name = ${firstName ?? null}, last_name = ${lastName ?? null},
                email = ${email}, phone = ${phone}, type = ${type}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.log(error)
        return { message: 'Database Error: Failed to Update Customer.' };
    }

    if (prevState.redirect) {
        revalidatePath('/admin/customers');
        redirect('/admin/customers');
    }

    const newState: CustomerFormState = {
        errors: {},
        message: "success",
        payload: formData,
        redirect: prevState.redirect,
        success: true,
    }
    return newState;
    
}