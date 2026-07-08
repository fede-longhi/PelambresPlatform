'use client';

import { updateUser, type UserFormState } from '@/lib/actions/user-actions';
import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import ResetPasswordButton from './reset-password-button';
import CustomerLinkSection from './customer-link-section';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { composeUserFullName } from '@/lib/utils';
import type { UserListItem, UserRole } from '@/types/user-definitions';
import type { CustomerField } from '@/components/shared/customer-select-field';

export default function EditUserForm({
  user,
  linkedCustomer,
  redirect,
}: {
  user: UserListItem;
  linkedCustomer?: CustomerField;
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
  const [role, setRole] = useState<UserRole>(user.role);
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [username, setUsername] = useState(user.username);
  const [isActive, setIsActive] = useState<'true' | 'false'>(
    user.is_active ? 'true' : 'false'
  );

  useEffect(() => {
    if (!state.formValues) {
      return;
    }

    setRole(state.formValues.role);
    setEmail(state.formValues.email);
    setFirstName(state.formValues.firstName);
    setLastName(state.formValues.lastName);
    setUsername(state.formValues.username);
    if (state.formValues.isActive) {
      setIsActive(state.formValues.isActive);
    }
  }, [state.formValues]);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Usuario actualizado',
        description: 'Los cambios se guardaron correctamente.',
        variant: 'success',
      });
    }
  }, [state.message, toast]);

  return (
    <div className="w-full max-w-lg space-y-6">
      <form action={formAction} noValidate className="space-y-4 rounded-md bg-gray-50 p-6">
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
            aria-describedby="username-error"
          />
          <FieldErrorDisplay id="username-error" errors={state.errors?.username} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              aria-describedby="first-name-error"
            />
            <FieldErrorDisplay id="first-name-error" errors={state.errors?.firstName} />
          </div>

          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              aria-describedby="last-name-error"
            />
            <FieldErrorDisplay id="last-name-error" errors={state.errors?.lastName} />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            userName={composeUserFullName(firstName, lastName)}
            defaultCustomer={linkedCustomer}
            errors={{
              customerId: state.errors?.customerId,
              customerPhone: state.errors?.customerPhone,
              customerFirstName: state.errors?.customerFirstName,
              customerLastName: state.errors?.customerLastName,
              customerName: state.errors?.customerName,
            }}
          />
        )}

        <fieldset>
          <legend className="mb-2 block text-sm font-medium">Estado</legend>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="is-active"
                value="true"
                checked={isActive === 'true'}
                onChange={() => setIsActive('true')}
              />
              Activo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="is-active"
                value="false"
                checked={isActive === 'false'}
                onChange={() => setIsActive('false')}
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
