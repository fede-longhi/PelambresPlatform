"use client"

import { useActionState, useEffect } from "react";
import { ConfigurationVariableFormState, updateConfigurationVariableFromForm } from "@/lib/actions/configuration-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldErrorDisplay from "@/components/ui/field-error-display";
import { Textarea } from "@/components/ui/textarea";
import { ConfigurationVariable } from "@/types/definitions";
import { CONFIGURATION_VARIABLE_DATA_TYPES } from "@/lib/consts";

export default function EditConfigurationForm({configuration, onSuccess} : {configuration: ConfigurationVariable, onSuccess?: () => void}) {
    const initialState: ConfigurationVariableFormState = {
        message: "",
        errors: {},
        success: false
    };
    const updateConfigurationWithId = updateConfigurationVariableFromForm.bind(null, configuration.id);
    const [state, formAction, isPending] = useActionState(updateConfigurationWithId, initialState);

    useEffect(() => {
        if (state.success) {
            onSuccess?.();
        }
    },[state?.success, onSuccess])

    return (
        <form action={formAction} className="space-y-4 max-w-md">
            <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                    className="w-full"
                    type="text"
                    name="value"
                    id="value"
                    defaultValue={(state.payload?.get("value") || (configuration.value??'')) as string}
                    aria-describedby="value-error"
                />
                <FieldErrorDisplay id="value-error" errors={state?.errors?.value} />
            </div>
    
            <div>
                <Label htmlFor="data_type">Tipo de dato</Label>
                <select
                    id="data_type"
                    name="data_type"
                    defaultValue={(state.payload?.get("data_type") || (configuration.data_type??'text')) as string}
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
                <Input
                    type="text"
                    name="category"
                    id="category"
                    defaultValue={(state.payload?.get("category") || (configuration.category??'')) as string}
                    className="w-full" />
                <FieldErrorDisplay id="category-error" errors={state?.errors?.category} />
            </div>
    
            <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    className="w-full"
                    name="description"
                    id="description"
                    defaultValue={(state.payload?.get("description") || (configuration.description??'')) as string}
                    aria-describedby="description-error"
                    rows={3}>    
                </Textarea>
                <FieldErrorDisplay id="description-error" errors={state?.errors?.description} />
            </div>
    
            <div className="flex flex-row justify-end">
            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar cambios'}</Button>
            </div>
        </form>
    );
}