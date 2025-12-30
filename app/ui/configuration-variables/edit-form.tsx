"use client"

import { useActionState, useEffect } from "react";
import { ConfigurationVariableFormState, updateConfigurationVariableFromForm } from "@/app/lib/configuration-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldErrorDisplay from "@/components/ui/field-error-display";
import { Textarea } from "@/components/ui/textarea";
import { ConfigurationVariable } from "@/types/definitions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        console.log(state);
        console.log(JSON.stringify(state.errors));
        if (state.success) {
            onSuccess?.();
        }
    },[state?.success])

    return (
        <form action={formAction} className="space-y-4 max-w-md">
            <div>
                <Label htmlFor="value">Value</Label>
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
                <Label htmlFor="data_type" className="block font-medium">Data Type</Label>
                <Select name="data_type" defaultValue={(state.payload?.get("data_type") || (configuration.data_type??'')) as string}>
                    <SelectTrigger>
                        <SelectValue
                            placeholder="Select a data type"
                            aria-describedby="data_type-error"
                            
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            CONFIGURATION_VARIABLE_DATA_TYPES.map((dataType) => (
                                <SelectItem key={dataType.name} value={dataType.name}>
                                    {dataType.label}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                <FieldErrorDisplay id="data_type-error" errors={state?.errors?.data_type} />
            </div>
    
            <div>
                <Label htmlFor="category" className="block font-medium">Category</Label>
                <Input
                    type="text"
                    name="category"
                    id="category"
                    defaultValue={(state.payload?.get("category") || (configuration.category??'')) as string}
                    className="w-full" />
                <FieldErrorDisplay id="data_type-error" errors={state?.errors?.data_type} />
            </div>
    
            <div>
                <Label htmlFor="description" className="block font-medium">Description</Label>
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
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
        </form>
    );
}