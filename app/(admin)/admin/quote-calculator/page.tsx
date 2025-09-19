import { getConfiguration } from "@/app/lib/configuration-data";
import SimpleCalculator from "@/components/quote-builder/simple-calculator";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function Page() {
    const pricePerkWh = await getConfiguration("power_price_per_kWh");
    
    return (
        <div>
            <PageHeader title="Cotizador" />

            <Tabs defaultValue="simple">
                <TabsList>
                    <TabsTrigger value="simple">Simple</TabsTrigger>
                    <TabsTrigger value="complete">Complete</TabsTrigger>
                </TabsList>
                <TabsContent value="simple">
                    <SimpleCalculator />
                </TabsContent>
                <TabsContent value="complete">
                    <div className="flex flex-row space-x-2">
                        <div className="bg-slate-200 p-6 rounded-lg">
                            <SimpleCalculator />
                        </div>
                        <div className="bg-slate-200 p-6 rounded-lg">
                            <span>Price per kWh: {pricePerkWh?.value}</span>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}