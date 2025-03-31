import Breadcrumbs from "@/app/ui/breadcrumbs";
import Form from "@/app/ui/customers/create-form";

export default function Page() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                { label: 'Customers', href: '/admin/customers' },
                {
                    label: 'Create Customer',
                    href: '/admin/customers/create',
                    active: true,
                },
                ]}
            />
            <Form redirect/>
        </main>
    )   
}