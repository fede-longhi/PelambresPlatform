 'use client'

import { useActionState } from "react";
import { useRouter } from 'next/navigation'
import { createOrder, OrderFormState } from "@/app/lib/order-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldErrorDisplay from "@/components/ui/field-error-display";
import { CustomerSelectField, StatusField, TrackingCodeInput } from "./form-fields";

export default function CreateForm() {
    const router = useRouter();
    const initialState: OrderFormState = { message: null, errors: {} };
    const [state, formAction, isPending] = useActionState(createOrder, initialState);

    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6 md:space-y-4">
                <TrackingCodeInput />
                <CustomerSelectField />

                <div>
                    <StatusField state={state} />
                </div>

                <div className="mt-4">
                    <Label htmlFor="amount" className="mb-2">
                        Amount
                    </Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        defaultValue={(state.payload?.get("amount") || "") as string}
                        placeholder="Ingresa un monto"
                        aria-describedby="amount-error"
                    />
                    <FieldErrorDisplay id="amount-error" errors={state.errors?.amount} />
                </div>

                <div className="mt-4 flex flex-col">
                    <Label htmlFor="estimated-date" className="mb-2">
                        Estimated Date
                    </Label>
                    <Input
                        type="date"
                        name="estimatedDate"
                        defaultValue={(state.payload?.get("estimatedDate") || "") as string}
                        aria-describedby="estimated-date-error"/>
                    <FieldErrorDisplay id="estimated-date-error" errors={state.errors?.estimatedDate} />
                </div>

                <div className="flex flex-row space-x-2">
                    <span className="flex-1" />
                    <Button className="mt-4" type="button" variant="outline" disabled={isPending} onClick={() =>{router.back()}}>Cancel</Button>
                    <Button className="mt-4" type="submit" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Create Order'}
                    </Button>
                </div>
            </div>
        </form>
    )
}