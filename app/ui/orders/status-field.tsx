import { OrderStatus, OrderStatuses } from "@/types/order-definitions"
import { cn } from "@/lib/utils";

export default function OrderStatusField({className, statusName} : {className?: string, statusName: OrderStatus}) {
    const status = OrderStatuses[statusName];
    const Icon = status.icon;

    return (
        <label
            htmlFor={status.value}
            className={cn(`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status.class}`, className)}
        >
            {status.label}
            <Icon className="h-5 w-5" fontSize="small"/>
        </label>
    )
}