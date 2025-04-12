import { fetchCustomerOrders } from "@/app/lib/order-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import OrderStatusField from "./status-field";
import { formatDateToLocal } from "@/app/lib/utils";

export default async function CustomerLastOrders({id, className} : {id: string, className?: string}) {
    const orders = await fetchCustomerOrders(id);
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>
                    Customer Orders
                </CardTitle>
            </CardHeader>
            <CardContent>
                {
                    orders.map(order => (
                        <Link key={order.id} href={`/orders/${order.id}`} className="flex space-x-4 items-center bg-gray-50 hover:bg-gray-200 py-2 px-3 rounded-lg">
                            <span>{order.tracking_code}</span>
                            <span><OrderStatusField statusName={order.status}/></span>
                            <span>{formatDateToLocal(order.created_date, 'es-AR')}</span>
                        </Link> 
                    ))
                }
            </CardContent>
        </Card>
    )
}