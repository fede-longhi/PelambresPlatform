import { deleteCustomer } from "@/lib/actions/customer-actions"
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function DeleteCustomerButton({ id, path } : { id : string, path: string }) {
    const deleteCustomerWithId = deleteCustomer.bind(null, id, path);
    return (
        <ConfirmDeleteButton
            ariaLabel="Eliminar cliente"
            title="Eliminar cliente"
            description="Esta acción no se puede deshacer."
            action={deleteCustomerWithId}
        />
    )
}

export function EditCustomerButton({ id } : { id : string }) {
    return (
        <Link
            href={`/admin/customers/${id}/edit`}
            aria-label="Editar cliente"
            className="inline-flex size-11 items-center justify-center rounded-md border hover:bg-muted md:size-9"
        >
            <PencilIcon size={16} aria-hidden="true" />
        </Link>
    );
}
