import { Badge } from '@/components/ui/badge';
import {
  getQuoteDocumentStatusBadgeClass,
  getQuoteDocumentStatusLabel,
} from '@/lib/consts/quote-document-consts';

export default function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={status === 'draft' ? 'secondary' : 'outline'}
      className={getQuoteDocumentStatusBadgeClass(status)}
    >
      {getQuoteDocumentStatusLabel(status)}
    </Badge>
  );
}
