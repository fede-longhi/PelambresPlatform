import { fetchCustomerById } from "@/lib/data/customer-data";
import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import CustomerDetailCard from "@/app/(admin)/admin/customers/_components/detail-card";
import CustomerLastOrders from "@/app/(admin)/admin/orders/_components/customer-last-orders";
import { CardSkeleton } from "@/components/shared/skeletons";
import { getCustomerName } from "@/lib/utils";
import { Suspense } from "react";
import CustomerTypeField from "@/app/(admin)/admin/customers/_components/type-field";

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