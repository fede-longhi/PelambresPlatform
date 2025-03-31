import Dashboard from "@/app/ui/admin/dashboard";
import PageHeader from "@/components/ui/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Home',
};

export default function Page() {
    return (
        <div>
            <PageHeader title="Home" className="mb-6 md:mb-12"/>
            <Dashboard />
        </div>
    )
}       