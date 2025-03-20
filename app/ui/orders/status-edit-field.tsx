import { OrderStatus } from "@/app/lib/order-definitions";
import { AdvanceStep, GoBackStep } from "./buttons";

export function OrderStatusEditField({ id, status }: { id: string, status: OrderStatus }) {
    
    return (
        <div className="flex flex-row items-center justify-stretch">
            {
                status != 'pending' ?
                <GoBackStep id={id} status={status}/>
                :
                <span className="w-6 h-6"></span>
            }
            <p className="mx-2 grow text-center">{status}</p>
            {
                status != 'delivered' ?
                <AdvanceStep id={id} status={status}/>
                :
                <span className="w-6 h-6"></span>

            }
        </div>
    )
}