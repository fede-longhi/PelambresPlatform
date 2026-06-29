'use client';

import { updateUser, type UserFormState } from '@/lib/actions/user-actions';
import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import ResetPasswordButton from './reset-password-button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { UserListItem, UserRole } from '@/types/user-definitions';

export default function EditUserForm({
  user,
  redirect,
}: {
  user: UserListItem;
  redirect?: boolean;
}) {
  const initialState: UserFormState = {
    message: null,
    errors: {},
    success: false,
    redirect,
  };
  const updateUserWithId = updateUser.bind(null, user.id);
  const [state, formAction, isPending] = useActionState(updateUserWithId, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Usuario actualizado',
        description: 'Los cambios se guardaron correctamente.',
        variant: 'success',
      });
    }
  }, [state.message, toast]);

  const isActiveValue =
    (state.payload?.get('is-active') as string) ??
    (user.is_active ? 'true' : 'false');

  return (
    <div className="w-full max-w-lg space-y-6">
      <form action={formAction} className="space-y-4 rounded-md bg-gray-50 p-6">
        {!state.success && state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}

        <div>
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input
            id="username"
            name="username"
            defaultValue={(state.payload?.get('username') as string) ?? user.username}
            aria-describedby="username-error"
          />
          <FieldErrorDisplay id="username-error" errors={state.errors?.username} />
        </div>

        <div>
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            name="name"
            defaultValue={(state.payload?.get('name') as string) ?? user.name}
            aria-describedby="name-error"
          />
          <FieldErrorDisplay id="name-error" errors={state.errors?.name} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={(state.payload?.get('email') as string) ?? user.email}
            aria-describedby="email-error"
          />
          <FieldErrorDisplay id="email-error" errors={state.errors?.email} />
        </div>

        <div>
          <Label htmlFor="role">Rol</Label>
          <select
            id="role"
            name="role"
            defaultValue={(state.payload?.get('role') as UserRole) ?? user.role}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="admin">Administrador</option>
            <option value="customer">Cliente</option>
          </select>
          <FieldErrorDisplay id="role-error" errors={state.errors?.role} />
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium">Estado</legend>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="is-active"
                value="true"
                defaultChecked={isActiveValue === 'true'}
              />
              Activo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="is-active"
                value="false"
                defaultChecked={isActiveValue === 'false'}
              />
              Inactivo
            </label>
          </div>
          <FieldErrorDisplay id="is-active-error" errors={state.errors?.isActive} />
        </fieldset>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/users">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>

      <ResetPasswordButton userId={user.id} />
    </div>
  );
}
