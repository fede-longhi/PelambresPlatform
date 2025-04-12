import { deletePrintJob, finishPrintJob, startPrintJob } from "@/app/lib/print-job-actions";
import { Button } from "@/components/ui/button";
import { CirclePlay, CircleStop, Trash } from "lucide-react";

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
            <Button className="" size="sm" type="submit" variant="ghost">
                Finish
                <CircleStop />
            </Button>
        </form>
    )
}