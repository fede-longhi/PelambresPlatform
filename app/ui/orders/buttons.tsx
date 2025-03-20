import { advanceStep, deleteOrder, goBackStep } from "@/app/lib/order-actions";
import { OrderStatus } from "@/app/lib/order-definitions";
import { Button } from "@/components/ui/button";
import { DeleteOutline, NavigateBefore, NavigateNext } from "@mui/icons-material";

export function GoBackStep({ id, status }: { id: string, status: OrderStatus }) {
    const goBackStepWithFields = goBackStep.bind(null, id, status);
    return (
        <form action={goBackStepWithFields}>
            <Button type="submit" variant="outline" size="icon" className="bg-red-400 text-white rounded-full w-6 h-6"><NavigateBefore /></Button>
        </form>
    )
}

export function AdvanceStep({ id, status }: { id: string, status: OrderStatus }) {
    const advanceStepWithFields = advanceStep.bind(null, id, status);
    return (
        <form action={advanceStepWithFields}>
            <Button type="submit" variant="outline" size="icon" className="bg-green-400 text-white rounded-full w-6 h-6"><NavigateNext /></Button>
        </form>
    )
}

export function DeleteOrder ({id}: {id: string}){
    const deleteOrderWithId = deleteOrder.bind(null, id);
    return (
        <form action={deleteOrderWithId}>
            <Button type="submit" variant="outline" size="icon"><DeleteOutline /></Button>
        </form>
    ) 
} 