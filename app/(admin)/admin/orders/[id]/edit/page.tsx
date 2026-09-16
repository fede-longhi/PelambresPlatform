import { fetchOrderById } from "@/lib/data/order-data";
import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import OrderEditForm from "@/app/(admin)/admin/orders/_components/edit-form";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const order = await fetchOrderById(id);
    
    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
                { label: 'Pedidos', href: '/admin/orders' },
                {
                    label: `${order.tracking_code ?? id}`,
                    href: `/admin/orders/${id}`,
                },
                {
                    label: 'Editar pedido',
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