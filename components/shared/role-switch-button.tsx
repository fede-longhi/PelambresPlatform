'use client';

import { useFormStatus } from 'react-dom';
import { ArrowLeftRight } from 'lucide-react';
import { ROLE_SELECTION_LABELS } from '@/lib/auth/account-selection';
import { switchRoleAccountForUser } from '@/lib/actions/role-switch-actions';
import type { UserRole } from '@/types/user-definitions';

function RoleSwitchSubmitButton({ targetRole }: { targetRole: UserRole }) {
  const { pending } = useFormStatus();
  const label =
    targetRole === 'customer'
      ? `Cambiar a ${ROLE_SELECTION_LABELS.customer}`
      : `Cambiar a ${ROLE_SELECTION_LABELS.admin}`;

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-[48px] w-full items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
    >
      <ArrowLeftRight className="h-6 w-6 shrink-0" />
      <span className="text-left">{pending ? 'Cambiando...' : label}</span>
    </button>
  );
}

export default function RoleSwitchButton({
  targetUserId,
  targetRole,
}: {
  targetUserId: string;
  targetRole: UserRole;
}) {
  const switchAction = switchRoleAccountForUser.bind(null, targetUserId);

  return (
    <form action={switchAction}>
      <RoleSwitchSubmitButton targetRole={targetRole} />
    </form>
  );
}
