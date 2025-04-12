'use client';

import { Customer } from '@/app/lib/definitions';
import { Button } from '@/app/ui/button';
import { useActionState, useEffect, useState } from 'react';
import { CustomerFormState, updateCustomer} from '@/app/lib/customer-actions';
import { Building2, CircleX, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function EditCustomerForm({
    customer,
    onSuccess,
    redirect
}: {
    customer: Customer,
    onSuccess?: (customer?: Customer) => void,
    redirect?: boolean
}) {

    const initialState: CustomerFormState = { message: null, errors: {}, success: false, redirect: redirect };
    const updateCustomerWithId = updateCustomer.bind(null, customer.id);
    const [state, formAction, isPending] = useActionState(updateCustomerWithId, initialState);
    const [customerType, setCustomerType] = useState<'person'|'business'>(customer.type);
    const { toast } = useToast();
    
    useEffect(() => {
        if (state.message == 'success') {
            onSuccess?.(state.customer);
            toast({
                title: "Success",
                description: "Customer edited succesfuly.",
                variant: "success"
            });
        }
    },[state?.message, onSuccess, state.customer, toast])
        
    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <div aria-live="polite" aria-atomic="true">
                    {!state.success && state.message && (
                        <div className="flex flex-row items-center mt-2 text-sm text-red-500 border bg-slate-100 rounded-md p-2">
                            <CircleX className="mr-2"/>
                            <p>{state.message}</p>
                        </div>
                    )}
                </div>

                <fieldset>
                    <legend className="mb-2 block text-sm font-medium">
                        Type of Customer
                    </legend>
                    <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center">
                                <input
                                    id="person"
                                    name="type"
                                    type="radio"
                                    value="person"
                                    checked={customerType === "person"}
                                    onChange={()=>{setCustomerType("person")}}
                                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-primary focus:ring-2"
                                />
                                <label
                                    htmlFor="person"
                                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                                >
                                    Person <User className="h-4 w-4" />
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="business"
                                    name="type"
                                    type="radio"
                                    value="business"
                                    checked={customerType === "business"  }
                                    onChange={()=>{setCustomerType('business')}}
                                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-primary focus:ring-2"
                                    aria-describedby='status-error'
                                />
                                <label
                                    htmlFor="business"
                                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                                >
                                    Business <Building2 className="h-4 w-4" />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div id="type-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.type &&
                            state.errors.type.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                            </p>
                        ))}
                    </div>
                </fieldset>
                
                <div className={customerType === "business" ? "" : "hidden"}>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        defaultValue={(state.payload?.get("name") || customer.name || "") as string}
                        placeholder="Ingresa el nombre completo"
                        aria-describedby="name-error"
                    />
                    <div id="name-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name?.map((error) => (
                            <p className="mt-2 text-xs text-red-500" key={error}>{error}</p>
                        ))}
                    </div>
                </div>
                <div className={customerType === "person" ? "" : "hidden"}>
                    <Label htmlFor="first-name">Nombre</Label>
                    <Input
                        id="first-name"
                        type="text"
                        name="first-name"
                        defaultValue={(state.payload?.get("firstName") || customer.first_name || "") as string}
                        placeholder="Ingresa el nombre"
                        aria-describedby="first-name-error"
                        />
                    <div id="first-name-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.firstName?.map((error) => (
                            <p className="mt-2 text-xs text-red-500" key={error}>{error}</p>
                        ))}
                    </div>
                </div>

                <div className={customerType === "person" ? "" : "hidden"}>
                    <Label htmlFor="last-name">Apellido</Label>
                    <Input
                        id="last-name"
                        type="text"
                        name="last-name"
                        defaultValue={(state.payload?.get("lastName") || customer.last_name || "") as string}
                        placeholder="Ingresa el apellido"
                        aria-describedby="last-name-error"
                        />
                    <div id="last-name-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.lastName?.map((error) => (
                            <p className="mt-2 text-xs text-red-500" key={error}>{error}</p>
                        ))}
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        defaultValue={(state.payload?.get("email") || customer.email || "") as string}
                        placeholder="Ingresa el email"
                        aria-describedby="email-error"
                    />
                    <div id="email-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.email?.map((error) => (
                            <p className="mt-2 text-xs text-red-500" key={error}>{error}</p>
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                        id="phone"
                        type="text"
                        name="phone"
                        defaultValue={(state.payload?.get("phone") || customer.phone || "") as string}
                        placeholder="Número de teléfono"
                        aria-describedby="phone-error"
                    />
                    <div id="phone-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.phone?.map((error) => (
                            <p className="mt-2 text-xs text-red-500" key={error}>{error}</p>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
