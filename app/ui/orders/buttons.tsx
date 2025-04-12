import { advanceStep, deleteOrder, goBackStep } from "@/app/lib/order-actions";
import { OrderStatus } from "@/app/lib/order-definitions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { DeleteOutline, NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Pencil, StepBack, StepForward, Trash } from "lucide-react";
import Link from "next/link";

export function GoBackStep({ id, status }: { id: string, status: OrderStatus }) {
    const goBackStepWithFields = goBackStep.bind(null, id, status);
    return (
        <form action={goBackStepWithFields}>
            <Button type="submit" variant="outline" size="icon" className="hover:bg-primary hover:text-primary-foreground rounded-full w-6 h-6"><StepBack /></Button>
        </form>
    )
}

export function AdvanceStep({ id, status }: { id: string, status: OrderStatus }) {
    const advanceStepWithFields = advanceStep.bind(null, id, status);
    return (
        <form action={advanceStepWithFields}>
            <Button type="submit" variant="outline" size="icon" className="hover:bg-primary hover:text-primary-foreground rounded-full w-6 h-6"><StepForward /></Button>
        </form>
    )
}

export function DeleteOrder ({id}: {id: string}){
    const deleteOrderWithId = deleteOrder.bind(null, id);
    return (
        <form action={deleteOrderWithId}>
            <Button type="submit" variant="outline" size="icon"><Trash /></Button>
        </form>
    ) 
}

export function EditOrder ({id, className}: {id: string, className?:string}) {
    return (
        <Link href={`/admin/orders/${id}/edit`} className={cn("border rounded-md p-2", className)}>
            <Pencil size={16}/>
        </Link>
    )
}