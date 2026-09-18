import { Badge } from '@/components/ui/badge';
import {
  getOrderPaymentBadgeClass,
  getOrderPaymentStatusLabel,
} from '@/lib/consts/order-payment-consts';
import type { OrderPaymentStatus } from '@/types/order-definitions';

export default function OrderPaymentBadge({
  status,
}: {
  status: OrderPaymentStatus | string | null | undefined;
}) {
  const paymentStatus = status ?? 'pending';

  return (
    <Badge
      variant={paymentStatus === 'pending' ? 'secondary' : 'outline'}
      className={getOrderPaymentBadgeClass(paymentStatus)}
    >
      {getOrderPaymentStatusLabel(paymentStatus)}
    </Badge>
  );
}
