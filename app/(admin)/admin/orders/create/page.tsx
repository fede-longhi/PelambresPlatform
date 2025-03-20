import Breadcrumbs from "@/app/ui/breadcrumbs";
import CreateForm from "@/app/ui/orders/create-form";

export default function Page() {
    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
              { label: 'Orders', href: '/admin/orders' },
              {
                label: 'Create Order',
                href: '/admin/orders/create',
                active: true,
              },
            ]}
            />
            <div className="flex w-full">
                <div className="flex justify-center">
                    <CreateForm />
                </div>
            </div>
        </main>
    )
}