import { fetchOrderDetailByTrackingCode } from "@/app/lib/order-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatusField from "./status-field";
import { formatDate } from "date-fns";
import { Label } from "@/components/ui/label";

export async function OrderStatusDetail({code} : {code:string}) {
    
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