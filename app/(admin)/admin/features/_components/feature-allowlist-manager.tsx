'use client';

import { useActionState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  addUserToFeatureAllowlist,
  removeUserFromFeatureAllowlist,
  type FeatureAllowlistFormState,
} from '@/lib/actions/feature-flag-actions';
import type { FeatureFlagAllowlistUser } from '@/types/feature-flag-definitions';

type FeatureAllowlistManagerProps = {
  featureKey: string;
  users: FeatureFlagAllowlistUser[];
};

const initialState: FeatureAllowlistFormState = {
  message: null,
  success: undefined,
};

export function FeatureAllowlistManager({
  featureKey,
  users,
}: FeatureAllowlistManagerProps) {
  const addAction = addUserToFeatureAllowlist.bind(null, featureKey);
  const [state, formAction, isPending] = useActionState(addAction, initialState);

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold">Lista de acceso</h2>
        <p className="text-sm text-muted-foreground">
          Usuarios que pueden ver esta feature aunque no esté visible para todos.
          Los administradores siempre tienen acceso.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`allowlist-email-${featureKey}`}>Email del usuario</Label>
          <Input
            id={`allowlist-email-${featureKey}`}
            name="email"
            type="email"
            placeholder="usuario@email.com"
            required
            disabled={isPending}
            aria-invalid={Boolean(state.errors?.email)}
          />
          {state.errors?.email ? (
            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={isPending}>
          Agregar
        </Button>
      </form>

      {state.message ? (
        <p
          className={`text-sm ${state.success ? 'text-emerald-700' : 'text-destructive'}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay usuarios en la lista.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {users.map((user) => (
            <li
              key={user.userId}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name || user.username}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email} · {user.role}
                </p>
              </div>
              <form
                action={removeUserFromFeatureAllowlist.bind(
                  null,
                  featureKey,
                  user.userId
                )}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Quitar a ${user.email} de la lista`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
