import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderTable } from "@/types/definitions";
import { OrderStatusEditField } from "./status-edit-field";
import { formatDateToLocal } from "@/lib/utils";
import { formatQuoteNumber } from "@/lib/consts/quote-document-consts";
import { EditOrder } from "./buttons";
import Link from "next/link";

function OrderDetailCard ({order} : {order: OrderTable}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex">
            <h2>Pedido {order.tracking_code}</h2>
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
          <span className="font-medium">Código:</span> {order.tracking_code}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Entrega estimada:</span> {format(new Date(order.estimated_date), "PPP")}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Importe:</span> ${order.amount}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Creado:</span> {formatDateToLocal(order.created_date, 'es-AR')}
        </p>
        {order.quote_id ? (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Presupuesto:</span>{' '}
            <Link
              href={`/admin/quotes/${order.quote_id}`}
              className="text-primary hover:underline"
            >
              Nº {formatQuoteNumber(order.quote_number ?? 0)}
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default OrderDetailCard;
