'use client'

import { useActionState, useEffect, useState } from "react";
import { createPrint, PrintFormState } from "@/app/lib/print-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { generateCode } from "@/lib/utils";
import {AutoAwesome, Business, CheckCircleOutline, Handshake, Loop, Person, Search, Schedule, UnfoldMore } from '@mui/icons-material';
import { Customer } from "@/app/lib/definitions";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDebouncedCallback } from 'use-debounce';
import { fetchFilteredCustomers } from "@/app/lib/customer-data";
import Spinner from "@/components/ui/spinner";

const statuses = [
    { value: 'pending', label: 'Pending', icon: Schedule, class: "bg-gray-500 text-primary-foreground" },
    { value: 'in progress', label: 'In Progress', icon: Loop, class: "bg-yellow-500 text-primary-foreground" },
    { value: 'finished', label: 'Finished', icon: CheckCircleOutline, class: "bg-green-500 text-primary-foreground" },
    { value: 'delivered', label: 'Delivered', icon: Handshake, class: "bg-primary text-primary-foreground" }
];

export default function CreateForm() {
    const initialState: PrintFormState = { message: null, errors: {} };
    const [state, formAction] = useActionState(createPrint, initialState);
    const [code, setCode] = useState<string>("");
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<{value:string, label:string}>({value:"", label:""});
    const [open, setOpen] = useState(false);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

    useEffect(() => {
        const loadCustomers = async () => {
            setIsSearchingCustomers(true);
            const customers = await fetchFilteredCustomers("");
            setFilteredCustomers(customers);
            console.log("customersLoaded");
            setIsSearchingCustomers(false);
        };
    
        loadCustomers();      
    }, []);

    const handleCustomerSearch = useDebouncedCallback(async (term) => {
        console.log(term);
        setIsSearchingCustomers(true);
        const customers = await fetchFilteredCustomers(term);
        console.log(customers);
        setFilteredCustomers(customers);
        setIsSearchingCustomers(false);
    }, 300);
    

    const goBack = () => {
        console.log('cancel')
    }

    const generateRandomCode = () => {
        const code = generateCode('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6);
        setCode(code);
    }
        
    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <div className="flex flex-row items-end">
                    <div>
                        <Label htmlFor="code">Código</Label>
                        <InputOTP
                        className="bg-white"
                        id="code"
                        name="code"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        value={code}
                        >
                            <InputOTPGroup className="bg-white">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <Button className="ml-4" type="button" onClick={generateRandomCode}>Generate<AutoAwesome/></Button>
                </div>

                <div className="mt-4">
                    <input type="hidden" name="customerId" value={selectedCustomer.value} />
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
                                                setSelectedCustomer({value: customer.id, label: customer.type == 'person' ? customer.first_name + ', ' + customer.last_name : customer.name});
                                                setOpen(false);
                                            }}>
                                                { customer.type == 'person' ? <Person className="mr-2" /> : <Business className="mr-2" /> }
                                                { customer.type == 'person' ? customer.first_name + ', ' + customer.last_name : customer.name }
                                            </li>
                                        ))
                                    }
                                </ul>
                                
                            }
                            
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="mt-4">
                    <fieldset>
                        <legend className="mb-2 block text-sm font-medium">Estado de la orden</legend>
                        <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                            <div className="flex gap-4">
                                {statuses.map((status) => {
                                    const Icon = status.icon
                                    return (
                                        <div key={status.value} className="flex items-center">
                                            <input
                                                id={status.value}
                                                name="status"
                                                type="radio"
                                                value={status.value}
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
                        <div id="status-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.status?.map((error) => (
                                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
                            ))}
                        </div>
                    </fieldset>
                </div>

                <div className="mt-4">
                    <Label htmlFor="amount">
                        Amount
                    </Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                    />
                    <div id="status-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.amount?.map((error) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
                        ))}
                    </div>
                </div>
                

                <div className="flex flex-row space-x-2">
                    <span className="flex-1" />
                    <Button className="mt-4" type="button" variant="outline" onClick={goBack}>Cancel</Button>
                    <Button className="mt-4" type="submit">Submit</Button>
                </div>
            </div>
        </form>
    )
}