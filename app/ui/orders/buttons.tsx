import { advanceStep, deleteOrder, goBackStep } from "@/app/lib/order-actions";
import { OrderStatus } from "@/types/order-definitions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { DeleteOutline, NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Pencil, PlusIcon, StepBack, StepForward, Trash } from "lucide-react";
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

export function CreateOrder() {
    return (
        <Link
        href="/admin/orders/create"
        className="flex h-10 w-40 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            <span>Create Order</span>
            <PlusIcon className="h-5 md:ml-4" />
        </Link>
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