import { fetchOrderById } from "@/app/lib/order-data";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import OrderEditForm from "@/app/ui/orders/edit-form";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const order = await fetchOrderById(id);
    
    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
                { label: 'Orders', href: '/admin/orders' },
                {
                    label: `${id}`,
                    href: `/admin/orders/${id}`,
                },
                {
                    label: 'Edit Order',
                    href: `/admin/orders/${id}/edit`,
                    active: true,
                },
            ]}
            />
            <div className="flex w-full">
                <div className="flex justify-center">
                    <OrderEditForm order={order} />
                </div>
            </div>
        </main>
    )
}