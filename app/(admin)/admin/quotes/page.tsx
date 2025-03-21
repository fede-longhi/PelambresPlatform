import QuotesTable from "@/app/ui/quote/table";
import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchQuotesPages } from '@/app/lib/quote-data';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
    title: 'Quotes',
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
    const totalPages = await fetchQuotesPages(query);

    return (
        <div className="w-full">
        <div className="flex w-full items-center justify-between">
            <h1 className={`${lusitana.className} text-2xl`}>Quotes</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
            <Search placeholder="Search quotes..." />
        </div>
        <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
            <QuotesTable query={query} currentPage={currentPage} />
        </Suspense>
        <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
        </div>
        </div>
    )
}