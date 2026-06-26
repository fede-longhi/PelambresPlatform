import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import CreateForm from "@/app/(admin)/admin/orders/_components/create-form";

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