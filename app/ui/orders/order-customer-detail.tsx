import { OrderTable } from "@/types/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderCustomerName } from "@/lib/utils";
import Link from "next/link";
import CustomerTypeField from "../customers/type-field";

export default function OrderCustomerDetailCard({order} : {order: OrderTable}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex">
                    <Link href={`/admin/customers/${order.customer_id}`}>
                        <h2>Customer</h2>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <CustomerTypeField type={order.customer_type} />
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-secondary-foreground">Name:</span> {getOrderCustomerName(order)}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-secondary-foreground">Email:</span> {order.email}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-secondary-foreground">Phone:</span> {order.phone}
                </p>
            </CardContent>
        </Card>
    );
}