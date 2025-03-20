import { fetchFilteredOrders } from "@/app/lib/order-data";
import { formatCurrency, formatDateToLocal } from "@/app/lib/utils";
import { UpdateInvoice, DeleteInvoice } from "../invoices/buttons";
import { OrderStatusEditField } from "./status-edit-field";
import { DeleteOrder } from "./buttons";

export default async function OrdersTable({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {

    const orders = await fetchFilteredOrders(query, currentPage);

    return (
        <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
                {orders?.map((order) => (
                    <div
                        key={order.id}
                        className="mb-2 w-full rounded-md bg-white p-4"
                    >
                        <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <div className="mb-2 flex items-center">
                            {
                                order.type == 'person' ?
                                <p>{order.first_name}, {order.last_name}</p>
                                :
                                <p>{order.name}</p>
                            }
                            </div>
                            <p className="text-sm text-gray-500">{order.tracking_code}</p>
                        </div>
                        </div>
                        <div className="flex w-full items-center justify-between pt-4">
                        <div>
                            <p className="text-xl font-medium">
                            {formatCurrency(order.amount)}
                            </p>
                            <p>{formatDateToLocal(order.created_date)}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <UpdateInvoice id={order.id} />
                            <DeleteInvoice id={order.id} />
                        </div>
                        </div>
                    </div>
                ))}
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Customer
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    Code
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    Amount
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    Estimated Date
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    Created Date
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium text-center">
                    Status
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                        <span className="sr-only">Edit</span>
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white">
                {orders?.map((order) => (
                    <tr
                    key={order.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                            {
                                order.type == 'person' ?
                                <p>{order.first_name}, {order.last_name}</p>
                                :
                                <p>{order.name}</p>
                            }
                            </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {order.tracking_code}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {formatCurrency(order.amount)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {formatDateToLocal(order.estimated_date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {formatDateToLocal(order.created_date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            <OrderStatusEditField id={order.id} status={order.status}/>
                        </td>
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                            <div className="flex justify-end gap-3">
                                <DeleteOrder id={order.id}/> 
                            {/* <UpdateInvoice id={invoice.id} />
                            <DeleteInvoice id={invoice.id} /> */}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    )

}