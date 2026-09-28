import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import Form from "@/app/(admin)/admin/customers/_components/create-form";

export default function Page() {    
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                { label: 'Clientes', href: '/admin/customers' },
                {
                    label: 'Nuevo cliente',
                    href: '/admin/customers/create',
                    active: true,
                },
                ]}
            />
            <div className="flex justify-center">
                <div className="m-2 w-fit rounded-lg border border-border bg-card p-6 shadow-sm">
                    <Form redirect />
                </div>
            </div>
        </main>
    )   
}