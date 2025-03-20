import { Metadata } from 'next';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { PlusIcon } from '@heroicons/react/24/outline';

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

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Prints</h1>
            </div>
            <div className="mt-4">
                <Link
                href="/admin/prints/create"
                className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <span>Create Print</span>
                    <PlusIcon className="h-5 md:ml-4" />
                </Link>

            </div>
        </div>
    )
}