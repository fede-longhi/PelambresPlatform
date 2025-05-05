import QuoteCalculator from "@/components/quote-calculator/quote-calculator";

export default function Page() {
    return (
        <div>
            <h1>Cotizador</h1>
            <div className="bg-slate-200 p-6">
                <QuoteCalculator pricePerKg={20000} pricePerHour={500}/>
            </div>
        </div>
    )
}