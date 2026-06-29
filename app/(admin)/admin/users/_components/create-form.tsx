'use client';

import { createUser, type UserFormState } from '@/lib/actions/user-actions';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import TempPasswordDisplay from './temp-password-display';
import Link from 'next/link';
import type { UserRole } from '@/types/user-definitions';

export default function CreateUserForm() {
  const initialState: UserFormState = { message: null, errors: {}, success: false };
  const [state, formAction, isPending] = useActionState(createUser, initialState);

  if (state.success && state.tempPassword) {
    return (
      <div className="w-full max-w-lg space-y-4 rounded-md bg-gray-50 p-6">
        <h2 className="text-lg font-medium text-green-700">Usuario creado</h2>
        <p className="text-sm text-muted-foreground">
          {state.user?.name} ({state.user?.email}) fue creado correctamente.
        </p>
        <TempPasswordDisplay tempPassword={state.tempPassword} />
        <div className="flex gap-2 pt-2">
          <Button asChild>
            <Link href="/admin/users">Volver al listado</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/users/create">Crear otro</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-lg space-y-4 rounded-md bg-gray-50 p-6">
      {!state.success && state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div>
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          name="username"
          defaultValue={(state.payload?.get('username') as string) ?? ''}
          placeholder="ej. federico"
          aria-describedby="username-error"
        />
        <FieldErrorDisplay id="username-error" errors={state.errors?.username} />
      </div>

      <div>
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          name="name"
          defaultValue={(state.payload?.get('name') as string) ?? ''}
          placeholder="Nombre y apellido"
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
          defaultValue={(state.payload?.get('email') as string) ?? ''}
          placeholder="usuario@ejemplo.com"
          aria-describedby="email-error"
        />
        <FieldErrorDisplay id="email-error" errors={state.errors?.email} />
      </div>

      <div>
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          name="role"
          defaultValue={(state.payload?.get('role') as UserRole) ?? 'admin'}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="admin">Administrador</option>
          <option value="customer">Cliente</option>
        </select>
        <FieldErrorDisplay id="role-error" errors={state.errors?.role} />
      </div>

      <p className="text-xs text-muted-foreground">
        Se generará una contraseña temporal que deberás compartir con el usuario de forma segura.
      </p>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/users">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creando...' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  );
}
