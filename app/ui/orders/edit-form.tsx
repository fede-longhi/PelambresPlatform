"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Order } from "@/app/lib/definitions";
import { OrderFormState, updateOrder } from "@/app/lib/order-actions";
import { dateLongStringToString, getOrderCustomerName } from "@/lib/utils";
import { CustomerSelectField, StatusField, TrackingCodeInput } from "./form-fields";

interface OrderEditFormProps {
  order: Order;
}

export default function OrderEditForm({ order }: OrderEditFormProps) {
    const router = useRouter();
    const initialState: OrderFormState = { message: null, errors: {} };
    const updateOrderWithId = updateOrder.bind(null, order.id);
    const [state, formAction] = useActionState(updateOrderWithId, initialState);

    const estimatedDate = dateLongStringToString(order.estimated_date);
    
    return (
        <form action={formAction} className="space-y-4 p-4 border rounded-lg shadow-md">
            <TrackingCodeInput defaultValue={order.tracking_code}/>

            <div>
                <Label htmlFor="estimated_date">Estimated Date</Label>
                <Input type="date" id="estimated_date" name="estimated_date" defaultValue={estimatedDate} className="w-auto"/>
            </div>

            <div>
                <StatusField defaultValue={order.status} state={state} />
            </div>

            <CustomerSelectField defaultValue={{value: order.customer_id, label: getOrderCustomerName(order)}} />

            <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="flex items-center">
                    $ <Input type="number" id="amount" name="amount" defaultValue={order.amount} className="w-auto ml-2"/>
                </div>
            </div>

            <div className="flex flex-row justify-center space-x-4 border-t">
                <Button className="mt-4" type="button" variant="outline" onClick={() =>{router.back()}}>Cancel</Button>
                <Button className="mt-4" type="submit">Save Changes</Button>
            </div>
        </form>
    );
}