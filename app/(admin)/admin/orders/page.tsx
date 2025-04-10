import { Metadata } from 'next';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';
import OrdersTable from '@/app/ui/orders/table';
import Pagination from '@/app/ui/invoices/pagination';
import { fetchOrdersPages } from '@/app/lib/order-data';
import { PlusIcon } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Orders',
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
    const totalPages = await fetchOrdersPages(query);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Orders</h1>
            </div>
            <div className="mt-4">
                <Link
                href="/admin/orders/create"
                className="flex h-10 w-40 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <span>Create Order</span>
                    <PlusIcon className="h-5 md:ml-4" />
                </Link>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search quotes..." />
            </div>
                <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
                    <OrdersTable query={query} currentPage={currentPage} />
                </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    )
}