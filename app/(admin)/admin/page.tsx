import Dashboard from "@/app/(admin)/admin/_components/dashboard";
import { CreateOrder } from "@/app/(admin)/admin/orders/_components/buttons";
import PageHeader from "@/components/ui/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Home',
};

export default function Page() {
    return (
        <div>
            <PageHeader title="Home" className="mb-6 md:mb-12"/>
            <div className="mb-2">
                <CreateOrder />
            </div>
            <Dashboard />
        </div>
    )
}       