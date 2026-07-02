import { useState } from "react";
import { OrderFormState } from "@/lib/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { CustomerSelectField } from '@/components/shared/customer-select-field';
import type { CustomerField } from '@/components/shared/customer-select-field';
import { OrderStatuses } from "@/types/order-definitions";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { generateCode } from "@/lib/utils";
import { TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH } from "@/lib/consts";
import { Dices } from "lucide-react";
import FieldErrorDisplay from "@/components/ui/field-error-display";

export { CustomerSelectField };
export type { CustomerField };

export function StatusField({ defaultValue, state } : { defaultValue?: string, state: OrderFormState }) {
    const [orderStatus, setOrderStatus] = useState<string>(defaultValue ?? 'pending');
    const statuses = OrderStatuses;
    return (
        <fieldset>
            <Label htmlFor="status" className="mb-2">Estado de la orden</Label>
            <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="flex gap-4 flex-col md:flex-row">
                    {Object.entries(statuses).map((entry) => {
                        const status = entry[1];
                        const Icon = status.icon
                        return (
                            <div key={status.value} className="flex items-center">
                                <input
                                    id={status.value}
                                    name="status"
                                    type="radio"
                                    value={status.value}
                                    checked={orderStatus === status.value}
                                    onChange={() => setOrderStatus(status.value)}
                                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-primary focus:ring-2"
                                />
                                <label
                                    htmlFor={status.value}
                                    className={`ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status.class}`}
                                >
                                    {status.label}
                                    <Icon className="h-5 w-5" fontSize="small"/>
                                </label>
                            </div>
                        )
                    })}
                </div>
            </div>
            <FieldErrorDisplay id="status-error" errors={state.errors?.status} />
        </fieldset>
    );
}

export function TrackingCodeInput({defaultValue} : {defaultValue?: string}) {
    const [code, setCode] = useState<string>(defaultValue ?? "");

    return (
        <div className="flex flex-col md:flex-row items-end">
            <div className="flex flex-col">
                <Label htmlFor="code" className="mb-2">Código</Label>
                <InputOTP
                    className="bg-white"
                    id="code"
                    name="code"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    value={code}
                    onChange={(newCode)=>{setCode(newCode)}}
                >
                    <InputOTPGroup className="bg-white">
                        {[...Array(TRACKING_CODE_LENGTH)].map((_, i) => (
                            <InputOTPSlot key={i} index={i} />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
            </div>
            <Button
                className="ml-4"
                type="button"
                onClick={() => {setCode(generateCode(TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH))}}>
                Generate <Dices/>
            </Button>
        </div>
    );
}
