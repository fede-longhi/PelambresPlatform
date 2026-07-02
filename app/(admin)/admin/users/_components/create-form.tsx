'use client';

import { createUser, type UserFormState } from '@/lib/actions/user-actions';
import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import TempPasswordDisplay from './temp-password-display';
import CustomerLinkSection from './customer-link-section';
import Link from 'next/link';
import type { UserRole } from '@/types/user-definitions';

export default function CreateUserForm() {
  const initialState: UserFormState = { message: null, errors: {}, success: false };
  const [state, formAction, isPending] = useActionState(createUser, initialState);
  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!state.formValues) {
      return;
    }

    setRole(state.formValues.role);
    setEmail(state.formValues.email);
    setName(state.formValues.name);
    setUsername(state.formValues.username);
  }, [state.formValues]);

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
    <form action={formAction} noValidate className="w-full max-w-lg space-y-4 rounded-md bg-gray-50 p-6">
      <input type="hidden" name="role" value={role} />

      {!state.success && state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div>
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
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
          value={name}
          onChange={(event) => setName(event.target.value)}
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="usuario@ejemplo.com"
          aria-describedby="email-error"
        />
        <FieldErrorDisplay id="email-error" errors={state.errors?.email} />
      </div>

      <div>
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="admin">Administrador</option>
          <option value="customer">Cliente</option>
        </select>
        <FieldErrorDisplay id="role-error" errors={state.errors?.role} />
      </div>

      {role === 'customer' && (
        <CustomerLinkSection
          userEmail={email}
          userName={name}
          errors={{
            customerId: state.errors?.customerId,
            customerPhone: state.errors?.customerPhone,
            customerFirstName: state.errors?.customerFirstName,
            customerLastName: state.errors?.customerLastName,
            customerName: state.errors?.customerName,
          }}
        />
      )}

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
