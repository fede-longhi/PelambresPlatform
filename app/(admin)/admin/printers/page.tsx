import { fetchPrintersPages } from "@/lib/data/printer-data";
import Pagination from "@/components/ui/pagination";
import Search from "@/app/(admin)/admin/_components/search";
import { CreatePrinterButton } from "@/app/(admin)/admin/printers/_components/buttons";
import PrintersTable from "@/app/(admin)/admin/printers/_components/printers-table";
import PageHeader from "@/components/ui/page-header";
import { InvoicesTableSkeleton } from "@/components/shared/skeletons";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: 'Impresoras',
};

export default async function Page(props: {
    searchParams?: Promise<{
        query?:string;
        page?:string;
    }>;
}) {

    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchPrintersPages(query);

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader title="Impresoras" />
                <CreatePrinterButton />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
                Equipos del taller y su estado operativo.
            </p>
            <div className="mt-6 flex items-center justify-between gap-2">
                <Search placeholder="Buscar impresoras…" />
            </div>
            <div className="mt-6">
                <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
                    <PrintersTable query={query} currentPage={currentPage} />
                </Suspense>
            </div>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}