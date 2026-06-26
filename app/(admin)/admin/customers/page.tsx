import { fetchCustomersPages } from "@/lib/data/customer-data";
import CustomersTable from "@/app/(admin)/admin/customers/_components/customers-table";
import { lusitana } from "@/app/fonts";
import Pagination from "@/components/ui/pagination";
import Search from "@/app/(admin)/admin/_components/search";
import { CustomersTableSkeleton } from "@/components/shared/skeletons";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Suspense } from "react";

export default async function Page(props: {
    searchParams?: Promise<{
        query?:string;
        page?:string;
    }>;
}) {

    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchCustomersPages(query);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
            </div>
            <div className="mt-4">
                <div className="flex">
                    <Link
                    href="/admin/customers/create"
                    className="flex w-auto h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        <span>Create Customer</span>
                        <PlusIcon className="h-5 md:ml-4" />
                    </Link>

                </div>

                <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                    <Search placeholder="Search customers..." />
                </div>
                <div className="mt-4">
                    <Suspense key={query + currentPage} fallback={<CustomersTableSkeleton />}>
                        <CustomersTable query={query} currentPage={currentPage}  />
                    </Suspense>
                </div>
                <div className="mt-5 flex w-full justify-center">
                    <Pagination totalPages={totalPages} />
                </div>

            </div>
        </div>
    )

}