'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { OrderStatus, OrderStatuses } from '../../types/order-definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    code: z.string(),
    customerId: z.string(),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'in progress', 'finished', 'delivered']),
    estimatedDate: z.coerce.date().optional()
});

const CreateOrder = FormSchema.omit({ id: true });

export type OrderFormState = {
    errors?: {
        customerId?: string[],
        code?: string[],
        status?: string[],
        amount?: string[],
        estimatedDate?: string[],
    };
    message?: string | null;
    payload?: FormData 
};

export async function createOrder(
    _prevState: OrderFormState,
    formData: FormData
) {
    const validatedFields = CreateOrder.safeParse({
        customerId: formData.get('customerId'),
        code: formData.get('code'),
        status: formData.get('status'),
        amount: formData.get('amount'),
        estimatedDate: formData.get('estimatedDate'),
    });
  
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
            payload: formData
        };
    }

    const { customerId, code, status, amount, estimatedDate } = validatedFields.data;
    const amountInCents = amount * 100;
    const createdDate = new Date().toISOString().split('T')[0];

    try {
        await sql`
            INSERT INTO orders (customer_id, amount, status, created_date, tracking_code, estimated_date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${createdDate}, ${code}, ${estimatedDate ?? null})
        `;
    } catch (error) {
        console.log(error);
        return { message: 'Database Error: Failed to Insert Invoice.' };
    }

    revalidatePath('/admin/orders');
    redirect('/admin/orders');
}

export async function updateOrder(
    id: string,
    _prevState: OrderFormState,
    formData: FormData) {
    const validatedFields = CreateOrder.safeParse({
        customerId: formData.get('customerId'),
        code: formData.get('code'),
        status: formData.get('status'),
        amount: formData.get('amount'),
        estimatedDate: formData.get('estimatedDate'),
    });
  
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
            payload: formData
        };
    }

    const { customerId, code, status, amount, estimatedDate } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE orders
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status},
                tracking_code = ${code}, estimated_date = ${estimatedDate ?? null}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error(error);
        return { message: 'Database Error: Failed to Update Order.' };
    }

    revalidatePath('/admin/orders');
    redirect('/admin/orders');
}

export async function advanceStep(id: string, status: OrderStatus) {
    const nextStep = OrderStatuses[status].next;
    if (nextStep != null) {
        await sql`UPDATE orders
                SET status = ${nextStep}
                WHERE id = ${id}`;
        revalidatePath('/admin/orders');
    }
}

export async function goBackStep(id: string, status: OrderStatus) {
    const previousStep = OrderStatuses[status].previous;
    if (previousStep != null) {
        await sql`UPDATE orders
                SET status = ${previousStep}
                WHERE id = ${id}`;
        revalidatePath('/admin/orders');
    }
}

export async function deleteOrder(id: string) {
    await sql`DELETE FROM orders WHERE id = ${id}`;
    revalidatePath('/admin/orders');
}