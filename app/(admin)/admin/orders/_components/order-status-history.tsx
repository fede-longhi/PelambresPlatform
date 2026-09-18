import { formatDateTimeToLocal } from '@/lib/utils';
import { OrderStatuses } from '@/types/order-definitions';
import type { OrderStatusEvent } from '@/types/order-definitions';

export default function OrderStatusHistory({
  events,
}: {
  events: OrderStatusEvent[];
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay cambios de estado registrados.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => {
        const fromLabel = event.fromStatus
          ? OrderStatuses[event.fromStatus].label
          : 'Creado';
        const toLabel = OrderStatuses[event.toStatus].label;

        return (
          <li key={event.id} className="text-sm">
            <p className="font-medium">
              {fromLabel} → {toLabel}
            </p>
            <p className="text-muted-foreground">
              {formatDateTimeToLocal(event.createdAt, 'es-AR')}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
