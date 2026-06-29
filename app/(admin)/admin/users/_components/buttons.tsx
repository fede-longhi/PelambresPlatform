'use client';

import { softDeleteUser, type UserFormState } from '@/lib/actions/user-actions';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';

export function DeleteUserButton({ id }: { id: string }) {
  const initialState: UserFormState = { message: null, success: false };
  const deleteUserWithId = softDeleteUser.bind(null, id);
  const [state, formAction, isPending] = useActionState(deleteUserWithId, initialState);

  const errorMessage = !state.success && state.message ? state.message : undefined;

  return (
    <form action={formAction} className="inline-flex flex-col items-center gap-1">
      {!state.success && state.message && (
        <p className="sr-only" aria-live="polite">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        variant="outline"
        className="p-2 text-sm"
        size="icon"
        disabled={isPending}
        title={errorMessage ?? 'Eliminar'}
        aria-busy={isPending}
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
