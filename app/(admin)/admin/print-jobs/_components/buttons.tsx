"use client"

import { deletePrintJob, finishPrintJob, startPrintJob, failPrintJob, FailPrintJobFormState } from "@/lib/actions/print-job-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Ban, CirclePlay, CircleStop } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { FAIL_REASONS } from "@/lib/consts";
import { useActionState } from "react";

export function StartPrintJob({id, revalidatePath} : {id:string, revalidatePath?:string}) {
    
    const startPrintJobWithId = startPrintJob.bind(null, id, revalidatePath);
    return (
        <form action={startPrintJobWithId}>
            <Button className="" size="sm" type="submit" variant="ghost">
                Iniciar
                <CirclePlay aria-hidden="true" />
            </Button>
        </form>
    )
}

export function DeletePrintJob({id, revalidatePath} : {id:string, revalidatePath?:string}) {
    const deletePrintJobWithId = deletePrintJob.bind(null, id, revalidatePath);
    return (
        <ConfirmDeleteButton
            ariaLabel="Eliminar trabajo"
            title="Eliminar trabajo"
            description="Esta acción no se puede deshacer."
            action={deletePrintJobWithId}
        />
    )
}

export function FinishPrintJob({id, revalidatePath} : {id:string, revalidatePath?:string}) {
    const finishPrintJobWithId = finishPrintJob.bind(null, id, revalidatePath);
    return (
        <form action={finishPrintJobWithId}>
            <Button size="sm" type="submit" variant="ghost">
                Finalizar
                <CircleStop aria-hidden="true" />
            </Button>
        </form>
    )
}


export function FailPrintJob({id, revalidatePath} : {id:string, revalidatePath?:string}) {
    const initialState: FailPrintJobFormState = {message: null, errors: {}, redirect: false, pathToRevalidate: revalidatePath }
    const failPrintJobWithId = failPrintJob.bind(null, id);
    const [state, formAction, isPending] = useActionState(failPrintJobWithId, initialState);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="text-destructive size-11 md:size-9" variant="outline" size="icon" type="button" aria-label="Marcar trabajo como fallido">
                    <Ban aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                {
                    !state.success && state.message &&
                    <div>
                        {state.message}
                    </div>
                }
                <form action={formAction}>
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="failReason">Motivo de falla</Label>
                        <select
                            id="failReason"
                            name="failReason"
                            defaultValue="other"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {FAIL_REASONS.map((failReason) => (
                                <option key={failReason.value} value={failReason.value}>
                                    {failReason.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Confirmar falla'}
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    )
}