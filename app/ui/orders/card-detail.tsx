import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderTable } from "@/types/definitions";
import { OrderStatusEditField } from "./status-edit-field";
import { formatDateToLocal } from "@/lib/utils";
import { EditOrder } from "./buttons";

function OrderDetailCard ({order} : {order: OrderTable}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex">
            <h2>Order # {order.id}</h2>
            <span className="flex-1" />
            <div className="ml-2 h-fit flex ">
              <EditOrder id={order.id} />
            </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-center">
            <OrderStatusEditField id={order.id} status={order.status}/>
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Tracking Code:</span> {order.tracking_code}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Estimated Delivery:</span> {format(new Date(order.estimated_date), "PPP")}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Total Amount:</span> ${order.amount}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Created:</span> {formatDateToLocal(order.created_date, 'es-AR')}
        </p>
      </CardContent>
    </Card>
  );
};

export default OrderDetailCard;
