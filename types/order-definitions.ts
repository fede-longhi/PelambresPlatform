import { CircleCheck, CircleX, Clock, Hammer, PackageCheck } from "lucide-react";

export const ORDER_STATUS_VALUES = [
    'pending',
    'in progress',
    'finished',
    'delivered',
    'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const ORDER_CREATE_STATUS_VALUES = [
    'pending',
    'in progress',
    'finished',
    'delivered',
] as const;

export const OrderStatuses = {
    "pending": { 
        name: "pending",
        previous: null,
        next: "in progress" as OrderStatus | null,
        value: 'pending',
        label: 'Pendiente',
        icon: Clock,
        class: "bg-gray-500 text-primary-foreground"
    },
    "in progress": {
        name: "in progress",
        previous: "pending" as OrderStatus | null,
        next: "finished" as OrderStatus | null,
        value: 'in progress',
        label: 'En producción',
        icon: Hammer,
        class: "bg-yellow-500 text-primary-foreground"
    },
    "finished": {
        name: "finished",
        previous: "in progress" as OrderStatus | null,
        next: "delivered" as OrderStatus | null,
        value: 'finished',
        label: 'Terminado',
        icon: CircleCheck,
        class: "bg-green-500 text-primary-foreground"
    },
    "delivered": {
        name: "delivered",
        previous: "finished" as OrderStatus | null,
        next: null,
        value: 'delivered',
        label: 'Entregado',
        icon: PackageCheck,
        class: "bg-primary text-primary-foreground"
    },
    "cancelled": {
        name: "cancelled",
        previous: null,
        next: null,
        value: 'cancelled',
        label: 'Cancelado',
        icon: CircleX,
        class: "bg-red-500 text-primary-foreground"
    }
} as const;

export type OrderStatusEvent = {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  createdAt: string;
};

export type OrderAttachment = {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
};