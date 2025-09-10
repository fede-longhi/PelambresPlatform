import { fetchFilteredPrinters, fetchPrintersPages } from "@/app/lib/printer-data";
import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import { CreatePrinterButton } from "@/components/printers/buttons";
import PrintersTable from "@/components/printers/table";
import PageHeader from "@/components/ui/page-header";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: 'Printers',
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
            <PageHeader title="Printers" />
            <CreatePrinterButton />
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search printers..." />
            </div>
            <Suspense key={query + currentPage} fallback={null}>
                <PrintersTable query={query} currentPage={currentPage} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}