import { OrderStatus, OrderStatuses } from "@/app/lib/order-definitions"

export default function OrderStatusField({statusName} : {statusName: OrderStatus}) {
    const status = OrderStatuses[statusName];
    const Icon = status.icon;

    return (
        <label
            htmlFor={status.value}
            className={`ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status.class}`}
        >
            {status.label}
            <Icon className="h-5 w-5" fontSize="small"/>
        </label>
    )
}