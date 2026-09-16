'use client';

import { type ReactNode, useState, useTransition } from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export const ICON_ACTION_BUTTON_CLASS = 'size-11 md:size-9';

type ConfirmDeleteButtonProps = {
  ariaLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  action?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  variant?: 'outline' | 'ghost';
  className?: string;
  icon?: ReactNode;
  label?: string;
};

export function ConfirmDeleteButton({
  ariaLabel,
  title,
  description,
  confirmLabel = 'Eliminar',
  action,
  onConfirm,
  variant = 'outline',
  className,
  icon,
  label,
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      if (action) {
        await action();
      } else if (onConfirm) {
        await onConfirm();
      }
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {label ? (
          <Button
            type="button"
            variant={variant}
            aria-label={ariaLabel}
            className={className}
          >
            {icon}
            {label}
          </Button>
        ) : (
          <Button
            type="button"
            variant={variant}
            size="icon"
            aria-label={ariaLabel}
            className={cn(ICON_ACTION_BUTTON_CLASS, className)}
          >
            {icon ?? <Trash className="size-4" aria-hidden="true" />}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? 'Eliminando...' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
