'use client';

import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPrinter, PrinterFormState } from '@/app/lib/printer-actions';
import { useToast } from '@/hooks/use-toast';
import { useActionState, useEffect } from 'react';
import FieldErrorDisplay from '../ui/field-error-display';

const initialState: PrinterFormState = {
  errors: {},
  message: null,
  success: false,
};

export default function PrinterCreateForm({ redirectAfterCreate = true, path, onSuccess }: { redirectAfterCreate?: boolean, path?: string, onSuccess?: ()=>void }) {
    const createPrinterWithRedirect = createPrinter.bind(null, { redirect: redirectAfterCreate, path: path });
    
    const [state, formAction, isPending] = useActionState(createPrinterWithRedirect, initialState);
    const { toast } = useToast();
    
    useEffect(() => {
        if (state.success) {
            onSuccess?.();  
        }
    },[state?.success, onSuccess, toast]);

    return (
        <form action={formAction} className="space-y-6 max-w-lg">
        <div className="grid gap-4">
            <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" aria-describedby="name-error"/>
                <FieldErrorDisplay errors={state?.errors?.name} id="name-error" />
            </div>

            <div>
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" name="brand" aria-describedby="brand-error"/>
                <FieldErrorDisplay errors={state?.errors?.brand} id="brand-error" />
            </div>

            <div>
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" name="model" aria-describedby="model-error" />
                <FieldErrorDisplay errors={state?.errors?.model} id="model-error" />
            </div>

            <div>
                <Label htmlFor="power_consumption">Consumo eléctrico (W)</Label>
                <Input id="power_consumption" name="power_consumption" type="number" step="any" />
                <FieldErrorDisplay errors={state?.errors?.model} id="model-error" />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="size_x">Tamaño X (mm)</Label>
                    <Input id="size_x" name="size_x" type="number" step="any" aria-describedby="size_x-error" />
                    <FieldErrorDisplay errors={state?.errors?.size_x} id="size_x-error" />
                </div>
                <div>
                    <Label htmlFor="size_y">Tamaño Y (mm)</Label>
                    <Input id="size_y" name="size_y" type="number" step="any" aria-describedby="size_y-error"/>
                    <FieldErrorDisplay errors={state?.errors?.size_y} id="size_y-error" />
                </div>
                <div>
                    <Label htmlFor="size_z">Tamaño Z (mm)</Label>
                    <Input id="size_z" name="size_z" type="number" step="any" aria-describedby="size_z-error"/>
                    <FieldErrorDisplay errors={state?.errors?.size_z} id="size_z-error" />
                </div>
            </div>

            <div>
                <Label htmlFor="status">Estado</Label>
                <Input id="status" name="status" />
                <FieldErrorDisplay errors={state?.errors?.status} id="size_z-error" />
            </div>
        </div>

        {
            !state.success && state.message &&
            <FieldErrorDisplay errors={[state?.message]} id="general-error" />
        }

        <Button type="submit">Crear impresora</Button>
        </form>
    );
}
