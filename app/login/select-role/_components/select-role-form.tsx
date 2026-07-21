'use client';

import { useActionState } from 'react';
import { completeAccountSelection, type AuthenticateState } from '@/lib/actions/auth-actions';
import { ROLE_SELECTION_LABELS } from '@/lib/auth/role-labels';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { UserRole } from '@/types/user-definitions';

export default function SelectRoleForm({
  selectionToken,
  accounts,
}: {
  selectionToken: string;
  accounts: Array<{ userId: string; role: UserRole; name: string }>;
}) {
  const [state, formAction, isPending] = useActionState<AuthenticateState, FormData>(
    completeAccountSelection,
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="selectionToken" value={selectionToken} />
      {accounts.map((account) => (
        <button
          key={account.userId}
          type="submit"
          name="userId"
          value={account.userId}
          disabled={isPending}
          className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 text-left text-sm transition hover:border-primary hover:bg-primary/5"
        >
          <span>
            <span className="block font-medium">{ROLE_SELECTION_LABELS[account.role]}</span>
            <span className="text-muted-foreground">{account.name}</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </button>
      ))}
      {state?.status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <ExclamationCircleIcon className="h-5 w-5" />
          <p>{state.message}</p>
        </div>
      )}
    </form>
  );
}
