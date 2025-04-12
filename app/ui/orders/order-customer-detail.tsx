import { OrderTable } from "@/app/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderCustomerName } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import CustomerTypeField from "../customers/type-field";

export default function OrderCustomerDetailCard({order} : {order: OrderTable}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex">
                    <h2>Customer</h2>
                    <span className="flex-1"/>
                    <Link href={`/admin/customers/${order.customer_id}`} className="border rounded-md p-2">
                        <EyeIcon size={16}/>
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