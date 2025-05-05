import { fetchLastOrderDetail, fetchNewestOrder, fetchOrderDetailByTrackingCode } from "@/app/lib/order-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatusField from "./status-field";
import { formatDate } from "date-fns";
import { Label } from "@/components/ui/label";
import { OrderStatusEditField } from "./status-edit-field";
import { formatCurrency } from "@/lib/utils";
import OrderDetailCard from "./card-detail";

export async function OrderStatusDetailByCode({code} : {code:string}) {
    
    const orders = await fetchOrderDetailByTrackingCode(code);
    const order = orders[0];

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Estado de la orden</CardTitle>
                    <CardDescription>
                        {
                            code != "" && !order && "No se encontró ninguna orden."
                        }
                        {
                            order &&
                            <div>
                                Orden: {order.id}  
                            </div>
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                        {
                            order &&
                            <div className="flex flex-col">
                                <OrderStatusField statusName={order.status} />
                                <div className="flex flex-row items-center mt-4">
                                    <Label className="text-md mr-2">Fecha estimada de finalización: </Label>
                                    <p className="text-md border py-1 px-2 rounded-sm">{formatDate(order.estimated_date, "dd/MM/yy")}</p>
                                </div>
                            </div>
                        }
                </CardContent>
            </Card>
        </div>
        
    )
}

export async function LastOrderStatusDetail(
    {canEdit, title, titleClassName, className} :
    {canEdit: boolean, title: string, titleClassName?: string, className?: string}
){
    const order = await fetchLastOrderDetail();
    
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className={titleClassName}>
                    {title}
                </CardTitle>
                <CardDescription>
                    <div>
                        {order.tracking_code}
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                    {
                        order &&
                        <div className="flex flex-col">
                            <div className="flex justify-center">
                                {
                                    canEdit ?
                                    <OrderStatusEditField id={order.id} status={order.status} />
                                    :
                                    <OrderStatusField statusName={order.status} />
                                }
                            </div>
                            <div className="flex flex-row items-center mt-4">
                                <Label className="text-md mr-2">Fecha estimada de finalización: </Label>
                                <p className="text-md border py-1 px-2 rounded-sm">{formatDate(order.estimated_date, "dd/MM/yy")}</p>
                            </div>
                            <div className="flex flex-row items-center">
                                <Label className="text-md mr-2">Cliente: </Label>
                                <p>
                                    {
                                        order.type == 'person' ?
                                        order.first_name + " " + order.last_name
                                        :
                                        order.name
                                    }
                                </p>
                            </div>
                            <div className="flex flex-row items-center">
                                <Label className="text-md mr-2">Valor: </Label>
                                <p>{formatCurrency(order.amount)}</p>
                            </div>
                        </div>
                    }
            </CardContent>
        </Card>
    )
}

export async function NewestOrderDetail() {
    const order = await fetchNewestOrder();

    return (
        <OrderDetailCard order={order} />
    )

}