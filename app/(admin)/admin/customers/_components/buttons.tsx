import { deleteCustomer } from "@/lib/actions/customer-actions"
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { FileText, PencilIcon, Plus } from "lucide-react";
import Link from "next/link";

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

export function EditCustomerButton({
  id,
  label,
}: {
  id: string;
  label?: string;
}) {
  if (label) {
    return (
      <Button asChild variant="outline">
        <Link href={`/admin/customers/${id}/edit`}>
          <PencilIcon className="mr-2 size-4" aria-hidden="true" />
          {label}
        </Link>
      </Button>
    );
  }

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

export function CreateOrderForCustomerButton({ id }: { id: string }) {
  return (
    <Button asChild>
      <Link href={`/admin/orders/create?customerId=${id}`}>
        <Plus className="mr-2 size-4" aria-hidden="true" />
        Nuevo pedido
      </Link>
    </Button>
  );
}

export function CreateQuoteForCustomerButton({ id }: { id: string }) {
  return (
    <Button asChild variant="outline">
      <Link href={`/admin/quotes/create?customerId=${id}`}>
        <FileText className="mr-2 size-4" aria-hidden="true" />
        Nuevo presupuesto
      </Link>
    </Button>
  );
}
