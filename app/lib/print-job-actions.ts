'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PrintJob } from './definitions';
import { put } from '@vercel/blob';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });


const FormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: 'El nombre es requerido.' }),
    order_id: z.string().min(1, { message: 'Debe estar asociado a un pedido.' }),
    estimated_printing_time: z.coerce.number().int().nonnegative({ message: 'Debe ser un número válido.' }),
    started_at: z.coerce.date().optional(),
    finished_at: z.coerce.date().optional(),
    value: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.'}).optional(),
    status: z.enum(['pending', 'printing', 'done', 'error']).default('pending'),
    filament_type: z.enum(['pla', 'petg', 'tpu']).default('pla'),
});

const CreatePrintJob = FormSchema.omit({ id: true });

export type PrintJobFormState = {
    errors?: {
        name?: string[];
        order_id?: string[];
        gcode_file?: string[];
        model_files?: string[];
        estimated_printing_time?: string[];
        started_at?: string[];
        finished_at?: string[];
        status?: string[];
    };
    message?: string | null;
    success?: boolean;
    payload?: FormData;
    redirect?: boolean;
    printJob?: PrintJob;
};

export async function createPrintJob(
    _prevState: PrintJobFormState,
    formData: FormData
): Promise<PrintJobFormState> {
    const validatedFields = CreatePrintJob.safeParse({
        name: formData.get('name'),
        order_id: formData.get('order_id'),
        estimated_printing_time: formData.get('estimated_printing_time'),
        started_at: formData.get('started_at'),
        finished_at: formData.get('finished_at'),
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan completar algunos campos.',
            payload: formData,
            success: false,
        };
    }

    const {
        name,
        order_id,
        estimated_printing_time,
        started_at,
        finished_at,
        status,
        value,
        filament_type
    } = validatedFields.data;

    const files = [];
    const gcodeFile = formData.get("gcodeFile") as File;
    if (!gcodeFile) {
        return {
            errors: {gcode_file: ["Please provide a gcode file"]},
            message: 'Faltan completar algunos campos.',
            payload: formData,
            success: false,
        }
    }
    const gcodeBlob = await put(gcodeFile.name, gcodeFile, {
        access: 'public',
    });
    files.push({
        filename: gcodeFile.name,
        path: gcodeBlob.downloadUrl,
        mime_type: gcodeFile.type,
        size: gcodeFile.size
    });

    const filesCount = Number(formData.get("filesCount"))
    for (let i = 0; i < filesCount; i++) {
        const file = formData.get(`file-${i}`) as File;
        const blob = await put(file.name, file, {
            access: 'public',
        });
        files.push({
            filename: file.name,
            path: blob.downloadUrl,
            mime_type: file.type,
            size: file.size
        });
    }

    const values = files.map(file => [
        file.filename,
        file.path,
        file.mime_type,
        file.size,
        (new Date()).toISOString(),
    ]);

    const insertedFiles = await sql`INSERT INTO "public"."files" (
        filename, path, mime_type, size, uploaded_at
    ) SELECT * FROM UNNEST(
        ${values.map(v => v[0])}::text[],
        ${values.map(v => v[1])}::text[],
        ${values.map(v => v[2])}::text[],
        ${values.map(v => v[3])}::int[],
        ${values.map(v => v[4])}::timestamptz[]
    ) RETURNING id, filename`;

    const gcodeInsertedRow = insertedFiles.filter((row) => (row.filename == gcodeFile.name))[0];

    const insertedPrintJob = await sql`INSERT INTO print_jobs (
        name, gcode_id, status, estimated_printing_time, order_id, value, filament_type
    ) VALUES (
        ${name}, ${gcodeInsertedRow.id}, ${status}, ${estimated_printing_time}, ${order_id}, ${value ? value*100 : null},
        ${filament_type ?? null}
    )`;

    revalidatePath(`/admin/orders/${order_id}`);
    redirect(`/admin/orders/${order_id}`);
    // return {success: true, printJob: insertedPrintJob[0] as PrintJob}
}

export async function startPrintJob(id: string, pathToRevalidate?: string) {
    const now = new Date().toISOString();
    await sql`UPDATE print_jobs
    SET status='printing', started_at=${now}
    WHERE id = ${id}`;
    if (pathToRevalidate) {
        revalidatePath(pathToRevalidate);
    }
}

export async function deletePrintJob(id: string, pathToRevalidate?: string) {
    await sql`DELETE FROM print_jobs WHERE id = ${id}`;
    
    if (pathToRevalidate) {
        revalidatePath(pathToRevalidate);
    }
}

export async function finishPrintJob(id: string, pathToRevalidate?: string) {
    const now = new Date().toISOString();
    await sql`UPDATE print_jobs
                SET status='finished', finished_at=${now}
                WHERE id = ${id}`;
    
    if (pathToRevalidate) {
        revalidatePath(pathToRevalidate);
    }
}