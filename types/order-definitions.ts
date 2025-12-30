import { CircleCheck, CircleX, Clock, Hammer, PackageCheck } from "lucide-react";

export type OrderStatus = 'pending' | 'in progress' | 'finished' | 'delivered' | 'cancelled';

export const OrderStatuses = {
    "pending": { 
        name: "pending",
        previous: null,
        next: "in progress",
        value: 'pending',
        label: 'Pendiente',
        icon: Clock,
        class: "bg-gray-500 text-primary-foreground"
    },
    "in progress": {
        name: "in progress",
        previous: "pending",
        next: "finished",
        value: 'in progress',
        label: 'En curso',
        icon: Hammer,
        class: "bg-yellow-500 text-primary-foreground"
    },
    "finished": {
        name: "finished",
        previous: "in progress",
        next: "delivered",
        value: 'finished',
        label: 'Terminada',
        icon: CircleCheck,
        class: "bg-green-500 text-primary-foreground"
    },
    "delivered": {
        name: "delivered",
        previous: "finished",
        next: null,
        value: 'delivered',
        label: 'Entregada',
        icon: PackageCheck,
        class: "bg-primary text-primary-foreground"
    },
    "cancelled": {
        name: "cancelled",
        previous: null,
        next: null,
        value: 'cancelled',
        label: 'Cancelada',
        icon: CircleX,
        class: "bg-red-500 text-primary-foreground"
    }
}