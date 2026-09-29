'use client';

import Link from 'next/link';
import RowActionsMenu from '@/components/shared/row-actions-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function QuoteRequestRowActions({
  quoteRequestId,
  quoteName,
}: {
  quoteRequestId: string;
  quoteName: string;
}) {
  return (
    <RowActionsMenu label={`Acciones de ${quoteName}`}>
      <DropdownMenuItem asChild>
        <Link href={`/admin/quotes/create?quoteRequestId=${quoteRequestId}`}>
          Crear presupuesto
        </Link>
      </DropdownMenuItem>
    </RowActionsMenu>
  );
}
