'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { Printer } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'El nombre es obligatorio.'),
    brand: z.string().optional(),
    model: z.string().optional(),
    power_consumption: z.coerce.number().optional(),
    size_x: z.coerce.number().optional(),
    size_y: z.coerce.number().optional(),
    size_z: z.coerce.number().optional(),
    status: z.string().optional(),
});

const CreatePrinter = FormSchema.omit({ id: true });
const UpdatePrinter = FormSchema.omit({ id: true });

export type PrinterFormState = {
    errors?: {
        name?: string[];
        brand?: string[];
        model?: string[];
        power_consumption?: string[];
        size_x?: string[];
        size_y?: string[];
        size_z?: string[];
        status?: string[];
    };
    message?: string | null;
    success?: boolean;
    payload?: FormData;
    printer?: Printer;
};

export async function createPrinter(
    options: { redirect?: boolean, path?: string },
    prevState: PrinterFormState,
    formData: FormData
) {
    const validatedFields = CreatePrinter.safeParse({
        name: formData.get('name'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        power_consumption: formData.get('power_consumption'),
        size_x: formData.get('size_x'),
        size_y: formData.get('size_y'),
        size_z: formData.get('size_z'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan completar algunos campos.',
            payload: formData,
            success: false,
        };
    }

    const {
        name,
        brand,
        model,
        power_consumption,
        size_x,
        size_y,
        size_z,
        status,
    } = validatedFields.data;

    let insertedPrinters;
    try {
        insertedPrinters = await sql<Printer[]>`
        INSERT INTO printers (name, brand, model, power_consumption, size_x, size_y, size_z, status)
        VALUES (${name??null}, ${brand??null}, ${model??null}, ${power_consumption??null}, ${size_x??null}, ${size_y??null}, ${size_z??null}, ${status??null})
        RETURNING *
        `;
    } catch (error) {
        console.error(error);
        return { message: 'Hubo un error al guardar la impresora.', success: false };
    }

    if (options.path) {
        revalidatePath(options.path);
        if (options.redirect) {
            redirect(options.path);
        }
    }

    return {
        errors: {},
        message: 'success',
        payload: formData,
        printer: insertedPrinters[0],
        success: true,
    } as PrinterFormState;
}

export async function deletePrinter(id: string, path: string) {
    await sql`DELETE FROM printers WHERE id = ${id}`;
    revalidatePath(path);
    redirect(path);
}

export async function updatePrinter(
    id: string,
    options: { redirect?: boolean, path?: string },
    prevState: PrinterFormState,
    formData: FormData
) {
    const validatedFields = UpdatePrinter.safeParse({
        name: formData.get('name'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        power_consumption: formData.get('power_consumption'),
        size_x: formData.get('size_x'),
        size_y: formData.get('size_y'),
        size_z: formData.get('size_z'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Faltan completar algunos campos.',
        payload: formData,
        success: false,
        };
    }

    const {
        name,
        brand,
        model,
        power_consumption,
        size_x,
        size_y,
        size_z,
        status,
    } = validatedFields.data;

    try {
        await sql`
        UPDATE printers
        SET name = ${name??null}, brand = ${brand??null}, model = ${model??null},
            power_consumption = ${power_consumption??null}, size_x = ${size_x??null},
            size_y = ${size_y??null}, size_z = ${size_z??null}, status = ${status??null}
        WHERE id = ${id}
        `;
    } catch (error) {
        console.log(error);
        return { message: 'Error al actualizar la impresora.' };
    }

    if (options.path) {
        revalidatePath(options.path);
        if (options.redirect) {
            redirect(options.path);
        }
    }

    return {
        errors: {},
        message: 'success',
        success: true,
    } as PrinterFormState;
}
