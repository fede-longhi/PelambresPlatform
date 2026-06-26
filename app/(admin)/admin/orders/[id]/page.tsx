import { fetchOrderById } from "@/lib/data/order-data";
import { fetchOrderPrintJobs } from "@/lib/data/print-job-data";
import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import OrderDetailCard from "@/app/(admin)/admin/orders/_components/card-detail";
import OrderCustomerDetailCard from "@/app/(admin)/admin/orders/_components/order-customer-detail";
import OrderPrintJobsDetail from "@/app/(admin)/admin/orders/_components/print-jobs-detail";
import { CardSkeleton } from "@/components/shared/skeletons";
import { Suspense } from "react";


export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [order, printJobs] = await Promise.all([
        fetchOrderById(id),
        fetchOrderPrintJobs(id)
    ]);
    const breadcrumbs = [
        { label: 'Orders', href: '/admin/orders' },
        {
            label: `${order.id}`,
            href: `/admin/orders/${id}`,
            active: true,
        },
    ];
    
    return (
        <div className="w-full">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                    <OrderDetailCard order={order}/>
                    <OrderCustomerDetailCard order={order}/>
                </div>
                <div>
                    <Suspense fallback={<CardSkeleton />}>
                        <OrderPrintJobsDetail orderId={order.id} printJobs={printJobs}/>
                    </Suspense>
                </div>
            </div>

        </div>
    )
}