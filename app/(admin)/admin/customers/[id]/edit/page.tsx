import { fetchCustomerById } from "@/app/lib/customer-data";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import EditForm from "@/app/ui/customers/edit-form";
import { notFound } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const customerId = params.id;
    const customer = await fetchCustomerById(customerId);
    
    if (!customer) {
        notFound();
    }
    
    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
                { label: 'Customers', href: '/admin/customers' },
                {
                    label: 'Edit Customer',
                    href: `/admin/customers/${customerId}/edit`,
                    active: true,
                },
            ]}/>
            <div className="flex w-full">
                <div className="flex justify-center">
                    <EditForm customer={customer} redirect/>
                </div>
            </div>
        </main>
    )
}