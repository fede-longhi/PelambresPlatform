'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import RowActionsMenu from '@/components/shared/row-actions-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { deleteQuoteRequest } from '@/lib/actions/quote-actions';
import { useToast } from '@/hooks/use-toast';

export default function QuoteRequestRowActions({
  quoteRequestId,
  quoteName,
}: {
  quoteRequestId: string;
  quoteName: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteQuoteRequest(quoteRequestId);

      if (!result.success) {
        toast({
          title: 'No se pudo borrar',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      setConfirmOpen(false);
      toast({
        title: 'Solicitud borrada',
        description: 'La solicitud se eliminó de forma definitiva.',
        variant: 'success',
      });
    });
  }

  return (
    <>
      <RowActionsMenu label={`Acciones de ${quoteName}`}>
        <DropdownMenuItem asChild>
          <Link href={`/admin/quotes/create?quoteRequestId=${quoteRequestId}`}>
            Crear presupuesto
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={() => setConfirmOpen(true)}
        >
          Borrar
        </DropdownMenuItem>
      </RowActionsMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar esta solicitud?</AlertDialogTitle>
            <AlertDialogDescription>
              Se elimina {quoteName} de forma definitiva, junto con sus
              archivos. Los presupuestos ya creados se conservan, pero dejan de
              estar vinculados a esta solicitud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? 'Borrando...' : 'Borrar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
