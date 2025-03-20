export type OrderStatus = 'pending' | 'in progress' | 'finished' | 'delivered';

export const OrderStatuses = {
    "pending": { "name": "pending", "previous": null, "next": "in progress" },
    "in progress": { "name": "in progress", "previous": "pending", "next": "finished" },
    "finished": { "name": "finished", "previous": "in progress", "next": "delivered" },
    "delivered": { "name": "delivered", "previous": "finished", "next": null }
}