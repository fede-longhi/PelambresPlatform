import TrackingCodeSearch from "@/app/ui/orders/code-search";
import { OrderStatusDetail } from "@/app/ui/orders/status-detail";
import { StatusDetailSkeleton } from "@/app/ui/skeletons";
import { ArrowBack } from "@mui/icons-material";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

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
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col w-[600px] shadow-md bg-slate-200">
                <h1 className="text-center bg-primary text-primary-foreground rounded-t-md p-4 text-[32px] font-medium">
                    Estado de impresión
                </h1>
                <div className="flex flex-col justify-center p-4">
                    <TrackingCodeSearch />

                    <div className="mt-8 mx-4">
                        {
                            query &&
                            <Suspense key={query} fallback={<StatusDetailSkeleton />}>
                                <OrderStatusDetail code={query}/>
                            </Suspense>
                        }
                    </div>
                </div>
            </div>
            <Link href="/" className="rounded-md border px-2 py-1 mt-4 border-primary text-secondary-foreground items-center shadow text-sm"><ArrowBack className="mr-2" />Volver</Link>
        </div>
    )
}