
'use server';

import { z } from 'zod';
import { ConfigurationVariable } from "./definitions";
import { revalidatePath } from 'next/cache';

import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const CreateConfigurationVariable = z.object({
    key: z.string().min(1, "El campo 'key' es obligatorio."),
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
            : false; // unique_violation
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
    const validatedFields = UpdateConfigurationVariable.safeParse({
        value: formData.get("value"),
        data_type: formData.get("data_type"),
        category: formData.get("category"),
        description: formData.get("description"),
    });
    
    console.log('after validate insert');
    
    if (!validatedFields.success) {
        console.log('not valid');
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan completar algunos campos.",
            payload: formData,
            success: false,
        };
    }
    console.log('before getting data');
  
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
    await sql`DELETE FROM configuration WHERE id = ${id}`;
    revalidatePath('/admin/configuration');
}