import { lusitana } from "@/app/ui/fonts";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Page() {
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
            </div>
            <div className="mt-4">
                <Link
                href="/admin/customers/create"
                className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <span>Create Customer</span>
                    <PlusIcon className="h-5 md:ml-4" />
                </Link>
            </div>
        </div>
    )

}