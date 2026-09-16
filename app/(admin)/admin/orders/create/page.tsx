import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import CreateForm from "@/app/(admin)/admin/orders/_components/create-form";

export default function Page() {
    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
              { label: 'Pedidos', href: '/admin/orders' },
              {
                label: 'Nuevo pedido',
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