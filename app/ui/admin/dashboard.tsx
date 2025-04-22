import { LastOrderStatusDetail, NewestOrderDetail } from "../orders/status-detail";

export default function Dashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 h-full">
                <LastOrderStatusDetail canEdit title="Última Orden" titleClassName="text-center" className="h-full" />
            </div>

            <div className="col-span-12 md:col-span-4 h-full">
                <NewestOrderDetail />
            </div>

            {/* Total impresiones */}
            <div className="col-span-12 md:col-span-12">
            {/* <TotalPrints /> */}
            </div>

            {/* Gráfico de rendimiento */}
            <div className="col-span-12 md:col-span-8">
            {/* <PerformanceChart /> */}
            </div>
        </div>
    )
}