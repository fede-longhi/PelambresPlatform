'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { Filament } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FilamentSchema = z.object({
    id: z.string().uuid(),
    type: z.string().min(1, 'El tipo es obligatorio.'),
    brand: z.string().min(1, 'La marca es obligatoria.'),
    price_per_kg: z.coerce.number().nonnegative({ message: 'Debe ser un número positivo.' }),
});

const CreateFilament = FilamentSchema.omit({ id: true });
const UpdateFilament = FilamentSchema.omit({ id: true });

export type FilamentFormState = {
    errors?: {
        type?: string[];
        brand?: string[];
        price_per_kg?: string[];
    };
    message?: string | null;
    success?: boolean;
    payload?: FormData;
    filament?: Filament;
};

export async function createFilament(
    options: { redirect?: boolean; path?: string },
    prevState: FilamentFormState,
    formData: FormData
) {
    const validatedFields = CreateFilament.safeParse({
        type: formData.get('type'),
        brand: formData.get('brand'),
        price_per_kg: formData.get('price_per_kg'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan completar algunos campos.',
            payload: formData,
            success: false,
        } as FilamentFormState;
    }

    const { type, brand, price_per_kg } = validatedFields.data;

    let insertedFilaments;
    try {
        insertedFilaments = await sql<Filament[]>`
        INSERT INTO filaments (type, brand, price_per_kg)
        VALUES (${type}, ${brand}, ${price_per_kg})
        RETURNING *
        `;
    } catch (error) {
        console.error(error);
        return { message: 'Hubo un error al guardar el filamento.', success: false };
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
        filament: insertedFilaments[0],
        success: true,
    } as FilamentFormState;
}

export async function deleteFilament(id: string, path: string) {
    await sql`DELETE FROM filaments WHERE id = ${id}`;
    revalidatePath(path);
    redirect(path);
}

export async function updateFilament(
    id: string,
    options: { redirect?: boolean; path?: string },
    prevState: FilamentFormState,
    formData: FormData
) {
    const validatedFields = UpdateFilament.safeParse({
        type: formData.get('type'),
        brand: formData.get('brand'),
        price_per_kg: formData.get('price_per_kg'),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Faltan completar algunos campos.',
        payload: formData,
        success: false,
        };
    }

    const { type, brand, price_per_kg } = validatedFields.data;

    try {
        await sql`
        UPDATE filaments
        SET type = ${type}, brand = ${brand}, price_per_kg = ${price_per_kg}
        WHERE id = ${id}
        `;
    } catch (error) {
        console.error(error);
        return { message: 'Error al actualizar el filamento.', success: false };
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
    } as FilamentFormState;
}
