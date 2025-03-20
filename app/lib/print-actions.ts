'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    code: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    customerId: z.string(),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'in progress', 'finished', 'delivered']),
});

const CreatePrint = FormSchema.omit({ id: true, startDate: true, endDate: true });

export type PrintFormState = {
    errors?: {
        customerId?: string[],
        code?: string[],
        status?: string[],
        amount?: string[],
    };
    message?: string | null;
};

export async function createPrint(
    _prevState: PrintFormState,
    formData: FormData
) {

    const validatedFields = CreatePrint.safeParse({
        customerId: formData.get('customerId'),
        code: formData.get('code'),
        status: formData.get('status'),
        amount: formData.get('amount'),
    });
  
    if (!validatedFields.success) {
        console.log("fail");
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, code, status, amount } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    revalidatePath('/admin/prints');
    redirect('/admin/prints');

}