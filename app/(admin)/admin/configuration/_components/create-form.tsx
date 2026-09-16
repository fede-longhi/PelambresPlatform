"use client"

import { useActionState, useEffect } from "react";
import { ConfigurationVariableFormState, createConfigurationVariableFromForm } from "@/lib/actions/configuration-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldErrorDisplay from "@/components/ui/field-error-display";
import { Textarea } from "@/components/ui/textarea";
import { CONFIGURATION_VARIABLE_DATA_TYPES } from "@/lib/consts";

export default function CreateConfigurationForm({onSuccess} : {onSuccess?: () => void}) {
    const initialState: ConfigurationVariableFormState = {
        message: "",
        errors: {},
        success: false
    };
    
    const [state, formAction, isPending] = useActionState(createConfigurationVariableFromForm, initialState);

    useEffect(() => {
        if (state.success) {
            onSuccess?.();
        }
    },[state?.success, onSuccess])

    return (
        <form action={formAction} className="space-y-4 max-w-md">
            <div>
                <Label htmlFor="key">Clave</Label>
                <Input type="text" name="key" id="key" aria-describedby="key-error" required/>
                <FieldErrorDisplay errors={state?.errors?.key} id="key-error" />
            </div>
    
            <div>
                <Label htmlFor="value">Valor</Label>
                <Input type="text" name="value" id="value" className="border rounded p-2 w-full" />
            </div>
    
            <div>
                <Label htmlFor="data_type">Tipo de dato</Label>
                <select
                    id="data_type"
                    name="data_type"
                    defaultValue="text"
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    aria-describedby="data_type-error"
                >
                    {CONFIGURATION_VARIABLE_DATA_TYPES.map((dataType) => (
                        <option key={dataType.name} value={dataType.name}>
                            {dataType.label}
                        </option>
                    ))}
                </select>
                <FieldErrorDisplay id="data_type-error" errors={state?.errors?.data_type} />
            </div>
    
            <div>
                <Label htmlFor="category">Categoría</Label>
                <Input type="text" name="category" id="category" className="border rounded p-2 w-full" />
            </div>
    
            <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea name="description" id="description" className="border rounded p-2 w-full" rows={3}></Textarea>
            </div>
    
            <div className="flex flex-row justify-end">
            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Crear variable'}</Button>
            </div>
        </form>
    );
}