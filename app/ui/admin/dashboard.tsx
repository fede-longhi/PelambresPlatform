import { LastOrderStatusDetail, NewestOrderDetail } from "../orders/status-detail";
import TotalSalesCard from "@/components/dashboard/total-sales"

export default function Dashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 h-full">
                <TotalSalesCard className="h-full" titleClassName="text-center text-xl"/>
            </div>

            <div className="col-span-12 md:col-span-4 h-full">
                <LastOrderStatusDetail canEdit title="Última Orden" titleClassName="text-center" className="h-full" />
            </div>

            <div className="col-span-12 md:col-span-4 h-full">
                <NewestOrderDetail />
            </div>


            <div className="col-span-12 md:col-span-8">
            </div>
        </div>
    )
}