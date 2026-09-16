import { softDeleteUser } from '@/lib/actions/user-actions';
import { PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';

export function DeleteUserButton({ id }: { id: string }) {
  const deleteUserWithId = softDeleteUser.bind(null, id);

  return (
    <ConfirmDeleteButton
      ariaLabel="Eliminar usuario"
      title="Eliminar usuario"
      description="La cuenta se desactivará y dejará de aparecer en el listado."
      action={deleteUserWithId}
    />
  );
}

export function EditUserButton({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/users/${id}/edit`}
      aria-label="Editar usuario"
      className="inline-flex size-11 items-center justify-center rounded-md border hover:bg-muted md:size-9"
    >
      <PencilIcon size={16} aria-hidden="true" />
    </Link>
  );
}
