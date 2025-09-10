import { getConfiguration } from "@/app/lib/configuration-data";
import QuoteCalculator from "@/components/quote-calculator/quote-calculator";
import PageHeader from "@/components/ui/page-header";

export default async function Page() {
    const pricePerkWh = await getConfiguration("power_price_per_kWh");
    return (
        <div>
            <PageHeader title="Cotizador" />

            <div className="flex flex-row space-x-2">
                <div className="bg-slate-200 p-6 rounded-lg">
                    <QuoteCalculator pricePerKg={20000} pricePerHour={500}/>
                </div>
                <div className="bg-slate-200 p-6 rounded-lg">
                    <span>Price per kWh: {pricePerkWh.value}</span>
                </div>
            </div>
        </div>
    )
}