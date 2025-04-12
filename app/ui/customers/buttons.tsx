import { deleteCustomer } from "@/app/lib/customer-actions"
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";


export function DeleteCustomerButton({ id, path } : { id : string, path: string }) {
    const deleteCustomerWithId = deleteCustomer.bind(null, id, path);
    return (
        <form action={deleteCustomerWithId}>
            <Button type="submit" variant="outline" className="p-2 text-sm" size="icon">
                <span className="sr-only">Delete</span>
                <TrashIcon size={24}/>
            </Button>
        </form>
    )
}

export function EditCustomerButton({ id } : { id : string }) {
    return (
        <Link
            href={`/admin/customers/${id}/edit`}
            className="rounded-md border hover:bg-gray-100 p-2 text-sm"
        >
            <PencilIcon size={16}/>
        </Link>
    );
}