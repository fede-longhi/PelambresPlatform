import { fetchCustomerById } from "@/app/lib/customer-data";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import CustomerDetailCard from "@/app/ui/customers/detail-card";
import CustomerLastOrders from "@/app/ui/orders/customer-last-orders";
import { CardSkeleton } from "@/app/ui/skeletons";
import { getCustomerName } from "@/lib/utils";
import { Suspense } from "react";
import CustomerTypeField from "@/app/ui/customers/type-field";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const customerId = params.id;
    const customer = await fetchCustomerById(customerId);
    const breadcrumbs = [
        { label: 'Customers', href: '/admin/customers' },
        {
            label: `${getCustomerName(customer)}`,
            href: `/admin/customers/${customerId}`,
            active: true,
        },
    ];

    return (
        <div className="w-full">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="flex flex-col">
                <CustomerTypeField type={customer.type} />
                <div className="flex flex-row mt-2 space-x-4">
                    <div className="flex grow">
                        <Suspense fallback={<CardSkeleton/>}>
                            <CustomerDetailCard customer={customer} className="grow"/>
                        </Suspense>
                    </div>
                    <div className="flex grow">
                        <Suspense fallback={<CardSkeleton/>}>
                            <CustomerLastOrders id={customerId} className="grow"/>
                        </Suspense>
                    </div>

                </div>
            </div>
        </div>
    )
}