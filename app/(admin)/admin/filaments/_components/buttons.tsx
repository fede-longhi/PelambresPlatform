'use client';

import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogButton } from '@/components/ui/dialog-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteFilament } from '@/lib/actions/filament-actions';
import type { Filament } from '@/types/definitions';
import FilamentForm from './filament-form';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';

export function CreateFilamentButton() {
  const [open, setOpen] = useState(false);

  return (
    <DialogButton
      title="Nuevo filamento"
      description="Agrega un material al catálogo del taller."
      label="Nuevo filamento"
      icon={<Plus className="size-4" aria-hidden="true" />}
      open={open}
      onOpenChange={setOpen}
    >
      <FilamentForm key={open ? 'create-open' : 'create-closed'} onSuccess={() => setOpen(false)} />
    </DialogButton>
  );
}

export function EditFilamentButton({ filament }: { filament: Filament }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 md:size-9"
          aria-label={`Editar filamento ${filament.brand} ${filament.type}`}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar filamento</DialogTitle>
          <DialogDescription>
            {filament.brand} · {filament.type}
          </DialogDescription>
        </DialogHeader>
        <FilamentForm
          key={open ? filament.id : 'closed'}
          filament={filament}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function DeleteFilamentButton({ filament }: { filament: Filament }) {
  const deleteFilamentWithId = deleteFilament.bind(
    null,
    filament.id,
    '/admin/filaments'
  );

  return (
    <ConfirmDeleteButton
      variant="ghost"
      className="text-destructive hover:text-destructive"
      ariaLabel={`Eliminar filamento ${filament.brand} ${filament.type}`}
      title="Eliminar filamento"
      description={`Se eliminará ${filament.brand} ${filament.type} del catálogo.`}
      action={deleteFilamentWithId}
    />
  );
}
