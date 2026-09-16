
'use server';

import { z } from 'zod';
import { ConfigurationVariable } from "@/types/definitions";
import { revalidatePath } from 'next/cache';

import sql from '@/lib/db';
import { requireAdminSessionUserId } from '@/lib/auth/require-admin';

const CreateConfigurationVariable = z.object({
    key: z.string().min(1, "La clave es obligatoria."),
    value: z.string().optional().nullable(),
    data_type: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});

const UpdateConfigurationVariable = z.object({
    value: z.string().optional().nullable(),
    data_type: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});

export type ConfigurationVariableFormState = {
    errors?: {
        key?: string[];
        value?: string[];
        data_type?: string[];
        category?: string[];
        description?: string[];
    };
    message?: string;
    payload?: FormData;
    success: boolean;
    redirect?: boolean;
    variable?: ConfigurationVariable;
};
  
export async function createConfigurationVariableFromForm(
    _prevState: ConfigurationVariableFormState,
    formData: FormData
): Promise<ConfigurationVariableFormState> {
    await requireAdminSessionUserId();

    const validatedFields = CreateConfigurationVariable.safeParse({
        key: formData.get("key"),
        value: formData.get("value"),
        data_type: formData.get("data_type"),
        category: formData.get("category"),
        description: formData.get("description"),
    });
  
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan completar algunos campos.",
            payload: formData,
            success: false,
        };
    }
  
    const { key, value, data_type, category, description } = validatedFields.data;
  
    try {
        await sql`
            INSERT INTO configuration (key, value, data_type, category, description)
            VALUES (${key}, ${value??null}, ${data_type??null}, ${category??null}, ${description??null})
            RETURNING *
        `;
    } catch (error) {
        console.error(error);
        const isDuplicate = (typeof error === 'object' && error !== null && 'code' in error)
            ? (error as { code?: string }).code === '23505'
            : false;
        return {
            message: isDuplicate
            ? "Ya existe una variable con esa clave."
            : "Hubo un error al guardar la variable.",
            payload: formData,
            success: false,
        };
    }
  
    revalidatePath('/admin/configuration');
    return {
        success: true
    }
}

export async function updateConfigurationVariableFromForm(
    id: string,
    _prevState: ConfigurationVariableFormState,
    formData: FormData
): Promise<ConfigurationVariableFormState> {
    await requireAdminSessionUserId();

    const validatedFields = UpdateConfigurationVariable.safeParse({
        value: formData.get("value"),
        data_type: formData.get("data_type"),
        category: formData.get("category"),
        description: formData.get("description"),
    });
  
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan completar algunos campos.",
            payload: formData,
            success: false,
        };
    }
  
    const { value, data_type, category, description } = validatedFields.data;  
    const now = new Date().toISOString();


    try {
        await sql`
            UPDATE configuration
            SET value = ${value ?? null}, data_type=${data_type ?? null},
                category=${category ?? null}, description=${description ?? null}, last_modified = ${now}
            WHERE id = ${id}
        `;
    } catch (error) { 
        console.error(error);
        
        return {
            message: "error: " + JSON.stringify(error),
            payload: formData,
            success: false,
        };
    }

    revalidatePath('/admin/configuration');
    return {
        success: true
    }
}

export async function deleteConfiguration(id: string) {
    await requireAdminSessionUserId();
    await sql`DELETE FROM configuration WHERE id = ${id}`;
    revalidatePath('/admin/configuration');
}