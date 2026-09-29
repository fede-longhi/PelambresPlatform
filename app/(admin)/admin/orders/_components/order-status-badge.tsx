import { Badge } from '@/components/ui/badge';
import {
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
} from '@/lib/consts/order-list-consts';

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={getOrderStatusBadgeClass(status)}
    >
      {getOrderStatusLabel(status)}
    </Badge>
  );
}
