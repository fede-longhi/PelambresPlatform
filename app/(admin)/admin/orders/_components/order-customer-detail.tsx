import { OrderTable } from "@/types/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderCustomerName } from "@/lib/utils";
import Link from "next/link";
import CustomerTypeField from "@/app/(admin)/admin/customers/_components/type-field";

export default function OrderCustomerDetailCard({order} : {order: OrderTable}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex">
                    <Link href={`/admin/customers/${order.customer_id}`}>
                        <h2>Cliente</h2>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <CustomerTypeField type={order.customer_type} />
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-secondary-foreground">Nombre:</span> {getOrderCustomerName(order)}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-secondary-foreground">Email:</span> {order.email}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-secondary-foreground">Teléfono:</span> {order.phone}
                </p>
            </CardContent>
        </Card>
    );
}