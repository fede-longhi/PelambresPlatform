import { fetchOrderById } from "@/app/lib/order-data";
import { fetchOrderPrintJobs } from "@/app/lib/print-job-data";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import OrderDetailCard from "@/app/ui/orders/card-detail";
import OrderCustomerDetailCard from "@/app/ui/orders/order-customer-detail";
import OrderPrintJobsDetail from "@/app/ui/orders/print-jobs-detail";
import { CardSkeleton } from "@/app/ui/skeletons";
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