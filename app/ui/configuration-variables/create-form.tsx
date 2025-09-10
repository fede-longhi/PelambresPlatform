"use client"

import { useActionState, useEffect } from "react";
import { ConfigurationVariableFormState, createConfigurationVariableFromForm } from "@/app/lib/configuration-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldErrorDisplay from "@/components/ui/field-error-display";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    },[state?.success])

    return (
        <form action={formAction} className="space-y-4 max-w-md">
            <div>
                <Label htmlFor="key">Key</Label>
                <Input type="text" name="key" id="key" aria-describedby="key-error" required/>
                <FieldErrorDisplay errors={state?.errors?.key} id="key-error" />
            </div>
    
            <div>
                <Label htmlFor="value">Value</Label>
                <Input type="text" name="value" id="value" className="border rounded p-2 w-full" />
            </div>
    
            <div>
                <Label htmlFor="data_type" className="block font-medium">Data Type</Label>
                <Select name="data_type">
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
                <Input type="text" name="category" id="category" className="border rounded p-2 w-full" />
            </div>
    
            <div>
                <Label htmlFor="description" className="block font-medium">Description</Label>
                <Textarea name="description" id="description" className="border rounded p-2 w-full" rows={3}></Textarea>
            </div>
    
            <div className="flex flex-row justify-end">
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Create Variable'}</Button>
            </div>
        </form>
    );
}