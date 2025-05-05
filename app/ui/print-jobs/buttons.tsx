"use client"

import { deletePrintJob, finishPrintJob, startPrintJob, failPrintJob, FailPrintJobFormState } from "@/app/lib/print-job-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ban, CirclePlay, CircleStop, Trash } from "lucide-react";
import { FAIL_REASONS } from "@/lib/consts";
import { useActionState } from "react";

export function StartPrintJob({id, revalidatePath} : {id:string, revalidatePath?:string}) {
    
    const startPrintJobWithId = startPrintJob.bind(null, id, revalidatePath);
    return (
        <form action={startPrintJobWithId}>
            <Button className="" size="sm" type="submit" variant="ghost">
                Start
                <CirclePlay />
            </Button>
        </form>
    )
}

export function DeletePrintJob({id, revalidatePath} : {id:string, revalidatePath?:string}) {
    const deleteOrderWithId = deletePrintJob.bind(null, id, revalidatePath);
    return (
        <form action={deleteOrderWithId}>
            <Button type="submit" variant="outline" size="icon"><Trash /></Button>
        </form>
    )
}

export function FinishPrintJob({id, revalidatePath} : {id:string, revalidatePath?:string}) {
    const finishPrintJobWithId = finishPrintJob.bind(null, id, revalidatePath);
    return (
        <form action={finishPrintJobWithId}>
            <Button size="sm" type="submit" variant="ghost">
                Finish
                <CircleStop />
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
                <Button className="text-destructive" variant="outline" size="icon" type="button">
                    <Ban />
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
                        <Label htmlFor="failReason">Fail Reason</Label>
                        <Select name="failReason">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    FAIL_REASONS.map((failReason) => (
                                        <SelectItem key={failReason.value} value={failReason.value}>
                                            {failReason.label}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {
                            isPending ?
                            "Loading..."
                            :
                            "Submit"
                        }
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    )
}