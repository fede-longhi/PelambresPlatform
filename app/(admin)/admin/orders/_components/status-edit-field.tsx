import { OrderStatus } from "@/types/order-definitions";
import { AdvanceStep, GoBackStep } from "./buttons";
import OrderStatusField from "./status-field";

export function OrderStatusEditField({ id, status }: { id?: string, status?: OrderStatus }) {
    if (!id || !status) return null;

    return (
        <div className="flex flex-row items-center justify-stretch">
            {
                status != 'pending' ?
                <GoBackStep id={id} status={status}/>
                :
                <span className="w-6 h-6"></span>
            }
            <OrderStatusField className="mx-4" statusName={status}/>
            {
                status != 'delivered' ?
                <AdvanceStep id={id} status={status}/>
                :
                <span className="w-6 h-6"></span>

            }
        </div>
    )
}