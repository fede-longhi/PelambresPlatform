import { getOrderSalesValueFromMonth, getEstimatedOrderSalesValueFromMonth, getEstimatedOrdersFromMonth } from "@/app/lib/order-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthNameFromDate } from "@/lib/utils";

export default async function TotalSalesCard(
    {className, titleClassName} :
    {className?: string, titleClassName?: string}
) {
    const now = new Date();
    const currentMonth = getMonthNameFromDate(now)
    const deliveredSales = await getOrderSalesValueFromMonth(now.getMonth(), now.getFullYear());
    const estimatedSales = await getEstimatedOrderSalesValueFromMonth(now.getMonth(), now.getFullYear());
    const deliveredSalesLastMonth = await getOrderSalesValueFromMonth(now.getMonth()-1, now.getFullYear());

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className={titleClassName}>
                    Total Sales {currentMonth}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-primary text-center font-bold text-[32px] mb-2">
                    {formatCurrency(deliveredSales.total_amount)}
                </div>
                <div className="flex flex-col text-center">
                    <h2 className="font-semibold mr-2">Estimated</h2>
                    {formatCurrency(estimatedSales.total_amount)}
                </div>
                <div className="flex flex-col text-center">
                    <h2 className="font-semibold mt-6">Last Month</h2>
                    {formatCurrency(deliveredSalesLastMonth.total_amount)}
                </div>
            </CardContent>
        </Card>
    )
}