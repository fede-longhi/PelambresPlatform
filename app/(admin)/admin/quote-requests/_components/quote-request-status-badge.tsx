import { Badge } from '@/components/ui/badge';
import {
  getQuoteRequestStatusBadgeClass,
  getQuoteRequestStatusLabel,
} from '@/lib/consts/quote-request-consts';

export default function QuoteRequestStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={getQuoteRequestStatusBadgeClass(status)}
    >
      {getQuoteRequestStatusLabel(status)}
    </Badge>
  );
}
