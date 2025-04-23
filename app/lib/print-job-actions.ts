'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PrintJob } from './definitions';
import { FAIL_REASONS, GCODE_FOLDER, MODELS_FOLDER } from '@/lib/consts';
import { insertFormFiles, insertSingleFormFile } from './file-strorage';

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

const FailPrintJobFormSchema = z.object({
    id: z.string().optional(),
    failReason: z.enum(FAIL_REASONS.map(r => r.value) as [string, ...string[]]).default('other')
});

const CreatePrintJob = FormSchema.omit({ id: true });
const FailPrintJob = FailPrintJobFormSchema.omit({ id: true });

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

export type FailPrintJobFormState = {
    errors?: {
        failReason?: string[];
    };
    message?: string | null;
    success?: boolean;
    redirect?: boolean;
    pathToRevalidate?: string;
}

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
        status,
        value,
        filament_type
    } = validatedFields.data;

    const insertedGcodeResult = await insertSingleFormFile('gcodeFile', GCODE_FOLDER, formData);
    if (!insertedGcodeResult.success || !insertedGcodeResult.insertedFile) {
        return {
            errors: {gcode_file: ["Please provide a gcode file"]},
            message: 'Faltan completar algunos campos.',
            payload: formData,
            success: false,
        }
    }
    const gcodeFile = insertedGcodeResult.insertedFile;
    const insertedFilesResult = await insertFormFiles(MODELS_FOLDER, formData);


    const createdPrintJob = await sql`INSERT INTO print_jobs (
        name, gcode_id, status, estimated_printing_time, order_id, value, filament_type
    ) VALUES (
        ${name}, ${gcodeFile.id ?? null}, ${status}, ${estimated_printing_time}, ${order_id}, ${value ? value*100 : null},
        ${filament_type ?? null}
    ) RETURNING id`;

    const allModels = [
        ...(insertedFilesResult.insertedFiles ?? []),
        ...(insertedFilesResult.existingFiles ?? []),
    ];

    if (allModels.length > 0) {
        const modelFileIds = allModels.map((row) => (row.id ?? ""));
        const modelNames = allModels.map((row) => (row.filename ?? ""));
        const jobIds = Array(allModels.length).fill(createdPrintJob[0].id);
    
        await sql`INSERT INTO print_job_models (
            print_job_id, file_id, name
        ) SELECT * FROM UNNEST(
            ${jobIds}::uuid[],
            ${modelFileIds}::uuid[],
            ${modelNames}::text[]
        )`;
    }

    revalidatePath(`/admin/orders/${order_id}`);
    redirect(`/admin/orders/${order_id}`);
}

export async function startPrintJob(id: string, pathToRevalidate?: string) {
    const now = new Date().toISOString();
    console.log(now);
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

export async function failPrintJob(
    id: string,
    prevState: FailPrintJobFormState,
    formData: FormData
):Promise<FailPrintJobFormState> {
    const validatedFields = FailPrintJob.safeParse({
        failReason: formData.get('failReason'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan completar algunos campos.',
            success: false,
        };
    }

    const {failReason} = validatedFields.data;

    const now = new Date().toISOString();
    await sql`UPDATE print_jobs
                SET status='failed', finished_at=${now}, fail_reason=${failReason ?? null}
                WHERE id = ${id}`;
    
    if (prevState.pathToRevalidate) {
        revalidatePath(prevState.pathToRevalidate);
        if (prevState.redirect) {
            redirect(prevState.pathToRevalidate);
        }
    }

    return {}
}