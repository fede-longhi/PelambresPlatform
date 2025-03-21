import { CheckCircleOutline, Handshake, Loop, Schedule } from "@mui/icons-material";

export type OrderStatus = 'pending' | 'in progress' | 'finished' | 'delivered';

export const OrderStatuses = {
    "pending": { 
        name: "pending",
        previous: null,
        next: "in progress",
        value: 'pending',
        label: 'Pendiente',
        icon: Schedule,
        class: "bg-gray-500 text-primary-foreground"
    },
    "in progress": {
        name: "in progress",
        previous: "pending",
        next: "finished",
        value: 'in progress',
        label: 'En curso',
        icon: Loop,
        class: "bg-yellow-500 text-primary-foreground"
    },
    "finished": {
        name: "finished",
        previous: "in progress",
        next: "delivered",
        value: 'finished',
        label: 'Terminada',
        icon: CheckCircleOutline,
        class: "bg-green-500 text-primary-foreground"
    },
    "delivered": {
        name: "delivered",
        previous: "finished",
        next: null,
        value: 'delivered',
        label: 'Entregada',
        icon: Handshake,
        class: "bg-primary text-primary-foreground"
    }
}