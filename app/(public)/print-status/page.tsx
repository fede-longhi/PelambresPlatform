import TrackingCodeSearch from "@/app/ui/orders/code-search";
import { OrderStatusDetailByCode } from "@/app/ui/orders/status-detail";
import { StatusDetailSkeleton } from "@/app/ui/skeletons";
import PageHeader from "@/components/layout/page-header";
import { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: 'Estado de la orden',
};

export default async function Page(props: {
    searchParams?: Promise<{
        query?:string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    return (
        <div className="flex justify-center py-12 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Estado de impresión"
                    description="Verificá el estado de tu orden de impresión 3D ingresando el código de seguimiento proporcionado." />
                <Card className="w-full max-w-2xl mx-auto shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl">
                            Código de Seguimiento
                        </CardTitle>
                        <CardDescription>
                            Ingresá el código de seguimiento que te proporcionamos al confirmar tu orden de impresión.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-8">
                            <TrackingCodeSearch />
                        </div>
                        {
                            query &&
                            <Suspense key={query} fallback={<StatusDetailSkeleton />}>
                                <OrderStatusDetailByCode code={query}/>
                            </Suspense>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}