import { useEffect, useState } from "react";
import { OrderFormState } from "@/app/lib/order-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import {Add, Business, Person, Search, UnfoldMore } from '@mui/icons-material';
import { Customer } from "@/app/lib/definitions";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDebouncedCallback } from 'use-debounce';
import { fetchFilteredCustomers } from "@/app/lib/customer-data";
import Spinner from "@/components/ui/spinner";
import { OrderStatuses } from "@/app/lib/order-definitions";
import CustomerForm from "../customers/create-form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { generateCode, getCustomerName } from "@/lib/utils";
import { TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH } from "@/app/lib/consts";
import { Dices } from "lucide-react";
import FieldErrorDisplay from "@/components/ui/field-error-display";

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

export type CustomerField = {
    value: string,
    label: string
}

export function CustomerSelectField({ defaultValue } : { defaultValue? : CustomerField}) {
    const [open, setOpen] = useState(false);
    const [customerFormOpen, setCustomerFormOpen] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<{value:string, label:string}>( defaultValue ?? {value:"", label:""} );
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

    useEffect(() => {
        const loadCustomers = async () => {
            setIsSearchingCustomers(true);
            const customers = await fetchFilteredCustomers(defaultValue?.label ?? "", 1);
            setFilteredCustomers(customers);
            setIsSearchingCustomers(false);
        };
    
        loadCustomers();      
    }, [defaultValue]);

    const handleCustomerSearch = useDebouncedCallback(async (term) => {
        setIsSearchingCustomers(true);
        const customers = await fetchFilteredCustomers(term, 1);
        setFilteredCustomers(customers);
        setIsSearchingCustomers(false);
    }, 300);

    return (
        <div className="flex flex-col">
            <Label htmlFor="customerId" className="mb-2">
                Customer
            </Label>
            <input type="hidden" name="customerId" value={selectedCustomer.value} />
            <div className="flex flex-col md:flex-row">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between overflow-hidden"
                        >
                            <span className="truncate max-w-[160px] whitespace-nowrap">
                                {selectedCustomer.value !== "" ? selectedCustomer.label : "Select customer..."}
                            </span>
                            <UnfoldMore className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <div className="flex items-center px-3 shadow-sm">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-primary" fontSize="small"/>
                            <input
                                className="flex h-10 w-full rounded-md border-0 focus:shadow-none focus:outline-none focus:ring-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Search customer..."
                                onChange={(e) => {
                                    handleCustomerSearch(e.target.value);
                                }}
                            />
                        </div>
                        {
                            isSearchingCustomers ?
                            <div className="flex justify-center p-6"> 
                                <Spinner />
                            </div>
                            :
                            <ul className="max-h-[200px] overflow-y-auto">
                                {
                                    filteredCustomers.map((customer) => (
                                        <li key={customer.id}
                                        className="flex p-2 border-t cursor-pointer text-xs items-center"
                                        onClick={() => {
                                            setSelectedCustomer({value: customer.id, label: getCustomerName(customer)});
                                            setOpen(false);
                                        }}>
                                            { customer.type == 'person' ? <Person className="mr-2" /> : <Business className="mr-2" /> }
                                            { getCustomerName(customer) }
                                        </li>
                                    ))
                                }
                            </ul>
                            
                        }
                        
                    </PopoverContent>
                </Popover>
                <Popover open={customerFormOpen} onOpenChange={setCustomerFormOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="ml-4 bg-primary text-primary-foreground"><Add /> Create customer </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex w-auto">
                        <CustomerForm onSuccess={(customer?: Customer) => {
                            setCustomerFormOpen(false);
                            if (customer)
                                setSelectedCustomer({value: customer?.id, label: getCustomerName(customer)});
                        }} />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}