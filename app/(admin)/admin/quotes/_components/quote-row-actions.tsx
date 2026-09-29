'use client';

import {
  QUOTE_DOCUMENT_STATUSES,
  type QuoteDocumentStatus,
} from '@/lib/consts/quote-document-consts';
import QuoteStatusBadge from './quote-status-badge';
import QuoteDocumentStatusForm from './quote-status-form';

function isQuoteDocumentStatus(status: string): status is QuoteDocumentStatus {
  return (QUOTE_DOCUMENT_STATUSES as readonly string[]).includes(status);
}

export default function QuoteStatusAction({
  quoteId,
  status,
}: {
  quoteId: string;
  status: string;
}) {
  const quoteStatus = isQuoteDocumentStatus(status) ? status : null;

  if (!quoteStatus) {
    return <QuoteStatusBadge status={status} />;
  }

  return <QuoteDocumentStatusForm inline quoteId={quoteId} status={quoteStatus} />;
}
