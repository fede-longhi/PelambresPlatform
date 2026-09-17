import { advanceStep, deleteOrder, goBackStep } from '@/lib/actions/order-actions';
import { OrderStatus } from '@/types/order-definitions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Pencil, Plus, StepBack, StepForward } from 'lucide-react';
import Link from 'next/link';

export function GoBackStep({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const goBackStepWithFields = goBackStep.bind(null, id, status);
  return (
    <form action={goBackStepWithFields}>
      <Button
        type="submit"
        variant="outline"
        size="icon"
        aria-label="Paso anterior"
        className="size-11 rounded-full hover:bg-primary hover:text-primary-foreground md:size-9"
      >
        <StepBack aria-hidden="true" />
      </Button>
    </form>
  );
}

export function AdvanceStep({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const advanceStepWithFields = advanceStep.bind(null, id, status);
  return (
    <form action={advanceStepWithFields}>
      <Button
        type="submit"
        variant="outline"
        size="icon"
        aria-label="Paso siguiente"
        className="size-11 rounded-full hover:bg-primary hover:text-primary-foreground md:size-9"
      >
        <StepForward aria-hidden="true" />
      </Button>
    </form>
  );
}

export function CreateOrder() {
  return (
    <Button asChild>
      <Link href="/admin/orders/create">
        <Plus className="mr-2 size-4" aria-hidden="true" />
        Nuevo pedido
      </Link>
    </Button>
  );
}

export function DeleteOrder({
  id,
  trackingCode,
  hasPrintJobs = false,
}: {
  id: string;
  trackingCode?: string;
  hasPrintJobs?: boolean;
}) {
  if (hasPrintJobs) {
    return (
      <p className="self-center text-sm text-muted-foreground">
        No se puede eliminar un pedido con trabajos de impresión.
      </p>
    );
  }

  const deleteOrderWithId = deleteOrder.bind(null, id);
  const codeLabel = trackingCode ? ` ${trackingCode}` : '';

  return (
    <ConfirmDeleteButton
      variant="outline"
      className="text-destructive hover:text-destructive"
      label="Eliminar"
      ariaLabel={`Eliminar pedido${codeLabel}`}
      title="Eliminar pedido"
      description={`Se va a eliminar el pedido${codeLabel}. Esta acción no se puede deshacer.`}
      action={deleteOrderWithId}
    />
  );
}

export function EditOrder({
  id,
  className,
  label,
}: {
  id: string;
  className?: string;
  label?: string;
}) {
  if (label) {
    return (
      <Button asChild variant="outline" className={className}>
        <Link href={`/admin/orders/${id}/edit`}>
          <Pencil className="mr-2 size-4" aria-hidden="true" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Link
      href={`/admin/orders/${id}/edit`}
      aria-label="Editar pedido"
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-md border md:size-9',
        className
      )}
    >
      <Pencil size={16} aria-hidden="true" />
    </Link>
  );
}
