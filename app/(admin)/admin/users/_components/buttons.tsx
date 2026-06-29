'use client';

import { softDeleteUser } from '@/lib/actions/user-actions';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';

export function DeleteUserButton({ id }: { id: string }) {
  const deleteUserWithId = softDeleteUser.bind(null, id);

  return (
    <form action={deleteUserWithId}>
      <Button
        type="submit"
        variant="outline"
        className="p-2 text-sm"
        size="icon"
      >
        <span className="sr-only">Eliminar</span>
        <TrashIcon size={16} />
      </Button>
    </form>
  );
}

export function EditUserButton({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/users/${id}/edit`}
      className="rounded-md border hover:bg-gray-100 p-2 text-sm"
    >
      <PencilIcon size={16} />
    </Link>
  );
}
