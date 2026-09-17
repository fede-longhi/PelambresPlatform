import { OrderStatus, OrderStatuses } from '@/types/order-definitions';
import { AdvanceStep, GoBackStep } from './buttons';
import OrderStatusField from './status-field';

export function OrderStatusEditField({
  id,
  status,
}: {
  id?: string;
  status?: OrderStatus;
}) {
  if (!id || !status) return null;

  const previousStep = OrderStatuses[status].previous;
  const nextStep = OrderStatuses[status].next;

  return (
    <div className="flex flex-row items-center justify-stretch">
      {previousStep ? (
        <GoBackStep id={id} status={status} />
      ) : (
        <span className="h-6 w-6" />
      )}
      <OrderStatusField className="mx-4" statusName={status} />
      {nextStep ? (
        <AdvanceStep id={id} status={status} />
      ) : (
        <span className="h-6 w-6" />
      )}
    </div>
  );
}
