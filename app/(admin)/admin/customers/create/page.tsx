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
            <div className="flex justify-center">
                <div className="w-fit m-2 bg-gray-100 p-6 rounded-md">
                    <Form redirect />
                </div>
            </div>
        </main>
    )   
}